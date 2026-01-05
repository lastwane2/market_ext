# AI Landing Audit Extension MVP

Goal: Chrome extension (Manifest V3) that analyzes the current page and shows a structured landing-page audit.

Flow:
UI (popup) -> background service worker -> content script (DOM snapshot) -> local server http://localhost:8787/analyze -> UI renders JSON.

Snapshot fields:
- url, title, metaDescription
- headings (h1-h3)
- ctas (button/a with CTA-like text)
- mainText (cleaned text, limited)

Server:
- Node + Express
- POST /analyze returns JSON audit (stub first)
