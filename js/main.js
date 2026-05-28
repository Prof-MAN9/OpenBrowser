async function boot() {
  await load();
  updateBadge();
  checkBanner();
  if (!state.convId || !state.conversations.length) newConv();
  renderConv(state.convId);

  // ── All event listeners ────────────────────────────────────────
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.addEventListener('click', () => switchView(b.dataset.view))
  );
  el('btn-new-chat').addEventListener('click', () => { newConv(); renderConv(state.convId); switchView('chat'); });
  el('btn-new-chat-history').addEventListener('click', () => { newConv(); renderConv(state.convId); switchView('chat'); });
  el('model-badge').addEventListener('click', () => switchView('settings'));
  el('setup-banner').addEventListener('click', () => switchView('settings'));
  el('send-btn').addEventListener('click', send);
  el('stop-btn').addEventListener('click', () => {
    state.abort?.abort();
    state.running = false;
    el('send-btn').style.display = 'flex';
    el('stop-btn').style.display = 'none';
    setStatus('idle', 'Stopped');
    appendAssist('⏹ Stopped.');
  });
  el('chat-input').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
  el('chat-input').addEventListener('input', autoH);

  el('settings-provider').addEventListener('change', () => {
    state.settings.provider = el('settings-provider').value;
    populateModels();
  });
  el('backup-provider').addEventListener('change', () => {
    state.settings.backupProvider = el('backup-provider').value;
    populateBackupModels();
  });
  el('btn-save-settings').addEventListener('click', async () => {
    const s = state.settings;
    s.provider = el('settings-provider').value;
    s.model = el('settings-model').value;
    s.apiKey = el('settings-apikey').value.trim();
    s.baseUrl = el('settings-baseurl').value.trim();
    s.accountId = el('settings-accountid').value.trim();
    s.maxSteps = parseInt(el('settings-maxsteps').value) || 20;
    s.instructions = el('settings-instructions').value.trim();
    // Backup model
    s.backupProvider = el('backup-provider').value;
    s.backupModel = el('backup-model').value;
    s.backupApiKey = el('backup-apikey').value.trim();
    // Toggles
    s.autoScreenshot = el('toggle-auto-screenshot').checked;
    s.reasoningMode = el('toggle-reasoning').checked;
    s.persistMemory = el('toggle-persist-memory').checked;
    s.glowEffect = el('toggle-glow').checked;
    // Rate limits
    s.rpmLimit = Math.max(0, parseInt(el('settings-rpm').value) || 0);
    s.rpdLimit = Math.max(0, parseInt(el('settings-rpd').value) || 0);
    // Theme
    const activeThemeBtn = document.querySelector('.theme-btn.active');
    if (activeThemeBtn) s.theme = activeThemeBtn.dataset.theme;
    if (s.theme === 'custom') s.accentColor = el('settings-accent')?.value || '#00ff88';
    applyTheme(s.theme, s.accentColor);
    await saveSettings();
    updateBadge(); checkBanner();
    toast('Settings saved ✓');
    switchView('chat');
  });
  el('btn-clear-history').addEventListener('click', async () => {
    if (!confirm('Delete all conversation history?')) return;
    state.conversations = []; state.convId = null;
    await chrome.storage.local.remove('ob_conversations');
    newConv(); renderConv(state.convId);
    toast('History cleared');
  });

  // Check for pending message (omnibox / quick command palette)
  const d = await chrome.storage.local.get(['pendingOmniboxMessage', 'pendingOmniboxMessageId']);
  if (d.pendingOmniboxMessage) {
    const prompt = d.pendingOmniboxMessage;
    el('chat-input').value = prompt; autoH();
    await chrome.storage.local.remove(['pendingOmniboxMessage', 'pendingOmniboxMessageId']);
    // Auto-run if it came from the quick command palette (non-empty)
    if (prompt.trim()) {
      switchView('chat');
      setTimeout(() => runAgent(prompt).catch(console.error), 200);
    }
  }
  chrome.storage.onChanged.addListener(changes => {
    if (changes.pendingOmniboxMessage?.newValue) {
      const prompt = changes.pendingOmniboxMessage.newValue;
      el('chat-input').value = prompt; autoH();
      chrome.storage.local.remove(['pendingOmniboxMessage', 'pendingOmniboxMessageId']);
      // Auto-run from quick command palette
      if (prompt.trim() && !state.running) {
        switchView('chat');
        setTimeout(() => runAgent(prompt).catch(console.error), 100);
      }
    }
  });

  // ── Listen for messages from background (e.g. scheduled macros, toggle) ──
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'run-macro-prompt' && msg.prompt) {
      if (state.running) { toast(`Macro "${msg.macroName}" skipped — agent already running.`); return; }
      switchView('chat');
      toast(`▶ Running scheduled macro: "${msg.macroName}"`);
      runAgent(msg.prompt).catch(console.error);
    }
    if (msg.type === 'close-sidepanel') {
      // Graceful close: stop any running agent first
      if (state.abort) state.abort.abort();
      window.close();
    }
  });

  // Heartbeat
  setInterval(() => chrome.runtime.sendMessage({ type: 'sidepanel-heartbeat' }).catch(() => { }), 500);

  // Memory view: clear all persistent memory
  el('btn-clear-memory')?.addEventListener('click', async () => {
    if (!confirm('Clear all saved memory? This cannot be undone.')) return;
    state.memory = {};
    await chrome.storage.local.remove('ob_memory');
    toast('Memory cleared');
  });

  // ── Macros tab ───────────────────────────────────────────────────────
  await loadMacros();
  renderMacros();

  el('btn-nav-macros')?.addEventListener('click', () => switchView('macros'));

  el('btn-save-macro')?.addEventListener('click', () => {
    const lastPrompt = el('chat-input')?.dataset?.lastPrompt;
    if (!lastPrompt) { toast('Run a task first, then save it as a macro.'); return; }
    const name = prompt('Macro name:');
    if (!name?.trim()) return;
    const desc = prompt('Description (optional):') || '';
    saveMacro(name.trim(), desc.trim(), lastPrompt);
  });

  // ── Quick-action toolbar ─────────────────────────────────────────────
  el('qa-screenshot')?.addEventListener('click', async () => {
    if (state.running) return;
    switchView('chat');
    await runAgent('Take a screenshot of the current page and describe what you see.');
  });
  el('qa-scrape')?.addEventListener('click', async () => {
    if (state.running) return;
    switchView('chat');
    await runAgent('Scrape the content of the current page. Extract all text, tables, and structured data, then summarize the key findings.');
  });
  el('qa-fill')?.addEventListener('click', async () => {
    if (state.running) return;
    const raw = prompt('Enter form values as JSON:\n(e.g. {"first name":"Jane","email":"jane@example.com"})');
    if (!raw?.trim()) return;
    switchView('chat');
    await runAgent(`Smart-fill the form on this page using these values: ${raw}`);
  });
  el('qa-export')?.addEventListener('click', () => exportConversation());

  // ── Memory modal: Tabs and Clear ──────────────────────────────────
  document.querySelectorAll('#memory-modal .modal-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('#memory-modal .modal-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('#memory-modal .modal-tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(target)?.classList.add('active');
    });
  });
  el('btn-clear-rag-all')?.addEventListener('click', async () => {
    if (!confirm('Clear the ENTIRE local knowledge base? This cannot be undone.')) return;
    await RAG.clearAll();
    renderRAGDashboard();
    toast('Knowledge base cleared');
  });

  // ── Rate limit presets ───────────────────────────────────────────────
  document.querySelectorAll('.rate-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      el('settings-rpm').value = btn.dataset.rpm;
      el('settings-rpd').value = btn.dataset.rpd;
    });
  });

  // ── Citation badge in header ─────────────────────────────────────────
  el('btn-show-citations')?.addEventListener('click', () => {
    if (!state.citations.length) { toast('No citations yet. Browse and use add_citation.'); return; }
    renderCitationPanel();
  });

  // ── Initialize rate display ──────────────────────────────────────────
  updateRateDisplay();

  // ── Apply saved theme ────────────────────────────────────────────────
  applyTheme(state.settings.theme || 'dark', state.settings.accentColor);

  // ── Tooltip system ───────────────────────────────────────────────────
  initTooltips();

  // ── Modal close buttons ──────────────────────────────────────────────
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.style.display = 'none'; });
  });

  // ── Memory dashboard ─────────────────────────────────────────────────
  el('btn-open-memory')?.addEventListener('click', () => openModal('memory-modal'));
  el('btn-add-memory')?.addEventListener('click', async () => {
    const k = prompt('Memory key:'); if (!k?.trim()) return;
    const v = prompt('Value:'); if (v === null) return;
    state.memory[k.trim()] = v.trim();
    if (state.settings.persistMemory) await saveMemory();
    renderMemoryDashboard();
  });
  el('btn-clear-memory-all')?.addEventListener('click', async () => {
    if (!confirm('Clear ALL stored memories? This cannot be undone.')) return;
    state.memory = {};
    if (state.settings.persistMemory) await saveMemory();
    renderMemoryDashboard();
    toast('All memories cleared');
  });

  // ── Prompt templates ─────────────────────────────────────────────────
  el('btn-open-templates')?.addEventListener('click', () => openModal('templates-modal'));

  // ── Keyboard shortcuts overlay ───────────────────────────────────────
  function buildShortcutsPanel() {
    const body = el('shortcuts-body');
    if (!body || body.children.length) return;
    const groups = {};
    SHORTCUTS.forEach(s => { (groups[s.group] = groups[s.group] || []).push(s); });
    body.innerHTML = Object.entries(groups).map(([g, items]) => `
      <div class="shortcut-group">
        <div class="shortcut-group-title">${esc(g)}</div>
        ${items.map(s => `
          <div class="shortcut-row">
            <span class="shortcut-desc">${esc(s.desc)}</span>
            <div class="shortcut-keys">${s.keys.split('+').map(k => `<span class="shortcut-key">${esc(k)}</span>`).join('<span style="color:var(--text-dim);font-size:9px;padding:0 1px">+</span>')}</div>
          </div>`).join('')}
      </div>`).join('');
  }

  document.addEventListener('keydown', (e) => {
    const inInput = e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT';
    // Ctrl+? or Ctrl+/ = shortcuts
    if (e.ctrlKey && (e.key === '?' || e.key === '/')) {
      e.preventDefault(); buildShortcutsPanel(); openModal('shortcuts-modal'); return;
    }
    // Ctrl+K = templates
    if (e.ctrlKey && e.key === 'k') { e.preventDefault(); openModal('templates-modal'); return; }
    // Ctrl+M = memory
    if (e.ctrlKey && e.key === 'm') { e.preventDefault(); openModal('memory-modal'); return; }
    // Ctrl+N = new conversation (only when not in input)
    if (e.ctrlKey && e.key === 'n' && !inInput) { e.preventDefault(); newConv(); renderConv(state.convId); switchView('chat'); return; }
    // Alt+1-5 = nav shortcuts
    if (e.altKey && !inInput) {
      const views = ['chat', 'history', 'files', 'macros', 'settings'];
      const idx = parseInt(e.key) - 1;
      if (idx >= 0 && idx < views.length) { e.preventDefault(); switchView(views[idx]); }
    }
    // ? (no modifier, not in input) = shortcuts
    if (e.key === '?' && !e.ctrlKey && !e.altKey && !inInput) {
      buildShortcutsPanel(); openModal('shortcuts-modal');
    }
  });

  // ── Theme switcher in settings ────────────────────────────────────────
  document.querySelectorAll('.theme-btn').forEach(btn => {
    if (btn.dataset.theme === (state.settings.theme || 'dark')) btn.classList.add('active');
    btn.addEventListener('click', () => {
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.settings.theme = btn.dataset.theme;
      const accentInput = el('settings-accent');
      const accentGroup = el('accent-picker-group');
      accentGroup.style.display = btn.dataset.theme === 'custom' ? 'block' : 'none';
      applyTheme(btn.dataset.theme, btn.dataset.theme === 'custom' ? accentInput?.value : null);
    });
  });
  el('settings-accent')?.addEventListener('input', (e) => {
    if (state.settings.theme === 'custom') applyTheme('custom', e.target.value);
  });
  document.querySelectorAll('.swatch').forEach(s => {
    s.addEventListener('click', () => {
      if (el('settings-accent')) el('settings-accent').value = s.dataset.color;
      if (state.settings.theme === 'custom') applyTheme('custom', s.dataset.color);
    });
  });
  // Show accent picker if theme is custom on load
  if (state.settings.theme === 'custom') {
    el('accent-picker-group').style.display = 'block';
    if (el('settings-accent')) el('settings-accent').value = state.settings.accentColor || '#00ff88';
  }

  // ── History search ────────────────────────────────────────────────────
  el('history-search')?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase().trim();
    document.querySelectorAll('#history-list .history-item').forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = (!q || text.includes(q)) ? '' : 'none';
    });
  });

  // ── Files view wiring ─────────────────────────────────────────────────
  el('btn-refresh-files')?.addEventListener('click', renderFileTree);
  el('btn-clear-files')?.addEventListener('click', async () => {
    if (!confirm('Delete ALL files in the virtual filesystem?')) return;
    const files = await VFS.list();
    await Promise.all(files.map(f => VFS.delete(f.path)));
    renderFileTree(); toast('All files deleted');
  });
  el('files-search')?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase().trim();
    document.querySelectorAll('#file-tree .file-row').forEach(row => {
      const name = row.querySelector('.file-name').textContent.toLowerCase();
      row.style.display = (!q || name.includes(q)) ? '' : 'none';
    });
    // Hide empty groups
    let totalVisible = 0;
    document.querySelectorAll('#file-tree .file-group').forEach(group => {
      const rows = Array.from(group.querySelectorAll('.file-row'));
      const hasVisible = rows.some(r => r.style.display !== 'none');
      group.style.display = hasVisible ? '' : 'none';
      if (hasVisible) totalVisible++;
    });
    
    const intro = document.querySelector('.files-intro');
    if (intro) intro.style.display = q ? 'none' : 'block';
    
    const treeEmpty = el('file-tree-empty-msg');
    if (q && totalVisible === 0) {
      if (!treeEmpty) {
        const msg = document.createElement('div');
        msg.id = 'file-tree-empty-msg';
        msg.className = 'file-empty';
        msg.textContent = 'No matching files found.';
        el('file-tree').appendChild(msg);
      }
    } else {
      treeEmpty?.remove();
    }
  });

  // ── Page change detector ─────────────────────────────────────────────
  const PAGE_SUGGESTIONS = {
    youtube: ['Summarize this video', 'Find the key points', 'Extract comments'],
    amazon: ['Find the best price', 'Compare product specs', 'Check reviews summary'],
    github: ['Explain this repo', 'Summarize the README', 'List recent issues'],
    reddit: ['Summarize this thread', 'Find the top comments', 'Extract key opinions'],
    news: ['Summarize this article', 'Find the key facts', 'Save as citation'],
    default: ['Summarize this page', 'Take a screenshot', 'Extract key information'],
  };

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'page-changed' && state.view === 'chat') {
      const url = msg.url || '';
      const title = msg.title || url;
      const domain = (() => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } })();
      const category = Object.keys(PAGE_SUGGESTIONS).find(k => domain.includes(k)) || 'default';
      const suggestions = PAGE_SUGGESTIONS[category];

      const banner = el('page-change-banner');
      el('pcb-title').textContent = `Navigated: ${title.substring(0, 50)}${title.length > 50 ? '…' : ''}`;
      el('pcb-suggestions').innerHTML = suggestions.map(s =>
        `<button class="pcb-sug-btn">${esc(s)}</button>`
      ).join('');
      el('pcb-suggestions').querySelectorAll('.pcb-sug-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          el('chat-input').value = btn.textContent; autoH();
          banner.style.display = 'none';
          el('chat-input').focus();
        });
      });
      banner.style.display = 'flex';
      // Auto-dismiss after 12 seconds
      clearTimeout(banner._timer);
      banner._timer = setTimeout(() => { banner.style.display = 'none'; }, 12000);
    }
    
    if (msg.type === 'run-macro-prompt') {
      if (state.running) {
        toast(`Scheduled macro "${msg.macroName}" skipped (agent is busy)`);
        return;
      }
      switchView('chat');
      el('chat-input').value = msg.prompt; autoH();
      runAgent(msg.prompt);
    }
  });
  el('pcb-close')?.addEventListener('click', () => { el('page-change-banner').style.display = 'none'; });

  // ── VFS init & Files tab ─────────────────────────────────────────────
  VFS.init().catch(console.warn);


  // ── Ollama: Test Connection + Auto-discover models ───────────────────
  el('btn-ollama-test')?.addEventListener('click', async () => {
    const btn = el('btn-ollama-test');
    const baseUrl = el('settings-baseurl')?.value || 'http://localhost:11434';
    btn.textContent = 'Connecting…'; btn.disabled = true;
    const result = await discoverOllamaModels(baseUrl);
    btn.disabled = false;

    if (result?.corsError) {
      // Ollama is running but blocked the chrome-extension:// origin (HTTP 403).
      // The only fix is to set OLLAMA_ORIGINS on the server side.
      btn.textContent = '✗ CORS blocked (403)';
      btn.style.color = '#ff5555';
      const msg = [
        '🔒 Ollama is running but is blocking this extension (HTTP 403).',
        '',
        'Fix: set the OLLAMA_ORIGINS environment variable, then restart Ollama.',
        '',
        '  macOS / Linux:',
        '    OLLAMA_ORIGINS="chrome-extension://*" ollama serve',
        '',
        '  Windows (PowerShell):',
        '    $env:OLLAMA_ORIGINS="chrome-extension://*"; ollama serve',
        '',
        '  Windows (System env var):',
        '    Add OLLAMA_ORIGINS = chrome-extension://* in',
        '    System Properties → Environment Variables, then restart Ollama.',
        '',
        'After restarting, click "Test Connection" again.',
      ].join('\n');
      // Show in a modal-style overlay so the full instructions are readable
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;padding:20px';
      overlay.innerHTML = `
        <div style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:12px;max-width:480px;width:100%;padding:24px;font-family:var(--font-mono,monospace)">
          <div style="font-size:1rem;font-weight:700;color:var(--text-primary);margin-bottom:12px">🔒 Ollama CORS Setup Required</div>
          <div style="font-size:0.78rem;color:var(--text-secondary);line-height:1.7;white-space:pre-wrap">${esc(msg.split('\n').slice(2).join('\n'))}</div>
          <button id="cors-help-close" style="margin-top:18px;padding:8px 18px;background:var(--green-bright);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;font-size:0.8rem">Got it</button>
        </div>`;
      document.body.appendChild(overlay);
      document.getElementById('cors-help-close').addEventListener('click', () => overlay.remove());
      overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    } else if (result && result.length) {
      // Success — populate the model dropdown
      const sel = el('settings-model');
      sel.innerHTML = result.map(m =>
        `<option value="${m.id}">${m.label}</option>`
      ).join('');
      btn.textContent = `✓ ${result.length} models found`;
      btn.style.color = 'var(--green-bright)';
      toast(`Ollama connected — ${result.length} model${result.length !== 1 ? 's' : ''} available`);
    } else {
      btn.textContent = '✗ Not reachable';
      btn.style.color = '#ff5555';
      toast('Cannot reach Ollama. Is it running? Try: ollama serve');
    }
    setTimeout(() => { btn.textContent = 'Test Connection'; btn.style.color = ''; }, 6000);
  });

  // Quick-action: bookmark
  el('qa-bookmark')?.addEventListener('click', async () => {
    if (state.running) return;
    switchView('chat');
    await runAgent('Save the current page as a smart bookmark with auto-generated tags and summary.');
  });

  // ── VOICE INPUT ───────────────────────────────────────────────────────
  (function initVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const micBtn = el('mic-btn');
    if (!SpeechRecognition || !micBtn) {
      micBtn?.setAttribute('title', 'Voice input not supported in this browser');
      micBtn?.style.setProperty('opacity', '0.3');
      micBtn?.setAttribute('disabled', 'true');
      return;
    }

    let recognition = null;
    let isRecording = false;
    let finalTranscript = '';

    function startRecording() {
      if (isRecording) return;
      finalTranscript = '';
      recognition = new SpeechRecognition();
      recognition.lang = navigator.language || 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      const input = el('chat-input');
      const baseValue = input.value;  // preserve existing text

      recognition.onresult = (event) => {
        // Accumulate all final segments first, then append interim
        let allFinal = '';
        let interim = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            allFinal += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        finalTranscript = allFinal;
        // Show live transcript in input
        input.value = (baseValue ? baseValue + ' ' : '') + (finalTranscript || interim);
        autoH();
      };

      recognition.onerror = (e) => {
        if (e.error !== 'aborted') toast(`Voice error: ${e.error}`);
        stopRecording();
      };

      recognition.onend = () => stopRecording();

      recognition.start();
      isRecording = true;
      micBtn.classList.add('recording');
      micBtn.title = 'Recording… click to stop';
      toast('🎤 Listening…');
    }

    function stopRecording() {
      if (!isRecording) return;
      isRecording = false;
      micBtn.classList.remove('recording');
      micBtn.title = 'Voice input (click to record)';
      try { recognition?.stop(); } catch { }
      recognition = null;
    }

    micBtn.addEventListener('click', () => {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    });

    // Note: the browser fires recognition.onend automatically after silence;
    // no manual timer needed here.
  })();
}

document.addEventListener('DOMContentLoaded', () => boot().catch(console.error));
