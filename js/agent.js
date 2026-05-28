function buildSys(page) {
  const mem = Object.keys(state.memory).length
    ? '\n\nMemory (persisted across sessions):\n' +
    Object.entries(state.memory).map(([k, v]) => '  ' + k + ': ' + v).join('\n')
    : '';
  const custom = state.settings.instructions
    ? '\n\nUser instructions: ' + state.settings.instructions : '';

  const reasoning = state.settings.reasoningMode ? `

## Reasoning protocol (always follow this for complex tasks)
1. UNDERSTAND — restate the goal in one sentence using 'think'
2. PLAN — list every step needed, identify risks
3. EXECUTE — carry out steps one at a time, verifying each
4. VERIFY — When you receive a tool result with an automatic screenshot, you MUST analyze the new visual state to verify your action succeeded before taking your next action.
5. ADAPT — if something fails, reason about alternatives
6. FINISH — call 'finish' with a complete summary

Break complex tasks into sub-goals. Never guess page state — verify first.` : '';

  const autoNote = state.settings.autoScreenshot
    ? '\nAuto-screenshot: a screenshot is captured 2.5s after each action and sent to you automatically. You must use this proactive screenshot to verify your actions.'
    : '';

  const backupNote = state.backupActive ? '\n[Running on backup model — primary quota exceeded]' : '';

  return 'You are OpenBrowser v3.3, an expert AI browser automation agent.\nGitHub: https://github.com/Prof-MAN9/OpenBrowser' + backupNote + '\n\nCurrent page: ' + (page && page.url || 'none') + ' — "' + (page && page.title || '') + '"' + mem + custom + autoNote + reasoning + '\n\n## Core rules\n- Prefer visible text when clicking, not CSS selectors\n- Fill all form fields before submitting\n- If one approach fails, try an alternative\n- Always call finish when done\n- You can open tabs, navigate to URLs, and switch between multiple tabs to perform tasks. Use list_tabs to see all open tabs.\n- You control a REAL browser — actions have real effects';
}


// ── AGENT LOOP ─────────────────────────────────────────────────────
// ── AUTO-SCREENSHOT ─────────────────────────────────────────────────────────
const AUTO_SCREENSHOT_AFTER = new Set([
  'navigate', 'click', 'type', 'scroll', 'select_option',
  'run_javascript', 'open_tab', 'switch_tab'
]);

async function maybeAutoScreenshot(toolName) {
  if (!state.settings.autoScreenshot) return null;
  if (!AUTO_SCREENSHOT_AFTER.has(toolName)) return null;
  await wait(2500);
  try {
    const r = await chrome.runtime.sendMessage({ type: 'take-screenshot' });
    return r?.data || null;
  } catch {
    return null;
  }
}

async function runAgent(userMessage) {
  if (state.running) return;

  const pc = PROVIDERS[state.settings.provider];
  if (pc?.requiresKey && !state.settings.apiKey) {
    appendAssist('⚠️ No API key configured. Go to **Settings** to add your key.');
    switchView('settings');
    return;
  }

  state.running = true;
  state.backupActive = false;   // reset backup flag each new run
  state.taskPlan = null;    // reset task plan each new run
  taskPlanEl = null;
  // Store last prompt so user can save it as a macro
  if (el('chat-input')) el('chat-input').dataset.lastPrompt = userMessage;
  state.abort = new AbortController();
  el('send-btn').style.display = 'none';
  el('stop-btn').style.display = 'flex';
  setStatus('loading', 'Running…');
  if (state.settings.glowEffect) setGlow(true);

  let conv = getConv() || newConv();
  conv.messages.push({ role: 'user', content: userMessage });
  let isNewConv = false;
  if (conv.messages.filter(m => m.role === 'user').length <= 1) {
    isNewConv = true;
    conv.title = userMessage.substring(0, 50) + (userMessage.length > 50 ? '…' : '');
  }
  conv.updatedAt = Date.now();

  // Async title generation for new conversations
  if (isNewConv) {
    generateConversationTitle(conv.id, userMessage).catch(console.error);
  }

  const messages = [...conv.messages];
  const maxSteps = parseInt(state.settings.maxSteps) || 20;
  let steps = 0;
  let done = false;

  try {
    while (steps < maxSteps && !state.abort.signal.aborted && !done) {
      steps++;
      
      let page = null;
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) page = { url: tab.url, title: tab.title };
      } catch { }
      const sys = buildSys(page);

      setStatus('loading', `Step ${steps}/${maxSteps}`);
      const tid = showTyping();

      let resp;
      let streamBubble = null;
      try {
        // Use streaming for text responses; accumulate tool calls silently
        resp = await callAIStreaming(messages, sys, state.abort.signal, (chunk) => {
          // Chunk callback: create or update the streaming bubble
          if (!streamBubble) {
            removeEl(tid); // Remove typing indicator as first token arrives
            streamBubble = createStreamingBubble();
          }
          streamBubble.update(chunk);
        });
      } catch (err) {
        if (streamBubble) streamBubble.finish('');
        removeEl(tid);
        if (err.name === 'AbortError') break;
        addStep('error', '✗', 'API Error', err.message.substring(0, 300));
        break;
      }
      removeEl(tid); // Remove typing indicator if no tokens came (e.g. tool-only response)

      if (resp.type === 'text') {
        if (streamBubble) {
          streamBubble.finish(resp.text);
        } else {
          appendAssist(resp.text);
        }
        conv.messages.push({ role: 'assistant', content: resp.text });
        messages.push({ role: 'assistant', content: resp.text });
        done = true;
        break;
      }

      if (resp.type === 'tool_use') {
        // Companion text before tool calls (streamed or not)
        if (resp.text) {
          if (streamBubble) {
            streamBubble.finish(resp.text);
          } else {
            appendAssist(resp.text);
          }
          conv.messages.push({ role: 'assistant', content: resp.text });
          messages.push({ role: 'assistant', content: resp.text });
        } else if (streamBubble) {
          // No text alongside tools — remove the empty streaming bubble
          streamBubble.el.remove();
        }

        for (const tool of resp.tools) {
          if (state.abort.signal.aborted) break;

          const icon = TOOL_ICONS[tool.name] || '🔧';
          const stepId = addStep('loading', icon, tool.name, JSON.stringify(tool.input).substring(0, 120));

          // Record tool_use in message history
          const tuMsg = { type: 'tool_use', role: 'assistant', id: tool.id, name: tool.name, input: tool.input };
          messages.push(tuMsg);
          conv.messages.push(tuMsg);

          const result = await executeTool(tool.name, tool.input);

          // ── Auto-screenshot 2.5 s after action ──────────────────
          // Happens in background while we process the tool result
          let autoShotData = null;
          const autoShotPromise = maybeAutoScreenshot(tool.name);

          if (result.screenshot) appendScreenshot(result.screenshot);
          updateStep(stepId, result.ok ? 'success' : 'error', icon, tool.name, String(result.result || '').substring(0, 150));

          // Resolve auto-screenshot (awaits 2.5 s then captures)
          if (!result.screenshot) {   // don't double-screenshot if tool already returned one
            autoShotData = await autoShotPromise;
            if (autoShotData) appendScreenshot(autoShotData);
          } else {
            autoShotPromise.catch(() => { });  // suppress any errors
          }

          // Record tool_result — include auto-screenshot if we got one
          let trContent;
          if (result.screenshot) {
            trContent = [
              { type: 'text', text: result.result || 'Done' },
              { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: result.screenshot } }
            ];
          } else if (autoShotData) {
            trContent = [
              { type: 'text', text: result.result || (result.ok ? 'Done' : 'Failed') },
              { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: autoShotData } }
            ];
          } else {
            trContent = String(result.result || (result.ok ? 'Done' : 'Failed'));
          }

          const trMsg = {
            type: 'tool_result', role: 'user',
            tool_use_id: tool.id, toolName: tool.name,
            content: trContent, ok: result.ok
          };
          messages.push(trMsg);
          conv.messages.push(trMsg);

          if (tool.name === 'finish') {
            appendAssist(tool.input.answer);
            conv.messages.push({ role: 'assistant', content: tool.input.answer });
            done = true;
          }
        }
      }
    }

    if (!done && steps >= maxSteps) {
      const m = `Reached the step limit (${maxSteps}). Ask me to continue if needed.`;
      appendAssist(m);
      conv.messages.push({ role: 'assistant', content: m });
    }

  } finally {
    state.running = false;
    state.abort = null;
    el('send-btn').style.display = 'flex';
    el('stop-btn').style.display = 'none';
    setStatus('idle', 'Ready');
    setGlow(false);
    // Persist memory if enabled
    if (state.settings.persistMemory && Object.keys(state.memory).length) {
      chrome.storage.local.set({ ob_memory: state.memory }).catch(() => { });
    }
    conv.updatedAt = Date.now();
    await saveConvs();
  }
}

async function generateConversationTitle(convId, firstMessage) {
  try {
    const s = state.settings;
    const providerKey = state.backupActive ? s.backupProvider : s.provider;
    if (!providerKey) return;

    const sys = "You generate very short, 3-5 word titles for conversations based on the first message. Reply ONLY with the title. Do not use quotes or punctuation.";
    const req = await buildProviderRequest(providerKey, s.model, s.apiKey, s.baseUrl, s.accountId, [{ role: 'user', content: firstMessage }], sys);

    // Override max_tokens to be very small and drop tools to save money/time
    req.body.max_tokens = 15;
    req.body.tools = undefined;
    if (req.body.generationConfig) req.body.generationConfig.maxOutputTokens = 15;

    const res = await fetch(req.url, {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(8000)
    });

    if (res.ok) {
      const parsed = parseAIResponse(await res.json(), req.format);
      let title = parsed.text ? parsed.text.trim().replace(/^["']|["']$/g, '') : '';
      if (title.length > 0 && title.length < 50) {
        const c = state.conversations.find(x => x.id === convId);
        if (c) {
          c.title = title;
          await saveConvs();
          if (state.view === 'history') renderHistory();
        }
      }
    }
  } catch {
    // Ignore errors for auto-titles
  }
}

const TOOL_ICONS = {
  navigate: '🌐', click: '👆', type: '⌨️', scroll: '↕️', screenshot: '📸',
  get_page_content: '📄', scrape_page: '🕷️', run_javascript: '⚡',
  open_tab: '🔗', switch_tab: '🔄', list_tabs: '📋', wait: '⏳',
  extract_data: '📊', download_csv: '💾', select_option: '▼',
  think: '💭', reason: '🧩', memorize: '🧠', recall: '💡', finish: '✅',
  smart_fill_form: '📝', scan_forms: '🔍', create_task_plan: '📋',
  update_task_step: '✔️', export_data: '📤',
  summarize_tabs: '📑', cross_site_research: '🔀', auto_highlight: '🌟',
  remove_highlights: '🚫', add_citation: '📌', show_citations: '📚', clear_citations: '🗑️',
  browse_intent: '🎯', save_bookmark: '🔖', show_bookmarks: '📂',
  write_file: '💾', read_file: '📖', list_files: '📁', delete_file: '🗑️'
};

// ── GLOW EFFECT ─────────────────────────────────────────────────────
function setGlow(on) {
  // Glow on the sidepanel overlay
  if (!state.settings.glowEffect) {
    document.getElementById('glow-overlay')?.classList.remove('active');
  } else {
    document.getElementById('glow-overlay')?.classList.toggle('active', on);
  }

  // Glow injected into the CONTROLLED PAGE (the active browser tab)
  // This is what the user actually sees as shown in Example_1.mp4
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs?.[0];
    if (!tab?.id || tab.url?.startsWith('chrome')) return;

    if (on) {
      // Inject a fixed overlay onto the page
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: 'MAIN',
        func: () => {
          if (document.getElementById('__ob_glow__')) return;
          const style = document.createElement('style');
          style.id = '__ob_glow_style__';
          style.textContent = `
            @keyframes __ob_glow_pulse__ {
              0%,100% { border-color: rgba(0,255,136,0.3); box-shadow: inset 0 0 30px rgba(0,255,136,0.04); }
              50%     { border-color: rgba(0,255,136,0.85); box-shadow: inset 0 0 30px rgba(0,255,136,0.12), 0 0 0 1px rgba(0,255,136,0.4); }
            }
            #__ob_glow__ {
              position: fixed; inset: 0; z-index: 2147483647;
              pointer-events: none;
              border: 2px solid rgba(0,255,136,0.5);
              animation: __ob_glow_pulse__ 1.8s ease-in-out infinite;
              box-sizing: border-box;
            }
            #__ob_glow__::before, #__ob_glow__::after {
              content: '';
              position: absolute;
              width: 20px; height: 20px;
              border-color: #00ff88; border-style: solid; opacity: 0.9;
            }
            #__ob_glow__::before { top: 1px; left: 1px; border-width: 3px 0 0 3px; }
            #__ob_glow__::after  { bottom: 1px; right: 1px; border-width: 0 3px 3px 0; }
          `;
          const overlay = document.createElement('div');
          overlay.id = '__ob_glow__';
          document.head.appendChild(style);
          document.documentElement.appendChild(overlay);
        }
      }).catch(() => { });
    } else {
      // Remove overlay from page
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: 'MAIN',
        func: () => {
          document.getElementById('__ob_glow__')?.remove();
          document.getElementById('__ob_glow_style__')?.remove();
        }
      }).catch(() => { });
    }
  });
}

// ══════════════════════════════════════════════════════════════════
// UI LAYER
// ══════════════════════════════════════════════════════════════════
