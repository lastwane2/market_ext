# AI Landing Audit UI

Modern React UI for the Chrome extension popup.

## Setup

1. Install dependencies:
```bash
cd ui
npm install
```

2. Build for production:
```bash
npm run build
```

This will output to `../extension/ui/` which is where the extension loads the popup from.

3. For development (with hot reload):
```bash
npm run dev
```

Note: Chrome extensions require built files, so you'll need to rebuild after changes.

## Development Workflow

1. Make changes to files in `ui/src/`
2. Run `npm run build` to compile
3. Reload the extension in Chrome (`chrome://extensions/` → Reload)
4. Test the changes

## Project Structure

- `src/App.jsx` - Main app component with tab navigation
- `src/components/` - React components
  - `AuditView.jsx` - Main audit interface
  - `HistoryView.jsx` - History list and details
  - `AuditDetails.jsx` - Full audit details view
  - `Tabs.jsx` - Tab navigation
  - `Toast.jsx` - Toast notifications
  - `Skeleton.jsx` - Loading skeletons
- `src/lib/storage.js` - Chrome storage wrapper and mock data

