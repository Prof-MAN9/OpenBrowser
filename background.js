// OpenBrowser v3.2.6 — Background Service Worker
// https://github.com/Prof-MAN9/OpenBrowser

const PENDING_OMNIBOX = { message: 'pendingOmniboxMessage', messageId: 'pendingOmniboxMessageId' };
let sidepanelLastHeartbeat = 0;
const HEARTBEAT_TIMEOUT = 1000;

function isSidepanelOpen() {
  return Date.now() - sidepanelLastHeartbeat < HEARTBEAT_TIMEOUT;
}

// Setup on install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('/welcome.html') });
  }
  // Configure side panel behavior
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});

  // ── Context menu items ─────────────────────────────────────────────────
  // Remove any existing items first (clean slate on update)
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: 'ob_summarize',  title: '🤖 Summarize with OpenBrowser',   contexts: ['page', 'selection'] });
    chrome.contextMenus.create({ id: 'ob_selection',  title: '🤖 Ask OpenBrowser about this',   contexts: ['selection'] });
    chrome.contextMenus.create({ id: 'ob_translate',  title: '🌐 Translate selection',           contexts: ['selection'] });
    chrome.contextMenus.create({ id: 'ob_search_page',title: '🔍 OpenBrowser: search this page', contexts: ['page'] });
    chrome.contextMenus.create({ id: 'ob_fill_forms', title: '📝 Smart fill forms on this page', contexts: ['page'] });
    chrome.contextMenus.create({ id: 'ob_cite',       title: '📌 Save as citation',              contexts: ['page'] });
    chrome.contextMenus.create({ id: 'ob_screenshot', title: '📸 Screenshot & describe',         contexts: ['page'] });
  });
});

// Enable side panel on action click
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});

// ── Context menu click handler ───────────────────────────────────────────
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  // info.selectionText is only defined for 'selection' context items
  const selectedText = (info.selectionText || '').substring(0, 500);

  const promptMap = {
    ob_summarize:   'Summarize the main content of this page in clear bullet points.',
    ob_selection:   `The user selected this text: "${selectedText}"\n\nPlease analyze and explain it.`,
    ob_translate:   `Translate this text to English (or to the most useful language if it is already in English):\n\n"${selectedText}"`,
    ob_search_page: 'Search and summarize the key information on this page. List facts, data, and main points.',
    ob_fill_forms:  'Scan this page for forms. For each form found, describe the fields and ask me what data to fill in.',
    ob_cite:        'Save this page as a citation. Auto-generate tags and a one-sentence summary.',
    ob_screenshot:  'Take a screenshot of the current page and describe everything you see in detail.',
  };

  // Guard: selection-only items need actual selected text
  if ((info.menuItemId === 'ob_selection' || info.menuItemId === 'ob_translate') && !selectedText.trim()) {
    return; // no text selected, ignore
  }

  const prompt = promptMap[info.menuItemId];
  if (!prompt || !tab?.id) return;

  try {
    // Open the side panel
    await chrome.sidePanel.open({ tabId: tab.id }).catch(() => {});
    // Wait briefly for panel to load
    await new Promise(r => setTimeout(r, 400));
    // Store the prompt for the sidepanel to auto-run
    await chrome.storage.local.set({
      [PENDING_OMNIBOX.message]:   prompt,
      [PENDING_OMNIBOX.messageId]: crypto.randomUUID()
    });
  } catch (e) {
    console.warn('[OpenBrowser] context menu failed:', e.message);
  }
});

// ── Page change detector ─────────────────────────────────────────────────
// Notify the sidepanel when the active tab navigates to a new URL
let lastNotifiedUrl = '';
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!tab.active) return;
  if (!tab.url || tab.url.startsWith('chrome') || tab.url.startsWith('chrome-extension')) return;
  if (tab.url === lastNotifiedUrl) return;
  lastNotifiedUrl = tab.url;

  // Send to sidepanel if open
  if (isSidepanelOpen()) {
    chrome.runtime.sendMessage({
      type: 'page-changed',
      url: tab.url,
      title: tab.title || tab.url
    }).catch(() => {});
  }
});

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Heartbeat from sidepanel
  if (message.type === 'sidepanel-heartbeat') {
    sidepanelLastHeartbeat = Date.now();
    return;
  }

  // Open sidepanel — from a content script or page that has a tab context
  if (message.type === 'open-sidepanel') {
    const tabId = sender.tab?.id;
    if (tabId != null) {
      chrome.sidePanel.open({ tabId }).catch(() => {});
    }
    return;
  }

  // Open sidepanel — from welcome.html (extension page, no real tab context)
  // Uses getLastFocused to find the most recently active normal browser window
  // and opens the side panel there directly. No tab-focus dance needed.
  if (message.type === 'open-sidepanel-from-welcome') {
    (async () => {
      try {
        // Get the most recently focused normal browser window
        let win = null;
        try {
          win = await chrome.windows.getLastFocused({ windowTypes: ['normal'] });
        } catch (_) { /* no normal window exists yet */ }

        if (win && win.id !== chrome.windows.WINDOW_ID_NONE) {
          // A real browser window exists — open the panel directly on it
          await chrome.sidePanel.open({ windowId: win.id });
        } else {
          // No browser window at all — open a new tab then show the panel
          const tab = await chrome.tabs.create({ url: 'chrome://newtab', active: true });
          // Wait briefly for the new tab to register, then open panel
          await new Promise(r => setTimeout(r, 400));
          await chrome.sidePanel.open({ tabId: tab.id });
        }
      } catch (e) {
        // Last resort: try opening panel on any window
        try {
          const windows = await chrome.windows.getAll({ windowTypes: ['normal'] });
          if (windows.length > 0) {
            await chrome.sidePanel.open({ windowId: windows[0].id });
          }
        } catch (e2) {
          console.warn('[OpenBrowser] open-sidepanel-from-welcome failed:', e2.message);
        }
      }
    })();
    return;
  }

  // Close sidepanel — relay from background toggle command to the sidepanel
  // The sidepanel listens for this and calls window.close() on itself.
  // Nothing to do in the background handler; it's only meaningful on the sidepanel side.
  if (message.type === 'close-sidepanel') {
    return;
  }

  // Quick command submitted from the injected palette (lowercase, canonical)
  if (message.type === 'quick-command-submit' && typeof message.prompt === 'string') {
    const tabId = sender.tab?.id;
    const prompt = message.prompt.trim();
    if (!prompt) return;

    (async () => {
      try {
        if (tabId != null) await chrome.sidePanel.open({ tabId });
        await chrome.storage.local.set({
          [PENDING_OMNIBOX.message]:   prompt,
          [PENDING_OMNIBOX.messageId]: crypto.randomUUID()
        });
      } catch (e) {
        console.warn('[OpenBrowser] quick-command-submit failed:', e.message);
      }
    })();
    return;
  }

  // Screenshot request
  if (message.type === 'take-screenshot') {
    takeScreenshot(sender.tab?.id || message.tabId).then(sendResponse).catch(e => sendResponse({ error: e.message }));
    return true; // async
  }

  // Debugger attach
  if (message.type === 'debugger-attach') {
    attachDebugger(message.tabId).then(sendResponse).catch(e => sendResponse({ error: e.message }));
    return true;
  }

  // Debugger command
  if (message.type === 'debugger-command') {
    sendDebuggerCommand(message.tabId, message.method, message.params).then(sendResponse).catch(e => sendResponse({ error: e.message }));
    return true;
  }

  // Get tab info
  if (message.type === 'get-active-tab') {
    chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      sendResponse(tabs[0] || null);
    });
    return true;
  }

  // Open new tab
  if (message.type === 'open-tab') {
    chrome.tabs.create({ url: message.url, active: message.active !== false }).then(tab => {
      sendResponse(tab);
    });
    return true;
  }

  // Close tab
  if (message.type === 'close-tab') {
    chrome.tabs.remove(message.tabId).then(() => sendResponse({ success: true })).catch(e => sendResponse({ error: e.message }));
    return true;
  }

  // List tabs
  if (message.type === 'list-tabs') {
    chrome.tabs.query({ currentWindow: true }).then(tabs => sendResponse(tabs));
    return true;
  }

  // Switch tab
  if (message.type === 'switch-tab') {
    chrome.tabs.update(message.tabId, { active: true }).then(tab => sendResponse(tab)).catch(e => sendResponse({ error: e.message }));
    return true;
  }

  // Execute JS string on tab — use scripting.executeScript with a wrapper that
  // receives code as an arg (no eval/new Function needed in the service worker itself)
  if (message.type === 'execute-script') {
    // FIX: Validate that the message originates from the extension itself (sidepanel,
    // background, popup) and NOT from a content script running on a web page.
    // sender.tab is set when a message comes from a content script injected into a tab;
    // extension-own pages (sidepanel.html, welcome.html) have no sender.tab.
    // Without this guard, any content script on any page — or an XSS payload —
    // could invoke arbitrary JS on any tab via the extension's <all_urls> permissions.
    if (sender.id !== chrome.runtime.id || sender.tab != null) {
      sendResponse({ error: 'Unauthorized: execute-script must originate from extension pages.' });
      return true;
    }
    const tabId = message.tabId;
    chrome.scripting.executeScript({
      target: { tabId },
      // Pass code as an argument; the injected func uses indirect eval in PAGE context
      func: (codeStr) => {
        try {
          // Indirect eval runs in global scope — allowed by page context
          // eslint-disable-next-line no-eval
          const result = (0, eval)(codeStr);
          return { ok: true, result: result !== undefined ? JSON.stringify(result, null, 2) : 'undefined' };
        } catch (e) {
          return { ok: false, error: e.message };
        }
      },
      args: [message.code],
      world: message.world || 'MAIN'
    }).then(results => sendResponse({ results })).catch(e => sendResponse({ error: e.message }));
    return true;
  }
});

// Commands handler
chrome.commands.onCommand.addListener((command, tab) => {
  if (command === 'toggle-sidebar' && tab?.id != null) {
    if (isSidepanelOpen()) {
      // Sidepanel is open — send close message directly to it
      chrome.runtime.sendMessage({ type: 'close-sidepanel' }).catch(() => {});
      sidepanelLastHeartbeat = 0;  // Reset so next toggle opens
    } else {
      chrome.sidePanel.open({ tabId: tab.id }).catch(() => {});
    }
    return;
  }
  if (command === 'quick-command') {
    // Inject the quick command palette onto the active tab
    // NOTE: The manifest key is "quick-command" — must match exactly
    if (tab?.id != null) injectQuickCommandPalette(tab.id);
  }
});

// Omnibox
let omniboxWindowId = null;

chrome.omnibox.onInputStarted.addListener(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
  omniboxWindowId = tab.windowId;
});

chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {
  if (!text.trim()) return;
  // FIX: The omnibox description field is parsed as XML by Chrome. Raw user input
  // containing &, <, >, or " will produce broken or silently-dropped suggestions.
  const safeText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  suggest([{ content: text, description: `Run: ${safeText}` }]);
});

chrome.omnibox.onInputEntered.addListener((text) => {
  if (omniboxWindowId != null) {
    chrome.sidePanel.open({ windowId: omniboxWindowId }).catch(() => {});
  }
  chrome.storage.local.set({
    [PENDING_OMNIBOX.message]: text,
    [PENDING_OMNIBOX.messageId]: crypto.randomUUID()
  });
});

// Debugger functions
const attachedTabs = new Set();

async function attachDebugger(tabId) {
  if (attachedTabs.has(tabId)) return { success: true, alreadyAttached: true };
  try {
    await chrome.debugger.attach({ tabId }, '1.3');
    attachedTabs.add(tabId);
    return { success: true };
  } catch (e) {
    if (e.message?.includes('already attached')) {
      attachedTabs.add(tabId);
      return { success: true, alreadyAttached: true };
    }
    throw e;
  }
}

async function sendDebuggerCommand(tabId, method, params = {}) {
  if (!attachedTabs.has(tabId)) {
    await attachDebugger(tabId);
  }
  return chrome.debugger.sendCommand({ tabId }, method, params);
}

async function takeScreenshot(tabId) {
  if (!tabId) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    tabId = tab?.id;
  }
  if (!tabId) throw new Error('No active tab');

  try {
    await attachDebugger(tabId);
    const result = await sendDebuggerCommand(tabId, 'Page.captureScreenshot', {
      format: 'jpeg',
      quality: 60,
      fromSurface: true
    });
    return { data: result.data, type: 'jpeg' };
  } catch (e) {
    // Fallback: try chrome.tabs.captureVisibleTab
    try {
      const tab = await chrome.tabs.get(tabId);
      const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'jpeg', quality: 60 });
      return { data: dataUrl.split(',')[1], type: 'jpeg', dataUrl };
    } catch (e2) {
      throw new Error(`Screenshot failed: ${e.message}`);
    }
  }
}

// Clean up debugger on tab close
chrome.tabs.onRemoved.addListener((tabId) => {
  if (attachedTabs.has(tabId)) {
    chrome.debugger.detach({ tabId }).catch(() => {});
    attachedTabs.delete(tabId);
  }
});

// Detach debugger when navigating away to avoid issues
chrome.debugger.onDetach.addListener(({ tabId }) => {
  attachedTabs.delete(tabId);
});

// ── MACRO SCHEDULER ─────────────────────────────────────────────────────
// When a scheduled macro alarm fires, find/open the side panel and send
// the macro's prompt into it.
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (!alarm.name.startsWith('macro_')) return;

  try {
    const d = await chrome.storage.local.get('ob_macros');
    const macros = d.ob_macros || [];
    const macro = macros.find(m => m.id === alarm.name);
    if (!macro) { chrome.alarms.clear(alarm.name); return; }

    // Update lastRun timestamp
    macro.lastRun = Date.now();
    await chrome.storage.local.set({ ob_macros: macros });

    // Try to send the prompt to the side panel if it's open
    chrome.runtime.sendMessage({
      type: 'run-macro-prompt',
      prompt: macro.prompt,
      macroName: macro.name
    }).catch(() => {
      // Side panel not open — open it and try again after a short delay
      chrome.windows.getLastFocused({ windowTypes: ['normal'] })
        .then(win => chrome.sidePanel.open({ windowId: win.id }))
        .then(() => new Promise(r => setTimeout(r, 1500)))
        .then(() => chrome.runtime.sendMessage({
          type: 'run-macro-prompt',
          prompt: macro.prompt,
          macroName: macro.name
        }))
        .catch(e => console.warn('[OpenBrowser] Scheduled macro failed:', e.message));
    });
  } catch (e) {
    console.warn('[OpenBrowser] Alarm handler error:', e.message);
  }
});

// ── QUICK COMMAND PALETTE INJECTOR ──────────────────────────────────────
// Injects the floating command palette into the active tab on Ctrl+Shift+P
async function injectQuickCommandPalette(tabId) {
  if (!tabId) return;
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      // FIX: Use ISOLATED world instead of MAIN.
      // ISOLATED world shares the page DOM (so overlay injection works identically)
      // but runs in the extension's JS context, making chrome.runtime.sendMessage
      // available. In MAIN world chrome.runtime is undefined, so the palette's
      // submit button silently failed on every invocation.
      world: 'ISOLATED',
      func: () => {
        // Prevent double-injection
        if (document.getElementById('__ob_palette__')) {
          const p = document.getElementById('__ob_palette__');
          p.classList.toggle('__ob_hidden__');
          if (!p.classList.contains('__ob_hidden__')) {
            p.querySelector('input')?.focus();
          }
          return;
        }

        const style = document.createElement('style');
        style.id = '__ob_palette_style__';
        style.textContent = `
          #__ob_palette__ {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            z-index: 2147483646; display: flex; align-items: flex-start;
            justify-content: center; padding-top: 80px;
            background: rgba(0,0,0,0.55); backdrop-filter: blur(3px);
            font-family: 'Segoe UI', system-ui, sans-serif;
            animation: __ob_pal_in__ 0.12s cubic-bezier(0.2,0,0,1);
          }
          #__ob_palette__.__ob_hidden__ { display: none; }
          @keyframes __ob_pal_in__ {
            from { opacity: 0; } to { opacity: 1; }
          }
          #__ob_palette_box__ {
            background: #0d1117; border: 1px solid rgba(0,255,136,0.3);
            border-radius: 12px; width: min(600px, 90vw);
            box-shadow: 0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,255,136,0.1);
            overflow: hidden;
            animation: __ob_box_in__ 0.14s cubic-bezier(0.2,0,0,1);
          }
          @keyframes __ob_box_in__ {
            from { transform: translateY(-8px) scale(0.97); opacity:0; }
            to   { transform: none; opacity:1; }
          }
          #__ob_palette_input__ {
            width: 100%; box-sizing: border-box;
            background: transparent; border: none; outline: none;
            color: #e6edf3; font-size: 16px; padding: 18px 20px 14px;
            font-family: inherit; caret-color: #00ff88;
          }
          #__ob_palette_input__::placeholder { color: rgba(230,237,243,0.35); }
          #__ob_palette_divider__ {
            height: 1px; background: rgba(0,255,136,0.12); margin: 0;
          }
          #__ob_palette_suggestions__ {
            padding: 6px; display: flex; flex-direction: column; gap: 2px;
          }
          .ob-pal-suggestion {
            display: flex; align-items: center; gap: 10px;
            padding: 9px 14px; border-radius: 7px; cursor: pointer;
            color: rgba(230,237,243,0.7); font-size: 13px;
            transition: background 0.08s, color 0.08s;
          }
          .ob-pal-suggestion:hover, .ob-pal-suggestion.ob-active {
            background: rgba(0,255,136,0.1); color: #e6edf3;
          }
          .ob-pal-suggestion .ob-sug-icon {
            font-size: 14px; flex-shrink: 0; width: 20px; text-align: center;
          }
          .ob-pal-suggestion .ob-sug-text { flex: 1; }
          .ob-pal-suggestion .ob-sug-tag {
            font-size: 10px; color: rgba(0,255,136,0.5);
            background: rgba(0,255,136,0.07); border: 1px solid rgba(0,255,136,0.15);
            border-radius: 4px; padding: 1px 6px;
          }
          #__ob_palette_footer__ {
            padding: 8px 14px; border-top: 1px solid rgba(255,255,255,0.05);
            display: flex; gap: 16px; font-size: 10px; color: rgba(230,237,243,0.3);
          }
          .ob-pal-key {
            background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
            border-radius: 3px; padding: 1px 5px; font-family: monospace; font-size: 9px;
            color: rgba(230,237,243,0.5);
          }
        `;
        document.head.appendChild(style);

        const SUGGESTIONS = [
          { icon: '📋', text: 'Summarize this page', tag: 'reading' },
          { icon: '🌟', text: 'Highlight key information', tag: 'focus' },
          { icon: '📝', text: 'Fill the form on this page', tag: 'forms' },
          { icon: '📊', text: 'Extract all data as a table', tag: 'data' },
          { icon: '🔍', text: 'Find prices on this page', tag: 'shopping' },
          { icon: '📸', text: 'Take a screenshot and describe it', tag: 'visual' },
          { icon: '🔗', text: 'List all links on this page', tag: 'navigation' },
          { icon: '✍️', text: 'Rewrite the selected text', tag: 'writing' },
        ];

        const overlay = document.createElement('div');
        overlay.id = '__ob_palette__';

        const box = document.createElement('div');
        box.id = '__ob_palette_box__';

        const input = document.createElement('input');
        input.id = '__ob_palette_input__';
        input.placeholder = 'Tell OpenBrowser what to do on this page…';
        input.autocomplete = 'off';
        input.spellcheck = false;

        const divider = document.createElement('div');
        divider.id = '__ob_palette_divider__';

        const sugList = document.createElement('div');
        sugList.id = '__ob_palette_suggestions__';

        let activeIdx = -1;
        let filtered = [...SUGGESTIONS];

        function renderSuggestions(q) {
          filtered = q
            ? SUGGESTIONS.filter(s => s.text.toLowerCase().includes(q.toLowerCase()))
            : SUGGESTIONS;
          activeIdx = -1;
          sugList.innerHTML = '';
          filtered.slice(0, 6).forEach((s, i) => {
            const row = document.createElement('div');
            row.className = 'ob-pal-suggestion';
            row.dataset.idx = i;
            row.innerHTML = `<span class="ob-sug-icon">${s.icon}</span><span class="ob-sug-text">${s.text}</span><span class="ob-sug-tag">${s.tag}</span>`;
            row.addEventListener('mouseenter', () => setActive(i));
            row.addEventListener('click', () => submitPrompt(s.text));
            sugList.appendChild(row);
          });
        }

        function setActive(i) {
          activeIdx = i;
          sugList.querySelectorAll('.ob-pal-suggestion').forEach((el, j) => {
            el.classList.toggle('ob-active', j === i);
          });
        }

        function submitPrompt(text) {
          const prompt = text.trim();
          if (!prompt) return;
          close();
          // Send to background → sidepanel
          chrome.runtime.sendMessage({ type: 'quick-command-submit', prompt });
        }

        function close() {
          overlay.remove();
          style.remove();
        }

        input.addEventListener('input', () => renderSuggestions(input.value));
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') { e.preventDefault(); close(); return; }
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive(Math.min(activeIdx + 1, filtered.length - 1));
            return;
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive(Math.max(activeIdx - 1, 0));
            return;
          }
          if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIdx >= 0 && filtered[activeIdx]) {
              submitPrompt(filtered[activeIdx].text);
            } else {
              submitPrompt(input.value || (filtered[0]?.text ?? ''));
            }
          }
        });

        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        document.addEventListener('keydown', function esc(e) {
          if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
        });

        const footer = document.createElement('div');
        footer.id = '__ob_palette_footer__';
        footer.innerHTML = `
          <span><span class="ob-pal-key">↑↓</span> navigate</span>
          <span><span class="ob-pal-key">↵</span> run</span>
          <span><span class="ob-pal-key">Esc</span> close</span>
          <span style="margin-left:auto; color: rgba(0,255,136,0.4)">OpenBrowser</span>
        `;

        box.appendChild(input);
        box.appendChild(divider);
        box.appendChild(sugList);
        box.appendChild(footer);
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        renderSuggestions('');
        setTimeout(() => input.focus(), 50);
      }
    });
  } catch (e) {
    console.warn('[OpenBrowser] Quick palette inject failed:', e.message);
  }
}

console.log('[OpenBrowser] v3.2.6 Background worker initialized');
