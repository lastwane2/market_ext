// Professional CRO Audit Prompt - LIFT Model + PXL Framework
// For serious CRO specialists and conversion optimization professionals

const LIFT_CATEGORIES = {
  valueProposition: {
    name: 'Value Proposition',
    shortName: 'VP',
    description: 'Why should visitors choose you over alternatives?',
    assertions: [
      { id: 'VP_CLEAR', name: 'Clear Value', question: 'Is the value proposition clear within 5 seconds?', severity: 'critical' },
      { id: 'VP_UNIQUE', name: 'Differentiation', question: 'Is there clear differentiation from competitors?', severity: 'high' },
      { id: 'VP_BENEFIT', name: 'Benefits vs Features', question: 'Are benefits emphasized over features?', severity: 'medium' },
      { id: 'VP_SPECIFIC', name: 'Specificity', question: 'Are claims specific and quantifiable?', severity: 'medium' }
    ]
  },
  clarity: {
    name: 'Clarity',
    shortName: 'CL',
    description: 'How quickly can visitors understand your offering?',
    assertions: [
      { id: 'CL_HIERARCHY', name: 'Visual Hierarchy', question: 'Is visual hierarchy clear and guides the eye?', severity: 'high' },
      { id: 'CL_HEADLINE', name: 'Headline Clarity', question: 'Is the headline understandable without context?', severity: 'high' },
      { id: 'CL_CTA', name: 'CTA Clarity', question: 'Does CTA clearly communicate what happens next?', severity: 'critical' },
      { id: 'CL_FLOW', name: 'Content Flow', question: 'Is the page structure logical?', severity: 'medium' },
      { id: 'CL_LANGUAGE', name: 'Language Simplicity', question: 'Is the language free of jargon and easy to understand?', severity: 'medium' }
    ]
  },
  relevance: {
    name: 'Relevance',
    shortName: 'RL',
    description: 'Does the page match visitor expectations?',
    assertions: [
      { id: 'RL_MESSAGE', name: 'Message Match', question: 'Does page content match the traffic source promise?', severity: 'critical' },
      { id: 'RL_AUDIENCE', name: 'Audience Fit', question: 'Does the language match target audience?', severity: 'high' },
      { id: 'RL_INTENT', name: 'Intent Match', question: 'Does page serve the user intent?', severity: 'high' },
      { id: 'RL_CONTEXT', name: 'Contextual Relevance', question: 'Is the content contextually appropriate for the visitor stage?', severity: 'medium' }
    ]
  },
  anxiety: {
    name: 'Anxiety',
    shortName: 'AX',
    description: 'Trust inhibitors that prevent conversion',
    isInhibitor: true,
    assertions: [
      { id: 'AX_SOCIAL', name: 'Social Proof', question: 'Are there credible social proof elements?', severity: 'critical' },
      { id: 'AX_TRUST', name: 'Trust Signals', question: 'Are trust badges and security indicators present?', severity: 'high' },
      { id: 'AX_RISK', name: 'Risk Reversal', question: 'Is the perceived risk minimized?', severity: 'high' },
      { id: 'AX_CONTACT', name: 'Contact Access', question: 'Can visitors easily reach support?', severity: 'medium' },
      { id: 'AX_PRIVACY', name: 'Privacy Assurance', question: 'Are privacy concerns addressed?', severity: 'low' },
      { id: 'AX_CREDIBILITY', name: 'Credibility Markers', question: 'Are there authority/expertise indicators?', severity: 'high' }
    ]
  },
  distraction: {
    name: 'Distraction',
    shortName: 'DI',
    description: 'Elements that divert from the conversion goal',
    isInhibitor: true,
    assertions: [
      { id: 'DI_FOCUS', name: 'Single Goal', question: 'Does the page have one clear conversion goal?', severity: 'critical' },
      { id: 'DI_NAV', name: 'Navigation', question: 'Is navigation minimized to reduce exit points?', severity: 'medium' },
      { id: 'DI_LINKS', name: 'Outbound Links', question: 'Are outbound links minimized?', severity: 'low' },
      { id: 'DI_VISUAL', name: 'Visual Noise', question: 'Is the design clean without visual clutter?', severity: 'medium' },
      { id: 'DI_COMPETING', name: 'Competing CTAs', question: 'Is there a single primary CTA without competing actions?', severity: 'high' }
    ]
  },
  urgency: {
    name: 'Urgency',
    shortName: 'UR',
    description: 'Motivation to act now rather than later',
    assertions: [
      { id: 'UR_SCARCITY', name: 'Scarcity', question: 'Are there legitimate scarcity elements?', severity: 'medium' },
      { id: 'UR_INCENTIVE', name: 'Time Incentive', question: 'Is there a reason to act now?', severity: 'high' },
      { id: 'UR_LOSS', name: 'Loss Aversion', question: 'Is the cost of inaction communicated?', severity: 'medium' }
    ]
  }
};

// JSON Schema for the audit output
const auditOutputSchema = {
  type: 'object',
  properties: {
    url: { type: 'string' },
    analyzedAt: { type: 'string' },
    overallScore: { type: 'integer', minimum: 0, maximum: 100 },
    liftCategories: {
      type: 'object',
      properties: {
        valueProposition: { $ref: '#/definitions/category' },
        clarity: { $ref: '#/definitions/category' },
        relevance: { $ref: '#/definitions/category' },
        anxiety: { $ref: '#/definitions/category' },
        distraction: { $ref: '#/definitions/category' },
        urgency: { $ref: '#/definitions/category' }
      },
      required: ['valueProposition', 'clarity', 'relevance', 'anxiety', 'distraction', 'urgency']
    },
    criticalIssues: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          category: { type: 'string' },
          title: { type: 'string' },
          impact: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] }
        }
      }
    },
    quickWins: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          current: { type: 'string' },
          suggested: { type: 'string' },
          effort: { type: 'string', enum: ['easy', 'medium', 'hard'] },
          impact: { type: 'string', enum: ['high', 'medium', 'low'] }
        }
      }
    },
    tests: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          pxlScore: { type: 'integer', minimum: 0, maximum: 100 },
          title: { type: 'string' },
          hypothesis: { type: 'string' },
          assertionId: { type: 'string' },
          category: { type: 'string' },
          variants: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' }
              }
            }
          },
          expectedImpact: { type: 'string', enum: ['high', 'medium', 'low'] },
          implementationEffort: { type: 'string', enum: ['easy', 'medium', 'hard'] },
          pxlFactors: {
            type: 'object',
            properties: {
              aboveFold: { type: 'boolean' },
              noticeableIn5Sec: { type: 'boolean' },
              runOnHighTraffic: { type: 'boolean' },
              affectsAllUsers: { type: 'boolean' },
              easyToImplement: { type: 'boolean' },
              evidenceBacked: { type: 'boolean' }
            }
          }
        }
      }
    }
  },
  definitions: {
    category: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        shortName: { type: 'string' },
        score: { type: 'integer', minimum: 0, maximum: 100 },
        description: { type: 'string' },
        isInhibitor: { type: 'boolean' },
        assertions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              question: { type: 'string' },
              status: { type: 'string', enum: ['pass', 'fail', 'warning'] },
              severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
              evidence: { type: 'string' },
              recommendation: { type: ['string', 'null'] }
            }
          }
        }
      }
    }
  }
};

function buildCROAuditPrompt(snapshot) {
  const snapshotJson = JSON.stringify(snapshot, null, 2);

  return `You are a senior CRO (Conversion Rate Optimization) specialist conducting a professional audit using the LIFT Model framework combined with PXL prioritization methodology.

## YOUR ROLE
You are performing a comprehensive CRO audit for experienced conversion optimization professionals. Your audience understands frameworks like LIFT Model, PXL, ICE scoring, and expects data-driven, evidence-based analysis. Do NOT oversimplify or provide generic advice.

## FRAMEWORK: LIFT MODEL
The LIFT Model evaluates landing pages across 6 factors:

**Value Drivers (increase motivation):**
1. **Value Proposition** - The perceived benefit vs. cost of taking action
2. **Relevance** - How well the page matches visitor expectations and source
3. **Clarity** - How easily visitors can understand the offer and action
4. **Urgency** - The motivation to act NOW rather than later

**Conversion Inhibitors (decrease motivation):**
5. **Anxiety** - Trust concerns and perceived risks
6. **Distraction** - Elements competing for attention

## FRAMEWORK: PXL PRIORITIZATION
For each A/B test recommendation, calculate PXL score based on binary factors:
- **Above Fold** (+15): Is the change above the fold?
- **Noticeable in 5 Seconds** (+15): Will users notice within 5 seconds?
- **Run on High-Traffic Page** (+15): Is this a high-traffic page?
- **Affects All Users** (+15): Does it impact all visitors (not just a segment)?
- **Easy to Implement** (+20): Can it be implemented quickly?
- **Evidence-Backed** (+20): Is there research/data supporting this hypothesis?

PXL Score = Sum of applicable factors (max 100)

## ASSERTIONS TO EVALUATE
For each LIFT category, evaluate these specific assertions:

### Value Proposition (VP)
- VP_CLEAR: Is the value proposition clear within 5 seconds?
- VP_UNIQUE: Is there clear differentiation from competitors?
- VP_BENEFIT: Are benefits emphasized over features?
- VP_SPECIFIC: Are claims specific and quantifiable?

### Clarity (CL)
- CL_HIERARCHY: Is visual hierarchy clear and guides the eye?
- CL_HEADLINE: Is the headline understandable without context?
- CL_CTA: Does CTA clearly communicate what happens next?
- CL_FLOW: Is the page structure logical?
- CL_LANGUAGE: Is the language free of jargon?

### Relevance (RL)
- RL_MESSAGE: Does content match the traffic source promise?
- RL_AUDIENCE: Does language match target audience?
- RL_INTENT: Does page serve user intent?
- RL_CONTEXT: Is content contextually appropriate for visitor stage?

### Anxiety (AX) - INHIBITOR
- AX_SOCIAL: Are there credible social proof elements?
- AX_TRUST: Are trust badges and security indicators present?
- AX_RISK: Is perceived risk minimized (guarantees, reversals)?
- AX_CONTACT: Can visitors easily reach support?
- AX_PRIVACY: Are privacy concerns addressed?
- AX_CREDIBILITY: Are there authority/expertise indicators?

### Distraction (DI) - INHIBITOR
- DI_FOCUS: Does page have ONE clear conversion goal?
- DI_NAV: Is navigation minimized?
- DI_LINKS: Are outbound links minimized?
- DI_VISUAL: Is design clean without clutter?
- DI_COMPETING: Is there a single primary CTA?

### Urgency (UR)
- UR_SCARCITY: Are there legitimate scarcity elements?
- UR_INCENTIVE: Is there a reason to act now?
- UR_LOSS: Is cost of inaction communicated?

## SCORING GUIDELINES

**Category Scores (0-100):**
- 90-100: Excellent, best practice implementation
- 70-89: Good, minor improvements possible
- 50-69: Needs work, significant opportunities
- 30-49: Poor, major issues present
- 0-29: Critical, fundamental problems

**Overall Score Calculation:**
Weight categories: VP(25%), CL(20%), RL(15%), AX(20%), DI(10%), UR(10%)
For inhibitors (AX, DI): High score = LOW anxiety/distraction (good)

**Assertion Status:**
- "pass": Assertion is satisfied
- "fail": Clear violation or absence
- "warning": Partial implementation or concerns

## CRITICAL ISSUES
Extract top 3-5 issues with severity "critical" or "high" that have the biggest conversion impact.

## QUICK WINS
Identify 2-4 changes that are:
- Easy to implement (< 2 hours)
- High expected impact
- Low risk

## A/B TESTS
Generate 3-5 prioritized test recommendations:
- Each linked to a specific assertion failure
- Proper PXL scoring with factor breakdown
- 2-3 variants including control
- Clear hypothesis following format: "If we [change], then [metric] will [improve] because [reason]"

## OUTPUT FORMAT
Return a valid JSON object with this EXACT structure:

{
  "url": "extracted from snapshot or 'Unknown'",
  "analyzedAt": "ISO timestamp",
  "overallScore": 0-100,
  "liftCategories": {
    "valueProposition": {
      "name": "Value Proposition",
      "shortName": "VP",
      "score": 0-100,
      "description": "Why should visitors choose you over alternatives?",
      "assertions": [
        {
          "id": "VP_CLEAR",
          "name": "Clear Value",
          "question": "Is the value proposition clear within 5 seconds?",
          "status": "pass|fail|warning",
          "severity": "critical|high|medium|low",
          "evidence": "Specific observation from the page",
          "recommendation": "Specific actionable fix or null if passed"
        }
      ]
    },
    "clarity": { ... },
    "relevance": { ... },
    "anxiety": {
      "name": "Anxiety",
      "shortName": "AX",
      "score": 0-100,
      "description": "Trust inhibitors that prevent conversion",
      "isInhibitor": true,
      "assertions": [ ... ]
    },
    "distraction": {
      "name": "Distraction",
      "shortName": "DI",
      "score": 0-100,
      "description": "Elements that divert from the conversion goal",
      "isInhibitor": true,
      "assertions": [ ... ]
    },
    "urgency": { ... }
  },
  "criticalIssues": [
    {
      "id": "assertion_id",
      "category": "Category Name",
      "title": "Brief description of the issue",
      "impact": "critical|high"
    }
  ],
  "quickWins": [
    {
      "title": "Change description",
      "current": "What exists now",
      "suggested": "What to change to",
      "effort": "easy",
      "impact": "high"
    }
  ],
  "tests": [
    {
      "id": 1,
      "priority": "critical|high|medium",
      "pxlScore": 0-100,
      "title": "Test name",
      "hypothesis": "If we [change], then [metric] will [improve] because [reason]",
      "assertionId": "linked assertion",
      "category": "LIFT category",
      "variants": [
        { "name": "Control", "description": "Current state" },
        { "name": "Variant A", "description": "Proposed change" }
      ],
      "expectedImpact": "high|medium|low",
      "implementationEffort": "easy|medium|hard",
      "pxlFactors": {
        "aboveFold": true|false,
        "noticeableIn5Sec": true|false,
        "runOnHighTraffic": true|false,
        "affectsAllUsers": true|false,
        "easyToImplement": true|false,
        "evidenceBacked": true|false
      }
    }
  ]
}

## STRICT RULES
1. ALL text output MUST be in English
2. Return ONLY valid JSON - no markdown, no explanations
3. Every assertion MUST have evidence from the actual page data
4. Every recommendation MUST be specific and actionable
5. Do NOT invent elements not present in the snapshot
6. If data is insufficient, mark assertion as "warning" with evidence explaining the limitation
7. Be critical and direct - this is a professional audit
8. Inhibitor categories (anxiety, distraction): HIGH score = GOOD (low anxiety/distraction)

## PAGE DATA TO ANALYZE
${snapshotJson}`;
}

module.exports = {
  LIFT_CATEGORIES,
  auditOutputSchema,
  buildCROAuditPrompt
};
