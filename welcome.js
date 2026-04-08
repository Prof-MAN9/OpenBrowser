// OpenBrowser v3.2.6 — Welcome Page Script
// https://github.com/Prof-MAN9/OpenBrowser
// External script (required — inline scripts are blocked by MV3 CSP)
'use strict';

document.getElementById('btn-open').addEventListener('click', async function () {
  if (typeof chrome === 'undefined' || !chrome.sidePanel) return;

  try {
    // welcome.html is itself a tab — get this tab's windowId and open the panel there.
    // Calling sidePanel.open() directly from a click handler satisfies Chrome's
    // user-gesture requirement (no background message-passing needed).
    const currentTab = await chrome.tabs.getCurrent();
    if (currentTab?.windowId) {
      await chrome.sidePanel.open({ windowId: currentTab.windowId });
      return;
    }
  } catch (_) { /* fall through */ }

  // Fallback: ask background to find/create a real window and open the panel there
  chrome.runtime.sendMessage({ type: 'open-sidepanel-from-welcome' }, function () {
    void chrome.runtime.lastError; // suppress "no listener" errors
  });
});
