# CRO Audit Chrome Extension

## Project Overview
Chrome extension for professional CRO (Conversion Rate Optimization) audits of landing pages. Uses AI to analyze pages and provide actionable recommendations based on the LIFT Model framework with PXL test prioritization.

## Target Audience
**Primary:** CRO specialists, conversion optimization consultants, growth marketers
**NOT for:** Beginners who need hand-holding. Our users understand frameworks like LIFT, ICE, PXL scoring.

## Value Proposition
- Instant professional CRO audit of any landing page
- LIFT Model framework (industry standard)
- PXL-prioritized A/B test recommendations
- Exportable reports for team handoffs

---

## Architecture

```
ext/
├── extension/           # Chrome Extension (Manifest V3)
│   ├── manifest.json
│   ├── background.js    # Service worker, communicates with server
│   ├── content.js       # DOM snapshot extraction
│   ├── popup.html       # Extension popup (loads React UI)
│   └── ui/              # Built React app (from extension-ui)
│
├── extension-ui/        # React UI (Vite + Framer Motion)
│   └── src/
│       ├── App.jsx      # Main app with mock data
│       ├── components/
│       │   ├── StartScreen.jsx
│       │   ├── LoadingScreen.jsx
│       │   ├── ResultsScreen.jsx   # Tab navigation
│       │   └── tabs/
│       │       ├── SummaryTab.jsx   # Score ring, LIFT bars, critical issues
│       │       ├── FindingsTab.jsx  # Detailed assertions by category
│       │       └── TestsTab.jsx     # Prioritized A/B tests
│
├── server/              # Backend (Express + OpenAI)
│   ├── index.js         # Current server (old prompt structure)
│   └── prompt.js        # NEW: Professional LIFT Model prompt
│
└── CLAUDE.md            # This file
```

---

## LIFT Model Framework

The UI is built around the LIFT Model - 6 factors that affect conversion:

### Value Drivers (increase motivation)
1. **Value Proposition (VP)** - Why choose you over alternatives?
2. **Clarity (CL)** - How quickly can visitors understand?
3. **Relevance (RL)** - Does page match visitor expectations?
4. **Urgency (UR)** - Motivation to act NOW

### Conversion Inhibitors (decrease motivation)
5. **Anxiety (AX)** - Trust concerns, perceived risks
6. **Distraction (DI)** - Elements competing for attention

Each category has **assertions** (specific checkpoints) with:
- Status: pass / fail / warning
- Severity: critical / high / medium / low
- Evidence: What was observed on the page
- Recommendation: Specific fix (if failed)

---

## PXL Prioritization

For A/B test recommendations, we use PXL scoring (binary factors):
- Above Fold (+15)
- Noticeable in 5 Seconds (+15)
- Run on High-Traffic Page (+15)
- Affects All Users (+15)
- Easy to Implement (+20)
- Evidence-Backed (+20)

Max score: 100

---

## Data Structure

The UI expects this JSON structure from the server:

```javascript
{
  url: string,
  analyzedAt: string,
  overallScore: 0-100,

  liftCategories: {
    valueProposition: {
      name: "Value Proposition",
      shortName: "VP",
      score: 0-100,
      description: string,
      assertions: [
        {
          id: "VP_CLEAR",
          name: "Clear Value",
          question: "Is the value proposition clear within 5 seconds?",
          status: "pass" | "fail" | "warning",
          severity: "critical" | "high" | "medium" | "low",
          evidence: string,
          recommendation: string | null
        }
      ]
    },
    clarity: { ... },
    relevance: { ... },
    anxiety: { isInhibitor: true, ... },
    distraction: { isInhibitor: true, ... },
    urgency: { ... }
  },

  criticalIssues: [
    { id, category, title, impact }
  ],

  quickWins: [
    { title, current, suggested, effort, impact }
  ],

  tests: [
    {
      id: number,
      priority: "critical" | "high" | "medium",
      pxlScore: 0-100,
      title: string,
      hypothesis: string,
      assertionId: string,
      category: string,
      variants: [{ name, description }],
      expectedImpact: "high" | "medium" | "low",
      implementationEffort: "easy" | "medium" | "hard",
      pxlFactors: {
        aboveFold: boolean,
        noticeableIn5Sec: boolean,
        runOnHighTraffic: boolean,
        affectsAllUsers: boolean,
        easyToImplement: boolean,
        evidenceBacked: boolean
      }
    }
  ]
}
```

---

## Current Status

### Done
- [x] Chrome extension structure (Manifest V3)
- [x] Content script for DOM snapshot
- [x] React UI with 3 tabs (Summary, Findings, Tests)
- [x] Mock data matching LIFT Model structure
- [x] Professional prompt created (`server/prompt.js`)

### TODO
- [ ] Integrate new prompt into server/index.js
- [ ] Connect UI to actual backend (currently uses mock data)
- [ ] PDF Export
- [ ] Figma Export (annotated screenshots)
- [ ] Jira/Linear ticket export
- [ ] Domain history (past audits)

---

## User Research Insights

From conversations with CRO professionals:

**Pain points:**
1. Insights scattered across too many tools
2. Messy handoffs between CRO → Design → Dev
3. Unclear/incomplete specs in recommendations
4. Past test learnings not documented
5. Late feedback cycles

**What this means:**
Our extension should be a **communication layer** - not just find issues, but help communicate them to execution teams in their formats (Figma, Jira, PDF).

---

## Commands

```bash
# Run UI dev server
cd extension-ui && npm run dev

# Build UI for extension
cd extension-ui && npm run build

# Run backend server
cd server && node index.js
```

UI runs on: http://localhost:5173
Server runs on: http://localhost:8787

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `extension-ui/src/App.jsx` | Mock data structure, main app logic |
| `extension-ui/src/components/tabs/*` | The 3 main UI tabs |
| `server/prompt.js` | NEW professional LIFT Model prompt |
| `server/index.js` | Current server (needs update to use new prompt) |
| `extension/background.js` | Extension ↔ Server communication |

---

## Design Decisions

1. **Fixed size 800x450** - Chrome extension popup constraint
2. **Dark theme** - Professional look, easier on eyes
3. **Categories collapsed by default** in Findings tab - Less overwhelming
4. **English only** - Target audience is international CRO community
5. **No generic advice** - Every recommendation must reference specific page elements

---

## Tech Stack

- **Extension:** Chrome Manifest V3
- **UI:** React + Vite + Framer Motion
- **Backend:** Express.js + OpenAI API
- **Styling:** Plain CSS with CSS variables
