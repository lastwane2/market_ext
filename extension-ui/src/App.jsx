import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import StartScreen from './components/StartScreen'
import LoadingScreen from './components/LoadingScreen'
import ResultsScreen from './components/ResultsScreen'
import { saveAudit } from './utils/storage'
import './App.css'

// Mock data structure based on LIFT Model + PXL prioritization
const mockAuditData = {
  // Meta
  url: 'https://example.com/landing',
  analyzedAt: new Date().toISOString(),

  // Overall scores
  overallScore: 54,

  // LIFT Model Categories
  liftCategories: {
    valueProposition: {
      name: 'Value Proposition',
      shortName: 'VP',
      score: 62,
      description: 'Why should visitors choose you over alternatives?',
      assertions: [
        {
          id: 'VP_CLEAR',
          name: 'Clear Value',
          question: 'Is the value proposition clear within 5 seconds?',
          status: 'fail',
          severity: 'critical',
          evidence: 'H1 "Welcome to Our Platform" does not communicate value. No clear benefit statement found above fold.',
          recommendation: 'Replace generic headline with specific benefit statement.'
        },
        {
          id: 'VP_UNIQUE',
          name: 'Differentiation',
          question: 'Is there clear differentiation from competitors?',
          status: 'fail',
          severity: 'high',
          evidence: 'No unique selling proposition detected. Features listed are common in the industry.',
          recommendation: 'Add specific differentiators: unique features, guarantees, or approach.'
        },
        {
          id: 'VP_BENEFIT',
          name: 'Benefits vs Features',
          question: 'Are benefits emphasized over features?',
          status: 'pass',
          severity: 'medium',
          evidence: 'Found 3 benefit-focused statements in the hero section.',
          recommendation: null
        }
      ]
    },
    clarity: {
      name: 'Clarity',
      shortName: 'CL',
      score: 71,
      description: 'How quickly can visitors understand your offering?',
      assertions: [
        {
          id: 'CL_HIERARCHY',
          name: 'Visual Hierarchy',
          question: 'Is visual hierarchy clear and guides the eye?',
          status: 'pass',
          severity: 'high',
          evidence: 'Clear F-pattern layout detected. Primary CTA is visually prominent.',
          recommendation: null
        },
        {
          id: 'CL_HEADLINE',
          name: 'Headline Clarity',
          question: 'Is the headline understandable without context?',
          status: 'fail',
          severity: 'high',
          evidence: 'H1 "Welcome to Our Platform" requires context to understand. Fails the 5-second test.',
          recommendation: 'Use headline formula: [End Result] + [Time Period] + [Address Objection]'
        },
        {
          id: 'CL_CTA',
          name: 'CTA Clarity',
          question: 'Does CTA clearly communicate what happens next?',
          status: 'fail',
          severity: 'critical',
          evidence: 'CTA text "Submit" is generic. Does not indicate what user will receive.',
          recommendation: 'Change to action-benefit format: "Get My Free Audit" or "Start Free Trial"'
        },
        {
          id: 'CL_FLOW',
          name: 'Content Flow',
          question: 'Is the page structure logical?',
          status: 'pass',
          severity: 'medium',
          evidence: 'Sections follow logical order: Hero → Benefits → Features → Social Proof → CTA',
          recommendation: null
        }
      ]
    },
    relevance: {
      name: 'Relevance',
      shortName: 'RL',
      score: 85,
      description: 'Does the page match visitor expectations?',
      assertions: [
        {
          id: 'RL_MESSAGE',
          name: 'Message Match',
          question: 'Does page content match the traffic source promise?',
          status: 'pass',
          severity: 'critical',
          evidence: 'Meta description aligns with page content. Keywords consistent throughout.',
          recommendation: null
        },
        {
          id: 'RL_AUDIENCE',
          name: 'Audience Fit',
          question: 'Does the language match target audience?',
          status: 'pass',
          severity: 'high',
          evidence: 'Professional tone appropriate for B2B audience. Industry terminology used correctly.',
          recommendation: null
        },
        {
          id: 'RL_INTENT',
          name: 'Intent Match',
          question: 'Does page serve the user intent?',
          status: 'warning',
          severity: 'medium',
          evidence: 'Page appears conversion-focused but lacks educational content for awareness-stage visitors.',
          recommendation: 'Consider adding brief explainer section for visitors unfamiliar with the problem.'
        }
      ]
    },
    anxiety: {
      name: 'Anxiety',
      shortName: 'AX',
      score: 34,
      description: 'Trust inhibitors that prevent conversion',
      isInhibitor: true,
      assertions: [
        {
          id: 'AX_SOCIAL',
          name: 'Social Proof',
          question: 'Are there credible social proof elements?',
          status: 'fail',
          severity: 'critical',
          evidence: 'No testimonials, reviews, case studies, or client logos detected on the page.',
          recommendation: 'Add 2-3 specific testimonials with photos, names, and companies. Include client logos if B2B.'
        },
        {
          id: 'AX_TRUST',
          name: 'Trust Signals',
          question: 'Are trust badges and security indicators present?',
          status: 'fail',
          severity: 'high',
          evidence: 'No security badges, certifications, or trust seals found near conversion points.',
          recommendation: 'Add SSL badge, payment security icons, and industry certifications near form/CTA.'
        },
        {
          id: 'AX_RISK',
          name: 'Risk Reversal',
          question: 'Is the perceived risk minimized?',
          status: 'fail',
          severity: 'high',
          evidence: 'No money-back guarantee, free trial, or risk-free offer mentioned.',
          recommendation: 'Add guarantee badge near CTA: "30-Day Money Back Guarantee" or "Cancel Anytime"'
        },
        {
          id: 'AX_CONTACT',
          name: 'Contact Access',
          question: 'Can visitors easily reach support?',
          status: 'warning',
          severity: 'medium',
          evidence: 'Contact information found in footer only. Not visible without scrolling.',
          recommendation: 'Add contact option (chat widget or phone) visible above fold.'
        },
        {
          id: 'AX_PRIVACY',
          name: 'Privacy Assurance',
          question: 'Are privacy concerns addressed?',
          status: 'pass',
          severity: 'low',
          evidence: 'Privacy policy link present. "We respect your privacy" near email field.',
          recommendation: null
        }
      ]
    },
    distraction: {
      name: 'Distraction',
      shortName: 'DI',
      score: 78,
      description: 'Elements that divert from the conversion goal',
      isInhibitor: true,
      assertions: [
        {
          id: 'DI_FOCUS',
          name: 'Single Goal',
          question: 'Does the page have one clear conversion goal?',
          status: 'pass',
          severity: 'critical',
          evidence: 'Single primary CTA identified. No competing conversion actions.',
          recommendation: null
        },
        {
          id: 'DI_NAV',
          name: 'Navigation',
          question: 'Is navigation minimized to reduce exit points?',
          status: 'warning',
          severity: 'medium',
          evidence: 'Full navigation menu present with 7 links. Consider simplified or hidden nav for landing page.',
          recommendation: 'Remove or minimize navigation on dedicated landing pages. Keep only essential links.'
        },
        {
          id: 'DI_LINKS',
          name: 'Outbound Links',
          question: 'Are outbound links minimized?',
          status: 'pass',
          severity: 'low',
          evidence: 'Only 2 external links found (both open in new tabs).',
          recommendation: null
        },
        {
          id: 'DI_VISUAL',
          name: 'Visual Noise',
          question: 'Is the design clean without visual clutter?',
          status: 'pass',
          severity: 'medium',
          evidence: 'Clean design with adequate whitespace. No intrusive popups or animations.',
          recommendation: null
        }
      ]
    },
    urgency: {
      name: 'Urgency',
      shortName: 'UR',
      score: 45,
      description: 'Motivation to act now rather than later',
      assertions: [
        {
          id: 'UR_SCARCITY',
          name: 'Scarcity',
          question: 'Are there legitimate scarcity elements?',
          status: 'fail',
          severity: 'medium',
          evidence: 'No scarcity indicators detected. No limited availability or stock information.',
          recommendation: 'If applicable, add genuine scarcity: limited spots, inventory count, or cohort-based access.'
        },
        {
          id: 'UR_INCENTIVE',
          name: 'Time Incentive',
          question: 'Is there a reason to act now?',
          status: 'fail',
          severity: 'high',
          evidence: 'No time-limited offer, bonus, or deadline present.',
          recommendation: 'Add time-sensitive incentive: early-bird pricing, bonus for quick action, or limited offer.'
        },
        {
          id: 'UR_LOSS',
          name: 'Loss Aversion',
          question: 'Is the cost of inaction communicated?',
          status: 'warning',
          severity: 'medium',
          evidence: 'Benefits shown but no "what you\'re missing" or cost-of-inaction messaging.',
          recommendation: 'Add copy highlighting what visitors lose by not acting: time, money, opportunity.'
        }
      ]
    }
  },

  // Critical issues (auto-extracted from assertions)
  criticalIssues: [
    {
      id: 'AX_SOCIAL',
      category: 'Anxiety',
      title: 'No social proof above fold',
      impact: 'critical'
    },
    {
      id: 'CL_CTA',
      category: 'Clarity',
      title: 'CTA text "Submit" is generic',
      impact: 'critical'
    },
    {
      id: 'VP_CLEAR',
      category: 'Value Proposition',
      title: 'No clear value statement',
      impact: 'critical'
    }
  ],

  // Quick wins (high impact + easy to implement)
  quickWins: [
    {
      title: 'Change CTA text',
      current: '"Submit"',
      suggested: '"Get My Free Audit"',
      effort: 'easy',
      impact: 'high'
    },
    {
      title: 'Add trust badges',
      current: 'None near form',
      suggested: 'SSL + guarantee badge',
      effort: 'easy',
      impact: 'high'
    }
  ],

  // Generated A/B Tests (prioritized by PXL)
  tests: [
    {
      id: 1,
      priority: 'critical',
      pxlScore: 94,
      title: 'Add Social Proof Above Fold',
      hypothesis: 'Adding customer testimonials with photos above fold will increase trust and reduce anxiety, leading to higher conversion rates.',
      assertionId: 'AX_SOCIAL',
      category: 'Anxiety',
      variants: [
        { name: 'Control', description: 'Current page without testimonials' },
        { name: 'Variant A', description: '3 customer testimonials with photos' },
        { name: 'Variant B', description: 'Client logos + "Trusted by X companies"' }
      ],
      expectedImpact: 'high',
      implementationEffort: 'medium',
      pxlFactors: {
        aboveFold: true,
        noticeableIn5Sec: true,
        runOnHighTraffic: true,
        affectsAllUsers: true,
        easyToImplement: true,
        evidenceBacked: true
      }
    },
    {
      id: 2,
      priority: 'critical',
      pxlScore: 91,
      title: 'Rewrite CTA Copy',
      hypothesis: 'Changing CTA from generic "Submit" to benefit-focused "Get My Free Audit" will clarify the action and increase click-through rate.',
      assertionId: 'CL_CTA',
      category: 'Clarity',
      variants: [
        { name: 'Control', description: '"Submit" button' },
        { name: 'Variant A', description: '"Get My Free Audit"' },
        { name: 'Variant B', description: '"Start My Free Trial →"' }
      ],
      expectedImpact: 'high',
      implementationEffort: 'easy',
      pxlFactors: {
        aboveFold: true,
        noticeableIn5Sec: true,
        runOnHighTraffic: true,
        affectsAllUsers: true,
        easyToImplement: true,
        evidenceBacked: true
      }
    },
    {
      id: 3,
      priority: 'high',
      pxlScore: 85,
      title: 'Add Value Proposition Headline',
      hypothesis: 'Replacing generic "Welcome" headline with specific benefit statement will communicate value faster and reduce bounce rate.',
      assertionId: 'VP_CLEAR',
      category: 'Value Proposition',
      variants: [
        { name: 'Control', description: '"Welcome to Our Platform"' },
        { name: 'Variant A', description: '"Increase Your Conversion Rate by 30% in 30 Days"' },
        { name: 'Variant B', description: '"Stop Losing Customers to Slow Websites"' }
      ],
      expectedImpact: 'high',
      implementationEffort: 'easy',
      pxlFactors: {
        aboveFold: true,
        noticeableIn5Sec: true,
        runOnHighTraffic: true,
        affectsAllUsers: true,
        easyToImplement: true,
        evidenceBacked: true
      }
    },
    {
      id: 4,
      priority: 'high',
      pxlScore: 78,
      title: 'Add Risk Reversal Near CTA',
      hypothesis: 'Adding money-back guarantee badge near CTA will reduce perceived risk and increase form submissions.',
      assertionId: 'AX_RISK',
      category: 'Anxiety',
      variants: [
        { name: 'Control', description: 'No guarantee visible' },
        { name: 'Variant A', description: '"30-Day Money Back Guarantee" badge' },
        { name: 'Variant B', description: '"Try Free for 14 Days - No Credit Card"' }
      ],
      expectedImpact: 'medium',
      implementationEffort: 'easy',
      pxlFactors: {
        aboveFold: true,
        noticeableIn5Sec: false,
        runOnHighTraffic: true,
        affectsAllUsers: true,
        easyToImplement: true,
        evidenceBacked: true
      }
    },
    {
      id: 5,
      priority: 'medium',
      pxlScore: 65,
      title: 'Add Time-Limited Incentive',
      hypothesis: 'Adding a time-sensitive bonus offer will create urgency and motivate immediate action.',
      assertionId: 'UR_INCENTIVE',
      category: 'Urgency',
      variants: [
        { name: 'Control', description: 'No time incentive' },
        { name: 'Variant A', description: '"Sign up today, get 20% off first month"' },
        { name: 'Variant B', description: 'Countdown timer + limited bonus' }
      ],
      expectedImpact: 'medium',
      implementationEffort: 'medium',
      pxlFactors: {
        aboveFold: true,
        noticeableIn5Sec: true,
        runOnHighTraffic: true,
        affectsAllUsers: true,
        easyToImplement: false,
        evidenceBacked: false
      }
    }
  ]
}

function App() {
  const [screen, setScreen] = useState('start') // start, loading, results
  const [auditData, setAuditData] = useState(null)

  const startAudit = async () => {
    setScreen('loading')

    try {
      const response = await new Promise((resolve, reject) => {
        if (typeof chrome !== 'undefined' && chrome?.runtime?.sendMessage) {
          chrome.runtime.sendMessage({ action: 'analyzePage' }, (res) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message))
            } else if (res?.error) {
              reject(new Error(res.error))
            } else {
              resolve(res)
            }
          })
        } else {
          // Mock for development
          setTimeout(() => {
            resolve({
              success: true,
              audit: mockAuditData
            })
          }, 2500)
        }
      })

      if (response.success) {
        // Save audit to history
        const savedAudit = await saveAudit(response.audit)
        setAuditData(savedAudit)
        setScreen('results')
      }
    } catch (error) {
      console.error('Audit error:', error)
      setScreen('start')
    }
  }

  const handleLoadAudit = (audit) => {
    setAuditData(audit)
    setScreen('results')
  }

  const handleDataUpdate = (updatedData) => {
    setAuditData(updatedData)
  }

  const resetAudit = () => {
    setScreen('start')
    setAuditData(null)
  }

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {screen === 'start' && (
          <StartScreen key="start" onStart={startAudit} onLoadAudit={handleLoadAudit} />
        )}
        {screen === 'loading' && (
          <LoadingScreen key="loading" />
        )}
        {screen === 'results' && (
          <ResultsScreen key="results" data={auditData} onReset={resetAudit} onDataUpdate={handleDataUpdate} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
