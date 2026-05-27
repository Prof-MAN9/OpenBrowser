const el = id => document.getElementById(id);
let stepN = 0;

function msgs() { return el('chat-messages'); }

function showTyping() {
  const id = 'ty-' + uid();
  const d = document.createElement('div');
  d.id = id; d.className = 'typing-indicator';
  d.innerHTML = '<div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div><span>Thinkingâ€¦</span>';
  msgs().appendChild(d); scrollEnd(); return id;
}

function removeEl(id) { el(id)?.remove(); }

// â”€â”€ TAB SUMMARY RENDERER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderTabSummary(tabs) {
  const d = document.createElement('div');
  d.className = 'msg tab-summary-msg';
  d.innerHTML = `
    <div class="tab-summary-header">ðŸ“‘ Tab Summary â€” ${tabs.length} tab${tabs.length !== 1 ? 's' : ''}</div>
    <div class="tab-summary-list">
      ${tabs.map(t => `
        <div class="tab-summary-item">
          <img class="tab-favicon" src="https://www.google.com/s2/favicons?sz=16&domain=${encodeURIComponent(t.url || '')}" width="14" height="14" onerror="this.style.display='none'" />
          <div class="tab-summary-info">
            <div class="tab-summary-title">${esc(t.title || 'Untitled')}</div>
            <div class="tab-summary-url">${esc((t.url || '').substring(0, 55))}${(t.url || '').length > 55 ? 'â€¦' : ''}</div>
          </div>
          <span class="tab-id-badge">#${t.tabId}</span>
        </div>`).join('')}
    </div>`;
  msgs().appendChild(d);
  d.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// â”€â”€ COMPARISON TABLE RENDERER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderComparisonTable(rows, attributes, question) {
  const d = document.createElement('div');
  d.className = 'msg data-table-msg';
  const cols = attributes?.length ? attributes : ['Content'];
  const header = ['Source', ...cols].map(k => `<th>${esc(k)}</th>`).join('');
  const bodyRows = rows.map(r =>
    `<tr><td><a class="compare-link" href="${esc(r.url)}" target="_blank" title="${esc(r.url)}">${esc((r.title || r.url || '').substring(0, 32))}â€¦</a></td>${cols.map(() => '<td class="compare-empty">â€”</td>').join('')}</tr>`
  ).join('');
  d.innerHTML = `
    <div class="data-table-header">ðŸ”€ Cross-site Research â€” ${rows.length} tabs
      ${question ? `<div class="compare-q">${esc(question)}</div>` : ''}
    </div>
    <div class="data-table-wrap">
      <table class="data-table"><thead><tr>${header}</tr></thead><tbody>${bodyRows}</tbody></table>
    </div>
    <div class="table-more">AI analysis follows â†“</div>`;
  msgs().appendChild(d);
  d.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// â”€â”€ CITATION PANEL RENDERER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderCitationPanel() {
  const d = document.createElement('div');
  d.className = 'msg citation-panel';
  d.innerHTML = `
    <div class="citation-header">
      <span>ðŸ“š Citations (${state.citations.length})</span>
      <div class="citation-export-btns">
        <button class="cite-export-btn" data-fmt="txt">TXT</button>
        <button class="cite-export-btn" data-fmt="md">MD</button>
        <button class="cite-export-btn" data-fmt="bib">BibTeX</button>
      </div>
    </div>
    <ol class="citation-list">
      ${state.citations.map(c => `
        <li class="citation-item">
          <div class="citation-title"><a href="${esc(c.url)}" target="_blank">${esc(c.title)}</a></div>
          ${c.author ? `<div class="citation-meta">${esc(c.author)}${c.date ? ' Â· ' + c.date.substring(0, 10) : ''}</div>` : ''}
          ${c.note ? `<div class="citation-note">"${esc(c.note)}"</div>` : ''}
          <div class="citation-formatted">${esc(c.formatted)}</div>
        </li>`).join('')}
    </ol>`;
  d.querySelectorAll('.cite-export-btn').forEach(btn =>
    btn.addEventListener('click', () => executeTool('show_citations', { export_format: btn.dataset.fmt }).catch(() => { }))
  );
  msgs().appendChild(d);
  d.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function updateCitationBadge() {
  const badge = el('citation-count');
  if (!badge) return;
  const n = state.citations.length;
  badge.textContent = n > 0 ? n : '';
  badge.style.display = n > 0 ? 'flex' : 'none';
}

// â”€â”€ BOOKMARK RENDERERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderBookmarkSaved({ url, title, summary, tags }) {
  const d = document.createElement('div');
  d.className = 'msg bookmark-saved-msg';
  d.innerHTML = `
    <div class="bookmark-saved-icon">ðŸ”–</div>
    <div class="bookmark-saved-body">
      <div class="bookmark-saved-title"><a href="${esc(url)}" target="_blank">${esc(title)}</a></div>
      ${summary ? `<div class="bookmark-saved-summary">${esc(summary.substring(0, 100))}â€¦</div>` : ''}
      ${tags.length ? `<div class="bookmark-tags">${tags.map(t => `<span class="bookmark-tag">${esc(t)}</span>`).join('')}</div>` : ''}
    </div>`;
  msgs().appendChild(d);
  d.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function renderBookmarkPanel(bookmarks, filter) {
  const d = document.createElement('div');
  d.className = 'msg bookmark-panel';
  d.innerHTML = `
    <div class="bookmark-panel-header">
      <span>ðŸ“‚ Bookmarks${filter ? ` â€” "${esc(filter)}"` : ''} (${bookmarks.length})</span>
    </div>
    ${bookmarks.length === 0 ? '<div class="bookmarks-empty">No bookmarks yet.</div>' : `
    <div class="bookmark-list">
      ${bookmarks.slice(0, 30).map(b => `
        <div class="bookmark-item">
          <img class="tab-favicon" src="https://www.google.com/s2/favicons?sz=14&domain=${encodeURIComponent(b.url || '')}" width="14" height="14" onerror="this.style.display='none'" />
          <div class="bookmark-item-body">
            <a class="bookmark-item-title" href="${esc(b.url)}" target="_blank">${esc(b.title || b.url)}</a>
            ${b.summary ? `<div class="bookmark-item-summary">${esc(b.summary.substring(0, 80))}</div>` : ''}
            ${b.tags?.length ? `<div class="bookmark-tags">${b.tags.map(t => `<span class="bookmark-tag">${esc(t)}</span>`).join('')}</div>` : ''}
          </div>
        </div>`).join('')}
    </div>`}`;
  msgs().appendChild(d);
  d.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// â”€â”€ TOOLTIP SYSTEM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Floating "i" icons that appear next to labeled UI elements
const TOOLTIPS = {
  'settings-provider': 'The AI service that powers OpenBrowser. Anthropic (Claude), OpenAI (GPT-4), Gemini, Groq (free+fast), or Ollama (fully local, free).',
  'settings-model': 'The specific model to use. Larger models are smarter but slower and more expensive.',
  'settings-apikey': 'Your private API key â€” stored only in your browser, never sent to us.',
  'settings-maxsteps': 'How many tool calls the agent can make per task. More steps = more complex tasks, more API usage.',
  'settings-rpm': 'Requests Per Minute limit. The agent will stop 5 calls before this limit to protect your quota.',
  'settings-rpd': 'Requests Per Day limit. Useful for free-tier APIs like Anthropic free (25/day) or Groq (1000/day).',
  'backup-provider': 'If your primary model hits its quota, the agent automatically switches to this backup and continues.',
  'toggle-auto-screenshot': 'After each action (click, type, navigate), automatically takes a screenshot so the AI can see the result.',
  'toggle-reasoning': 'Injects a 6-step reasoning protocol into every prompt. Makes the agent more methodical and less likely to get stuck.',
  'toggle-persist-memory': 'Saves the agent\'s "memorize" notes across browser sessions. The AI can recall things from previous conversations.',
  'toggle-glow': 'Shows a pulsing green border on the controlled webpage while the agent is running, so you know which tab is active.',
  'btn-open': 'Opens the OpenBrowser side panel in your current browser window.',
};

function initTooltips() {
  // Create a shared tooltip element
  const tip = document.createElement('div');
  tip.id = 'ob-tooltip';
  tip.className = 'ob-tooltip';
  document.body.appendChild(tip);

  // Attach "i" badges to labeled form elements
  document.querySelectorAll('[id]').forEach(target => {
    const tooltipText = TOOLTIPS[target.id];
    if (!tooltipText) return;

    // Find the label for this element
    const label = document.querySelector(`label[for="${target.id}"]`)
      || target.closest('.form-group')?.querySelector('.form-label')
      || target.closest('.toggle-row')?.querySelector('.toggle-label');
    if (!label) return;

    const badge = document.createElement('button');
    badge.className = 'tooltip-badge';
    badge.textContent = 'i';
    badge.setAttribute('aria-label', 'More info');
    badge.setAttribute('type', 'button');
    label.appendChild(badge);

    badge.addEventListener('mouseenter', (e) => {
      tip.textContent = tooltipText;
      tip.classList.add('visible');
      const r = badge.getBoundingClientRect();
      const panelR = document.getElementById('app').getBoundingClientRect();
      tip.style.top = (r.bottom - panelR.top + 6) + 'px';
      tip.style.left = Math.max(8, r.left - panelR.left - 100) + 'px';
    });
    badge.addEventListener('mouseleave', () => tip.classList.remove('visible'));
    badge.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      tip.textContent = tooltipText;
      tip.classList.toggle('visible');
      const r = badge.getBoundingClientRect();
      const panelR = document.getElementById('app').getBoundingClientRect();
      tip.style.top = (r.bottom - panelR.top + 6) + 'px';
      tip.style.left = Math.max(8, r.left - panelR.left - 100) + 'px';
    });
  });

  // Click anywhere else hides tooltip
  document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('tooltip-badge')) tip.classList.remove('visible');
  });
}

// â”€â”€ TASK PLAN RENDERER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let taskPlanEl = null;  // keep reference so we can update it in-place

function renderTaskPlan() {
  const plan = state.taskPlan;
  if (!plan) return;

  const statusIcon = { pending: 'â—‹', active: 'â—‰', done: 'âœ“', failed: 'âœ—' };
  const statusClass = { pending: 'task-pending', active: 'task-active', done: 'task-done', failed: 'task-failed' };

  const inner = `
    <div class="task-plan-title">${esc(plan.title)}</div>
    <ol class="task-plan-steps">
      ${plan.steps.map((s, i) => `
        <li class="task-step ${statusClass[s.status] || 'task-pending'}">
          <span class="task-step-icon">${statusIcon[s.status] || 'â—‹'}</span>
          <span class="task-step-text">${esc(s.text)}${s.note ? ` <em>${esc(s.note)}</em>` : ''}</span>
        </li>`).join('')}
    </ol>`;

  if (taskPlanEl && taskPlanEl.isConnected) {
    taskPlanEl.innerHTML = inner;
  } else {
    const d = document.createElement('div');
    d.className = 'msg task-plan-msg';
    d.innerHTML = inner;
    msgs().appendChild(d);
    taskPlanEl = d;
    d.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }
}

// â”€â”€ DATA TABLE RENDERER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderDataTable(rows, name) {
  if (!rows || !rows.length) return;
  const keys = Object.keys(rows[0]);
  const header = keys.map(k => `<th>${esc(k)}</th>`).join('');
  const bodyRows = rows.slice(0, 200).map(r =>
    `<tr>${keys.map(k => `<td>${esc(String(r[k] ?? ''))}</td>`).join('')}</tr>`
  ).join('');
  const extra = rows.length > 200 ? `<div class="table-more">+${rows.length - 200} more rows in download</div>` : '';

  const d = document.createElement('div');
  d.className = 'msg data-table-msg';
  d.innerHTML = `
    <div class="data-table-header">
      <span>ðŸ“Š ${esc(name)} â€” ${rows.length} rows Ã— ${keys.length} cols</span>
    </div>
    <div class="data-table-wrap">
      <table class="data-table"><thead><tr>${header}</tr></thead><tbody>${bodyRows}</tbody></table>
    </div>${extra}`;
  msgs().appendChild(d);
  d.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function addStep(status, icon, label, text) {
  const id = 'step-' + (++stepN);
  const d = document.createElement('div');
  d.id = id; d.className = `tool-step ${status}`;
  d.innerHTML = `<span class="tool-icon">${status === 'loading' ? '<div class="spinner"></div>' : esc(icon)}</span>
    <div class="tool-content"><div class="tool-label">${esc(label)}</div><div class="tool-text">${esc(text)}</div></div>`;
  msgs().appendChild(d); scrollEnd(); return id;
}

function updateStep(id, status, icon, label, text) {
  const d = el(id); if (!d) return;
  d.className = `tool-step ${status}`;
  d.innerHTML = `<span class="tool-icon">${esc(icon)}</span>
    <div class="tool-content"><div class="tool-label">${esc(label)}</div><div class="tool-text">${esc(text)}</div></div>`;
}

function appendAssist(text) {
  msgs().querySelector('.empty-state')?.remove();
  const d = document.createElement('div');
  d.className = 'message message-assistant';
  d.innerHTML = `<div class="msg-bubble">${md(text)}</div>
    <div class="msg-actions"><button class="msg-action-btn copy-btn">Copy</button></div>`;
  d.querySelector('.copy-btn').addEventListener('click', function () {
    navigator.clipboard.writeText(text).then(() => { this.textContent = 'Copied!'; setTimeout(() => this.textContent = 'Copy', 1500); });
  });
  msgs().appendChild(d); scrollEnd();
}

// â”€â”€ STREAMING ASSISTANT MESSAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Creates a live-updating bubble that streams tokens in character by character.
// Returns { el, update(chunk), finish(fullText) }
function createStreamingBubble() {
  msgs().querySelector('.empty-state')?.remove();
  const d = document.createElement('div');
  d.className = 'message message-assistant streaming-msg';
  d.innerHTML = `<div class="msg-bubble"><span class="stream-text"></span><span class="stream-cursor">â–‹</span></div>`;
  msgs().appendChild(d); scrollEnd();
  const span = d.querySelector('.stream-text');
  const cursor = d.querySelector('.stream-cursor');
  let rawText = '';

  return {
    el: d,
    update(chunk) {
      rawText += chunk;
      // md() output is produced by our own renderer with esc() applied to
      // user-visible text â€” safe to assign as innerHTML here.
      span.innerHTML = md(rawText);
      scrollEnd();
    },
    finish(fullText) {
      rawText = fullText || rawText;
      cursor.remove();
      span.innerHTML = md(rawText);
      // Swap out streaming class, add copy button
      d.classList.remove('streaming-msg');
      const actions = document.createElement('div');
      actions.className = 'msg-actions';
      const copyBtn = document.createElement('button');
      copyBtn.className = 'msg-action-btn copy-btn';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', function () {
        navigator.clipboard.writeText(rawText).then(() => { this.textContent = 'Copied!'; setTimeout(() => this.textContent = 'Copy', 1500); });
      });
      actions.appendChild(copyBtn);
      d.querySelector('.msg-bubble').after(actions);
      scrollEnd();
    }
  };
}

// â”€â”€ STREAMING callAI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Calls the AI with streaming=true and yields text chunks via onChunk callback.
// Falls back to non-streaming if the provider doesn't support it.
// Returns the same { type, text, tools } shape as callAI.
async function callAIStreaming(messages, sys, signal, onChunk) {
  const s = state.settings;
  checkRateLimit();

  const providerKey = state.backupActive ? s.backupProvider : s.provider;
  const modelId = state.backupActive ? s.backupModel : s.model;
  const apiKey = state.backupActive ? s.backupApiKey : s.apiKey;
  const baseUrl = state.backupActive ? '' : s.baseUrl;
  const accountId = state.backupActive ? '' : s.accountId;

  const req = await buildProviderRequest(providerKey, modelId, apiKey, baseUrl, accountId, messages, sys);

  // Inject streaming flag
  if (req.format === 'anthropic') {
    req.body.stream = true;
  } else if (req.format === 'openai') {
    req.body.stream = true;
  } else if (req.format === 'gemini') {
    // Modify URL for SSE
    if (req.url.includes('?')) req.url = req.url.replace('?', '?alt=sse&');
    else req.url += '?alt=sse';
  } else {
    // Others: fall back to non-streaming
    return callAI(messages, sys, signal);
  }

  const res = await fetch(req.url, {
    method: 'POST',
    headers: req.headers,
    body: JSON.stringify(req.body),
    signal
  });

  recordApiCall();

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    // Ollama-specific: 403 means the server rejected the chrome-extension:// origin.
    // This is a CORS configuration issue â€” don't fall through to backup model logic.
    if (res.status === 403 && providerKey === 'ollama') {
      throw new Error(
        'Ollama blocked this request (HTTP 403 â€” CORS).\n\n' +
        'Ollama does not allow requests from browser extensions by default.\n\n' +
        'Fix: restart Ollama with the OLLAMA_ORIGINS environment variable:\n\n' +
        '  macOS/Linux:   OLLAMA_ORIGINS="chrome-extension://*" ollama serve\n' +
        '  Windows (PS):  $env:OLLAMA_ORIGINS="chrome-extension://*"; ollama serve\n\n' +
        'Then click "Test Connection" in Settings to confirm it worked.'
      );
    }
    if (!state.backupActive && isQuotaError(res.status, errText) && s.backupProvider && s.backupModel && s.backupApiKey) {
      state.backupActive = true;
      addStep('error', 'âš ï¸', 'Primary quota hit', `Switching to backup: ${s.backupModel}`);
      toast('Primary model quota exceeded â€” switching to backup model');
      return callAIStreaming(messages, sys, signal, onChunk);
    }
    throw new Error(`API ${res.status}: ${errText.substring(0, 400)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let rawBody = '';  // Raw accumulation â€” fallback if Ollama returns non-SSE JSON
  let fullText = '';
  const toolCalls = [];    // For OpenAI streaming tool accumulation
  let currentToolCall = null;

  // UX: if Ollama takes > 6s with no tokens (model loading), update status bar
  let firstTokenReceived = false;
  const ollamaLoadingHint = (providerKey === 'ollama') ? setTimeout(() => {
    if (!firstTokenReceived) setStatus('loading', 'Ollama is loading the modelâ€¦');
  }, 6000) : null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const decoded = decoder.decode(value, { stream: true });
      rawBody += decoded;          // accumulate everything for fallback
      buffer += decoded;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const dataStr = line.slice(6).trim();
        if (dataStr === '[DONE]') continue;

        let chunk;
        try { chunk = JSON.parse(dataStr); } catch { continue; }

        if (req.format === 'anthropic') {
          // Anthropic streaming events
          if (chunk.type === 'content_block_delta') {
            if (chunk.delta?.type === 'text_delta') {
              const text = chunk.delta.text || '';
              fullText += text;
              firstTokenReceived = true;
              onChunk(text);
            }
          } else if (chunk.type === 'content_block_start' && chunk.content_block?.type === 'tool_use') {
            currentToolCall = { id: chunk.content_block.id, name: chunk.content_block.name, inputRaw: '' };
          } else if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'input_json_delta') {
            if (currentToolCall) currentToolCall.inputRaw += chunk.delta.partial_json || '';
          } else if (chunk.type === 'content_block_stop' && currentToolCall) {
            try { currentToolCall.input = JSON.parse(currentToolCall.inputRaw || '{}'); } catch { currentToolCall.input = {}; }
            toolCalls.push({ id: currentToolCall.id, name: currentToolCall.name, input: currentToolCall.input });
            currentToolCall = null;
          }
        } else if (req.format === 'openai' || req.format === 'openai-responses') {
          // OpenAI streaming events
          const delta = chunk.choices?.[0]?.delta;
          if (!delta) continue;
          if (delta.content) {
            fullText += delta.content;
            firstTokenReceived = true;
            onChunk(delta.content);
          }
          if (delta.tool_calls?.length) {
            firstTokenReceived = true;
            for (const tc of delta.tool_calls) {
              const idx = tc.index ?? 0;
              if (!toolCalls[idx]) toolCalls[idx] = { id: '', name: '', inputRaw: '' };
              if (tc.id) toolCalls[idx].id += tc.id;
              if (tc.function?.name) toolCalls[idx].name += tc.function.name;
              if (tc.function?.arguments) toolCalls[idx].inputRaw += tc.function.arguments;
            }
          }
        } else if (req.format === 'gemini') {
          // Gemini streaming events
          const parts = chunk.candidates?.[0]?.content?.parts || [];
          for (const p of parts) {
            if (p.text) {
              fullText += p.text;
              firstTokenReceived = true;
              onChunk(p.text);
            }
            if (p.functionCall) {
              firstTokenReceived = true;
              toolCalls.push({ id: uid(), name: p.functionCall.name, input: p.functionCall.args || {} });
            }
          }
        }
      }
    }
  } finally {
    clearTimeout(ollamaLoadingHint);
    reader.releaseLock();
  }

  // Parse accumulated tool calls for OpenAI
  if ((req.format === 'openai' || req.format === 'openai-responses') && toolCalls.length) {
    const parsed = toolCalls.filter(tc => tc.name).map(tc => {
      try { return { id: tc.id, name: tc.name, input: JSON.parse(tc.inputRaw || '{}') }; }
      catch { return { id: tc.id, name: tc.name, input: {} }; }
    });
    if (parsed.length) return { type: 'tool_use', tools: parsed, text: fullText };
  }

  // Check for Anthropic tool calls
  if (req.format === 'anthropic' && toolCalls.length) {
    return { type: 'tool_use', tools: toolCalls, text: fullText };
  }

  // Check for Gemini tool calls
  if (req.format === 'gemini' && toolCalls.length) {
    return { type: 'tool_use', tools: toolCalls, text: fullText };
  }

  // XML fallback detection in streamed text
  if (fullText) {
    const xmlTools = detectXMLToolCalls(fullText);
    if (xmlTools) return { type: 'tool_use', tools: xmlTools, text: '' };
  }

  // â”€â”€ Fallback: Ollama (and some providers) sometimes return plain JSON
  // instead of SSE when stream:true is set but the model buffers the full
  // response before sending (e.g. during initial model load). Try parsing
  // the raw body as a standard chat completion response.
  if (!fullText && !toolCalls.length && rawBody.trim()) {
    try {
      const fallbackData = JSON.parse(rawBody.trim());
      return parseAIResponse(fallbackData, req.format);
    } catch { /* not valid JSON â€” fall through to empty-response error */ }
  }

  // â”€â”€ Empty stream: surface a clear error instead of silently returning
  // blank text (which makes the agent stop with no user-visible output).
  if (!fullText && !toolCalls.length) {
    const hint = providerKey === 'ollama'
      ? 'Ollama returned an empty response. The model may have been unloaded or does not support streaming with tool definitions. Try sending your message again â€” if the problem persists, try a different model (llama3.2 or qwen2.5 work best).'
      : 'The AI returned an empty response. Please try again.';
    throw new Error(hint);
  }

  return { type: 'text', text: fullText };
}

function appendUser(text) {
  msgs().querySelector('.empty-state')?.remove();
  const d = document.createElement('div');
  d.className = 'message message-user';
  d.innerHTML = `<div class="msg-bubble">${esc(text).replace(/\n/g, '<br>')}</div>`;
  msgs().appendChild(d); scrollEnd();
}

function appendScreenshot(data) {
  const d = document.createElement('div');
  d.className = 'message message-assistant';
  d.innerHTML = `<img class="screenshot-preview" src="data:image/jpeg;base64,${data}" alt="Screenshot" />`;
  msgs().appendChild(d); scrollEnd();
}

function scrollEnd() { const c = msgs(); c.scrollTop = c.scrollHeight; }

function setStatus(type, text) {
  el('status-dot').className = 'status-dot' + (type === 'loading' ? ' loading' : type === 'error' ? ' error' : '');
  el('status-text').textContent = text;
}

function toast(msg) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = Object.assign(document.createElement('div'), { className: 'toast', textContent: msg });
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}

function emptyState() {
  msgs().innerHTML = `
    <div class="empty-state">
      <div class="empty-logo">
        <img src="data:image/png;base64,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" width="52" height="52" alt="OpenBrowser" style="filter:drop-shadow(0 0 12px rgba(0,255,136,0.5))" />
      </div>
      <div class="empty-title">OpenBrowser</div>
      <div class="empty-subtitle">Free, open-source AI browser agent. Describe your task below.</div>
      <div class="example-grid" id="eg">
        <button class="example-item" data-p="Scrape all the data on this page into a CSV file"><span class="example-icon">ðŸ“Š</span>Scrape to CSV</button>
        <button class="example-item" data-p="Fill out this form using my information"><span class="example-icon">ðŸ“</span>Fill a form</button>
        <button class="example-item" data-p="Search Google for the best price of this product and compare results"><span class="example-icon">ðŸ›’</span>Compare prices</button>
        <button class="example-item" data-p="Summarize the main points on this page"><span class="example-icon">ðŸ“–</span>Summarize page</button>
      </div>
    </div>`;
  document.querySelectorAll('#eg .example-item').forEach(b => {
    b.addEventListener('click', () => { el('chat-input').value = b.dataset.p; autoH(); el('chat-input').focus(); });
  });
}

function renderConv(id) {
  const conv = state.conversations.find(c => c.id === id);
  msgs().innerHTML = '';
  if (!conv || !conv.messages.length) { emptyState(); return; }

  // Map to link tool_use to its result
  const results = {};
  conv.messages.forEach(m => { if (m.type === 'tool_result') results[m.tool_use_id] = m; });

  for (const m of conv.messages) {
    if (m.role === 'system') continue;

    if (m.type === 'tool_use') {
      const res = results[m.id];
      const status = res ? (res.ok ? 'success' : 'error') : 'success';
      const resultText = res ? (typeof res.content === 'string' ? res.content : (Array.isArray(res.content) ? res.content.find(b => b.type === 'text')?.text : '')) : '';
      
      const stepId = addStep(status, TOOL_ICONS[m.name] || 'ðŸ”§', m.name, JSON.stringify(m.input).substring(0, 100));
      
      if (resultText) {
        updateStep(stepId, status, TOOL_ICONS[m.name] || 'ðŸ”§', m.name, resultText.substring(0, 200));
      }

      // Render screenshots if they exist in the result
      if (res && Array.isArray(res.content)) {
        const img = res.content.find(b => b.type === 'image');
        if (img?.source?.data) appendScreenshot(img.source.data);
      }
      continue;
    }

    if (m.type === 'tool_result') continue;

    if (m.content && typeof m.content === 'string') {
      if (m.role === 'user') appendUser(m.content);
      else appendAssist(m.content);
    }
  }
}

function renderHistory() {
  const list = el('history-list');
  if (!state.conversations.length) {
    list.innerHTML = '<div class="history-empty">No conversations yet.</div>'; return;
  }
  list.innerHTML = '';
  state.conversations.forEach(c => {
    const d = document.createElement('div');
    d.className = 'history-item' + (c.id === state.convId ? ' active' : '');
    const dt = new Date(c.updatedAt);
    d.innerHTML = `<div class="history-title">${esc(c.title)}</div>
      <div class="history-meta">${dt.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Â· ${c.messages.filter(m => m.role === 'user').length} msgs</div>`;
    d.addEventListener('click', () => { state.convId = c.id; renderConv(c.id); switchView('chat'); });
    list.appendChild(d);
  });
}

// â”€â”€ SETTINGS UI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function populateModels() {
  const pKey = el('settings-provider').value;
  const pc = PROVIDERS[pKey];

  el('settings-model').innerHTML = (pc?.models || [])
    .map(m => `<option value="${m.id}"${m.id === state.settings.model ? ' selected' : ''}>${m.label}</option>`)
    .join('');

  // Dynamic placeholder + hint
  el('settings-apikey').placeholder = pc?.keyPlaceholder || 'API key';
  el('api-key-hint').textContent = pc?.keyHint || 'Your key is stored locally only.';
  
  // Model capability hints
  const m = (pc?.models || []).find(x => x.id === state.settings.model);
  const capHint = m?.id.includes('4.') || m?.id.includes('5.') || m?.id.includes('3.') ? 'Supports 64K+ Output Tokens & Streaming' : 'Supports 4K Output Tokens & Streaming';
  let hintEl = document.getElementById('model-capability-hint');
  if (!hintEl) {
    hintEl = document.createElement('div');
    hintEl.id = 'model-capability-hint';
    hintEl.style.fontSize = '11px';
    hintEl.style.color = 'var(--info-color)';
    hintEl.style.marginTop = '4px';
    hintEl.style.fontFamily = 'var(--font-mono)';
    document.getElementById('settings-model').parentNode.appendChild(hintEl);
  }
  hintEl.textContent = '? ' + capHint;
  el('api-key-group').style.display = pKey === 'ollama' ? 'none' : 'block';
  el('base-url-group').style.display = (pKey === 'ollama' || pKey === 'custom' || pc?.requiresBaseUrl) ? 'block' : 'none';
  el('account-id-group').style.display = pc?.requiresAccountId ? 'block' : 'none';
  // Show Ollama-specific controls (test button + setup guide)
  const ollamaCtrl = el('ollama-controls');
  if (ollamaCtrl) ollamaCtrl.style.display = pKey === 'ollama' ? 'block' : 'none';
  // Pre-fill Ollama base URL if empty
  if (pKey === 'ollama' && !el('settings-baseurl').value) {
    el('settings-baseurl').value = 'http://localhost:11434/v1';
  }
}

function populateBackupModels() {
  const pKey = el('backup-provider').value;
  const pc = PROVIDERS[pKey];
  el('backup-model').innerHTML = pKey === ''
    ? '<option value="">â€” disabled â€”</option>'
    : (pc?.models || []).map(m =>
      `<option value="${m.id}"${m.id === state.settings.backupModel ? ' selected' : ''}>${m.label}</option>`
    ).join('');
  el('backup-key-group').style.display = (pKey && pKey !== 'ollama') ? 'block' : 'none';
}

function loadSettingsUI() {
  const s = state.settings;
  el('settings-provider').value = s.provider;
  populateModels();
  el('settings-model').value = s.model;
  el('settings-apikey').value = s.apiKey;
  el('settings-baseurl').value = s.baseUrl;
  el('settings-accountid').value = s.accountId;
  el('settings-maxsteps').value = s.maxSteps;
  el('settings-instructions').value = s.instructions;
  // Backup model
  el('backup-provider').value = s.backupProvider || '';
  populateBackupModels();
  el('backup-model').value = s.backupModel || '';
  el('backup-apikey').value = s.backupApiKey || '';
  // Toggles
  el('toggle-auto-screenshot').checked = s.autoScreenshot !== false;
  el('toggle-reasoning').checked = s.reasoningMode !== false;
  el('toggle-persist-memory').checked = s.persistMemory !== false;
  el('toggle-glow').checked = s.glowEffect !== false;
  // Rate limits
  el('settings-rpm').value = s.rpmLimit || 0;
  el('settings-rpd').value = s.rpdLimit || 0;
  // Theme
  const currentTheme = s.theme || 'dark';
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === currentTheme);
  });
  const accentGroup = el('accent-picker-group');
  if (accentGroup) accentGroup.style.display = currentTheme === 'custom' ? 'block' : 'none';
  if (el('settings-accent')) el('settings-accent').value = s.accentColor || '#00ff88';
}

function updateBadge() {
  const pc = PROVIDERS[state.settings.provider];
  const m = pc?.models.find(m => m.id === state.settings.model);
  el('current-model-label').textContent = m?.label || state.settings.model || 'No model';
}

function checkBanner() {
  const pc = PROVIDERS[state.settings.provider];
  el('setup-banner').style.display = (pc?.requiresKey && !state.settings.apiKey) ? 'flex' : 'none';
}

// â”€â”€ VIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function switchView(name) {
  state.view = name;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  el('view-' + name)?.classList.add('active');
  el('nav-' + name)?.classList.add('active');
  if (name === 'history') renderHistory();
  if (name === 'settings') loadSettingsUI();
  if (name === 'macros') renderMacros();
  if (name === 'files') renderFileTree();
}

function exportConversation() {
  const conv = getConv();
  if (!conv?.messages?.length) { toast('No conversation to export.'); return; }
  const lines = [`# ${conv.title || 'OpenBrowser Conversation'}\n`];
  conv.messages.forEach(m => {
    if (m.role === 'user') lines.push(`**You:** ${m.content}\n`);
    else if (m.role === 'assistant') {
      const text = Array.isArray(m.content)
        ? m.content.filter(b => b.type === 'text').map(b => b.text).join('\n')
        : (m.content || '');
      if (text) lines.push(`**Assistant:** ${text}\n`);
    }
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: `${(conv.title || 'chat').replace(/[^a-z0-9]/gi, '_').substring(0, 40)}.md`
  });
  a.click(); URL.revokeObjectURL(a.href);
  toast('Conversation exported âœ“');
}

function autoH() {
  const ta = el('chat-input');
  ta.style.height = 'auto';
  ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
}

async function send() {
  if (state.running) return;
  const ta = el('chat-input');
  const msg = ta.value.trim();
  if (!msg) return;
  ta.value = ''; autoH();
  if (!state.convId) newConv();
  appendUser(msg);
  await runAgent(msg);
}

// â”€â”€ BOOT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
