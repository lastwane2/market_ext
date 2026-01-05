// Background service worker - handles communication between popup and content script

const SERVER_URL = 'http://localhost:8787';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzePage') {
    handleAnalyzeRequest(sendResponse);
    return true; // Keep channel open for async response
  }

  if (request.action === 'checkServer') {
    handleServerCheck(sendResponse);
    return true;
  }
});

async function handleAnalyzeRequest(sendResponse) {
  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      sendResponse({ error: 'No active tab found' });
      return;
    }

    // Check if we can inject script
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      sendResponse({ error: 'Cannot analyze Chrome internal pages' });
      return;
    }

    // Inject content script if needed and get snapshot
    let snapshot;
    try {
      // Try to get snapshot from existing content script
      snapshot = await chrome.tabs.sendMessage(tab.id, { action: 'getSnapshot' });
    } catch (e) {
      // Content script not injected, inject it
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      // Wait a bit for script to load
      await new Promise(resolve => setTimeout(resolve, 100));

      // Try again
      snapshot = await chrome.tabs.sendMessage(tab.id, { action: 'getSnapshot' });
    }

    if (snapshot.error) {
      sendResponse({ error: snapshot.error });
      return;
    }

    console.log('[Background] Got snapshot from page:', snapshot.url);

    // Send to server for analysis
    const response = await fetch(`${SERVER_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(snapshot)
    });

    if (!response.ok) {
      const error = await response.json();
      sendResponse({ error: error.error || `Server error: ${response.status}` });
      return;
    }

    const audit = await response.json();
    console.log('[Background] Got audit result, score:', audit.overallScore);

    sendResponse({ success: true, audit });

  } catch (error) {
    console.error('[Background] Error:', error);
    sendResponse({ error: error.message || 'Unknown error occurred' });
  }
}

async function handleServerCheck(sendResponse) {
  try {
    const response = await fetch(`${SERVER_URL}/health`);
    const data = await response.json();
    sendResponse({ status: 'ok', ...data });
  } catch (error) {
    sendResponse({ status: 'error', error: error.message });
  }
}
