// Chrome storage wrapper for audit state persistence

export async function loadState() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['currentAudit', 'history', 'lastViewedId'], (result) => {
      resolve({
        currentAudit: result.currentAudit || null,
        history: result.history || [],
        lastViewedId: result.lastViewedId || null,
      });
    });
  });
}

export async function saveState({ currentAudit, history, lastViewedId }) {
  return new Promise((resolve) => {
    const data = {};
    if (currentAudit !== undefined) data.currentAudit = currentAudit;
    if (history !== undefined) data.history = history;
    if (lastViewedId !== undefined) data.lastViewedId = lastViewedId;
    
    chrome.storage.local.set(data, () => {
      resolve();
    });
  });
}

export async function getActiveTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (tabs[0]) {
        resolve(tabs[0]);
      } else {
        reject(new Error('No active tab found'));
      }
    });
  });
}

export function generateMockAudits() {
  const now = Date.now();
  return [
    {
      id: 'mock-1',
      url: 'https://stripe.com/pricing',
      createdAt: now - 86400000, // 1 day ago
      pageType: 'pricing',
      primaryGoal: 'signup',
      targetAudience: 'SaaS companies and developers looking for payment infrastructure',
      coreOffer: 'Payment processing API with transparent pricing',
      clarityScore: 9,
      clarityNotes: [
        'Clear pricing tiers with feature comparison',
        'Strong value proposition in hero section',
        'Multiple CTAs guide users to signup'
      ],
      conversionIssues: [
        'Observation: Enterprise pricing requires contact | Impact: Creates friction for high-value customers | Fix: Add "Contact Sales" CTA with estimated response time',
        'Observation: No live chat support visible | Impact: Missed conversion opportunities | Fix: Add chat widget in bottom-right corner'
      ],
      quickWins: [
        'Add customer logo carousel above pricing table',
        'Clarify "per transaction" fee structure in tooltip',
        'Move "See all features" link above pricing cards'
      ],
      copySuggestions: {
        headline: 'Pricing that scales with you',
        subheadline: 'Start free, pay only for what you use',
        cta: 'Start building'
      },
      assumptions: [],
      confidence: 9,
      _improved: false,
    },
    {
      id: 'mock-2',
      url: 'https://webflow.com',
      createdAt: now - 172800000, // 2 days ago
      pageType: 'landing',
      primaryGoal: 'signup',
      targetAudience: 'Designers and developers building custom websites',
      coreOffer: 'No-code website builder with CMS and hosting',
      clarityScore: 8,
      clarityNotes: [
        'Strong visual showcase of capabilities',
        'Clear differentiation from competitors',
        'Multiple entry points for different user types'
      ],
      conversionIssues: [
        'Observation: Hero CTA is generic "Get started" | Impact: Doesn\'t communicate value | Fix: Change to "Start building for free - No credit card"',
        'Observation: Pricing link in nav requires scroll | Impact: Price-sensitive users leave early | Fix: Add pricing badge next to CTA'
      ],
      quickWins: [
        'Add "See it in action" video thumbnail above fold',
        'Clarify free tier limitations in hero',
        'Add social proof numbers (e.g., "2M+ sites built")'
      ],
      copySuggestions: {
        headline: 'Build professional websites without code',
        subheadline: 'Design, develop, and launch in one platform',
        cta: 'Start building free'
      },
      assumptions: [],
      confidence: 8,
      _improved: false,
    },
    {
      id: 'mock-3',
      url: 'https://example.com/landing',
      createdAt: now - 259200000, // 3 days ago
      pageType: 'landing',
      primaryGoal: 'lead',
      targetAudience: 'Small business owners',
      coreOffer: 'Business management software',
      clarityScore: 5,
      clarityNotes: [
        'Unclear value proposition in hero',
        'Too many competing CTAs',
        'Missing trust signals'
      ],
      conversionIssues: [
        'Observation: Headline is vague "Transform your business" | Impact: Users don\'t understand offer | Fix: Rewrite to "All-in-one platform to manage customers, sales, and invoices"',
        'Observation: No pricing information visible | Impact: Users assume high cost | Fix: Add "Starting at $29/mo" badge in hero',
        'Observation: Testimonials section is empty | Impact: No social proof | Fix: Add 3 customer testimonials with photos'
      ],
      quickWins: [
        'Simplify navigation - remove 5+ menu items',
        'Add "14-day free trial" CTA above fold',
        'Move feature list before pricing section'
      ],
      copySuggestions: {
        headline: 'Manage your entire business in one place',
        subheadline: 'CRM, invoicing, and customer support - all integrated',
        cta: 'Start free trial'
      },
      assumptions: ['Assumption: Target audience is small businesses based on pricing structure'],
      confidence: 6,
      _improved: true,
    },
  ];
}

export async function seedMockData() {
  const state = await loadState();
  if (state.history.length === 0) {
    const mocks = generateMockAudits();
    await saveState({ history: mocks });
  }
}

