require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { buildCROAuditPrompt, LIFT_CATEGORIES } = require('./prompt');

const app = express();
const PORT = 8787;
const MAX_REQUEST_SIZE = 100000; // 100KB limit for request body
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per IP

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

if (!process.env.OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY not set. Server will not work properly.');
}

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

// Simple in-memory rate limiting
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

// Middleware
app.use(cors());
app.use(express.json({ limit: MAX_REQUEST_SIZE }));

// Request size validation middleware
app.use((req, res, next) => {
  const contentLength = req.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
    return res.status(413).json({ error: 'Request too large' });
  }
  next();
});

// Rate limiting middleware
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please try again later.'
    });
  }
  next();
});

// Validate and fix audit structure
function validateAuditStructure(audit, url) {
  // Ensure basic fields
  if (!audit.url) audit.url = url || 'Unknown';
  if (!audit.analyzedAt) audit.analyzedAt = new Date().toISOString();
  if (typeof audit.overallScore !== 'number') audit.overallScore = 50;
  audit.overallScore = Math.max(0, Math.min(100, Math.round(audit.overallScore)));

  // Ensure liftCategories exists with all required categories
  if (!audit.liftCategories || typeof audit.liftCategories !== 'object') {
    audit.liftCategories = {};
  }

  const categoryKeys = ['valueProposition', 'clarity', 'relevance', 'anxiety', 'distraction', 'urgency'];

  for (const key of categoryKeys) {
    const template = LIFT_CATEGORIES[key];
    if (!audit.liftCategories[key]) {
      audit.liftCategories[key] = {
        name: template.name,
        shortName: template.shortName,
        score: 50,
        description: template.description,
        isInhibitor: template.isInhibitor || false,
        assertions: []
      };
    }

    const cat = audit.liftCategories[key];

    // Ensure category has required fields
    if (!cat.name) cat.name = template.name;
    if (!cat.shortName) cat.shortName = template.shortName;
    if (!cat.description) cat.description = template.description;
    if (template.isInhibitor) cat.isInhibitor = true;
    if (typeof cat.score !== 'number') cat.score = 50;
    cat.score = Math.max(0, Math.min(100, Math.round(cat.score)));

    // Ensure assertions is an array
    if (!Array.isArray(cat.assertions)) cat.assertions = [];

    // Validate each assertion
    cat.assertions = cat.assertions.map(assertion => {
      return {
        id: assertion.id || 'UNKNOWN',
        name: assertion.name || 'Unknown',
        question: assertion.question || '',
        status: ['pass', 'fail', 'warning'].includes(assertion.status) ? assertion.status : 'warning',
        severity: ['critical', 'high', 'medium', 'low'].includes(assertion.severity) ? assertion.severity : 'medium',
        evidence: assertion.evidence || 'No evidence provided',
        recommendation: assertion.status === 'pass' ? null : (assertion.recommendation || null)
      };
    });
  }

  // Ensure criticalIssues is an array
  if (!Array.isArray(audit.criticalIssues)) {
    audit.criticalIssues = [];
    // Auto-generate from failed critical/high assertions
    for (const [key, cat] of Object.entries(audit.liftCategories)) {
      for (const assertion of cat.assertions) {
        if (assertion.status === 'fail' && ['critical', 'high'].includes(assertion.severity)) {
          audit.criticalIssues.push({
            id: assertion.id,
            category: cat.name,
            title: assertion.evidence?.substring(0, 100) || assertion.name,
            impact: assertion.severity
          });
        }
      }
    }
    // Limit to top 5
    audit.criticalIssues = audit.criticalIssues.slice(0, 5);
  }

  // Ensure quickWins is an array
  if (!Array.isArray(audit.quickWins)) {
    audit.quickWins = [];
  }
  audit.quickWins = audit.quickWins.map(win => ({
    title: win.title || 'Quick win',
    current: win.current || 'Current state',
    suggested: win.suggested || 'Suggested change',
    effort: ['easy', 'medium', 'hard'].includes(win.effort) ? win.effort : 'easy',
    impact: ['high', 'medium', 'low'].includes(win.impact) ? win.impact : 'medium'
  }));

  // Ensure tests is an array
  if (!Array.isArray(audit.tests)) {
    audit.tests = [];
  }
  audit.tests = audit.tests.map((test, index) => {
    // Calculate PXL score from factors
    let pxlScore = 0;
    const factors = test.pxlFactors || {};
    if (factors.aboveFold) pxlScore += 15;
    if (factors.noticeableIn5Sec) pxlScore += 15;
    if (factors.runOnHighTraffic) pxlScore += 15;
    if (factors.affectsAllUsers) pxlScore += 15;
    if (factors.easyToImplement) pxlScore += 20;
    if (factors.evidenceBacked) pxlScore += 20;

    return {
      id: test.id || index + 1,
      priority: ['critical', 'high', 'medium', 'low'].includes(test.priority) ? test.priority : 'medium',
      pxlScore: test.pxlScore || pxlScore,
      title: test.title || 'A/B Test',
      hypothesis: test.hypothesis || '',
      assertionId: test.assertionId || '',
      category: test.category || '',
      variants: Array.isArray(test.variants) ? test.variants : [
        { name: 'Control', description: 'Current state' },
        { name: 'Variant A', description: 'Proposed change' }
      ],
      expectedImpact: ['high', 'medium', 'low'].includes(test.expectedImpact) ? test.expectedImpact : 'medium',
      implementationEffort: ['easy', 'medium', 'hard'].includes(test.implementationEffort) ? test.implementationEffort : 'medium',
      pxlFactors: {
        aboveFold: !!factors.aboveFold,
        noticeableIn5Sec: !!factors.noticeableIn5Sec,
        runOnHighTraffic: !!factors.runOnHighTraffic,
        affectsAllUsers: !!factors.affectsAllUsers,
        easyToImplement: !!factors.easyToImplement,
        evidenceBacked: !!factors.evidenceBacked
      }
    };
  });

  // Sort tests by PXL score
  audit.tests.sort((a, b) => b.pxlScore - a.pxlScore);

  return audit;
}

// Generate CRO audit using OpenAI
async function generateCROAudit(snapshot, retry = false) {
  const prompt = buildCROAuditPrompt(snapshot);
  const url = snapshot.url || snapshot.location || 'Unknown';

  try {
    console.log(`[Audit] Starting analysis for: ${url}`);
    console.log(`[Audit] Using model: ${OPENAI_MODEL}`);

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a senior CRO specialist. Return ONLY valid JSON matching the exact structure requested. All text must be in English. Be specific and evidence-based in your analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 8000
    });

    const content = completion.choices[0].message.content;
    console.log(`[Audit] Received response, parsing JSON...`);

    // Parse JSON
    let audit;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      audit = JSON.parse(cleaned);
    } catch (parseError) {
      console.error(`[Audit] JSON parse error:`, parseError.message);
      if (!retry) {
        console.log(`[Audit] Retrying with stricter instructions...`);
        return generateCROAudit(snapshot, true);
      }
      throw new Error(`Invalid JSON response: ${parseError.message}`);
    }

    // Validate and fix structure
    audit = validateAuditStructure(audit, url);

    console.log(`[Audit] Analysis complete. Overall score: ${audit.overallScore}`);
    return audit;

  } catch (error) {
    console.error(`[Audit] Error:`, error.message);
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    throw error;
  }
}

// POST /analyze endpoint
app.post('/analyze', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API key not configured. Set OPENAI_API_KEY environment variable.'
      });
    }

    const snapshot = req.body;

    // Basic validation
    if (!snapshot || typeof snapshot !== 'object') {
      return res.status(400).json({ error: 'Invalid snapshot data' });
    }

    console.log(`[Request] Received analysis request`);
    console.log(`[Request] Snapshot keys:`, Object.keys(snapshot));

    // Generate audit
    const audit = await generateCROAudit(snapshot);

    res.json(audit);

  } catch (error) {
    console.error('[Request] Analysis error:', error);
    res.status(500).json({
      error: error.message || 'Internal server error during analysis'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    model: OPENAI_MODEL,
    hasApiKey: !!process.env.OPENAI_API_KEY
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Using OpenAI model: ${OPENAI_MODEL}`);
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY not set!');
  } else {
    console.log(`API key ending with: ...${process.env.OPENAI_API_KEY.slice(-4)}`);
  }
});
