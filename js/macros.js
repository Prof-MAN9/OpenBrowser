let state_macros = [];  // { id, name, description, prompt, created, schedule, lastRun }

async function loadMacros() {
  const d = await chrome.storage.local.get('ob_macros');
  state_macros = d.ob_macros || [];
}

async function saveMacros() {
  await chrome.storage.local.set({ ob_macros: state_macros });
}

async function saveMacro(name, description, prompt) {
  const id = 'macro_' + Date.now();
  state_macros.unshift({ id, name, description, prompt, created: Date.now(), schedule: null, lastRun: null });
  await saveMacros();
  renderMacros();
  toast(`Macro "${name}" saved âœ“`);
}

async function deleteMacro(id) {
  state_macros = state_macros.filter(m => m.id !== id);
  await saveMacros();
  // Remove alarm if scheduled
  chrome.alarms.clear(id).catch(() => { });
  renderMacros();
  toast('Macro deleted');
}

async function runMacro(id) {
  const macro = state_macros.find(m => m.id === id);
  if (!macro) return;
  macro.lastRun = Date.now();
  await saveMacros();
  switchView('chat');
  el('chat-input').value = macro.prompt;
  await runAgent(macro.prompt);
  renderMacros();
}

async function scheduleMacro(id, intervalMinutes) {
  const macro = state_macros.find(m => m.id === id);
  if (!macro) return;
  if (intervalMinutes) {
    macro.schedule = intervalMinutes;
    chrome.alarms.create(id, { periodInMinutes: intervalMinutes });
  } else {
    macro.schedule = null;
    chrome.alarms.clear(id).catch(() => { });
  }
  await saveMacros();
  renderMacros();
  toast(intervalMinutes ? `Scheduled every ${intervalMinutes}m âœ“` : 'Schedule removed');
}

function renderMacros() {
  const list = el('macros-list');
  if (!list) return;
  if (!state_macros.length) {
    list.innerHTML = '<div class="macros-empty">No macros saved yet.<br><small>After running a task, click <strong>Save as Macro</strong> in the chat.</small></div>';
    return;
  }
  list.innerHTML = state_macros.map(m => {
    const ago = m.lastRun ? timeSince(m.lastRun) + ' ago' : 'never run';
    const schedLabel = m.schedule ? `every ${m.schedule}m` : 'manual';
    return `
    <div class="macro-card" data-id="${m.id}">
      <div class="macro-card-top">
        <div>
          <div class="macro-name">${esc(m.name)}</div>
          <div class="macro-desc">${esc(m.description || m.prompt.substring(0, 60) + '...')}</div>
        </div>
        <div class="macro-actions">
          <button class="macro-run-btn" data-id="${m.id}" title="Run now">â–¶</button>
          <button class="macro-del-btn" data-id="${m.id}" title="Delete">âœ•</button>
        </div>
      </div>
      <div class="macro-meta">
        <span>Last run: ${ago}</span>
        <span>Schedule: <select class="macro-schedule-sel" data-id="${m.id}">
          <option value="">manual${!m.schedule ? ' âœ“' : ''}</option>
          <option value="15"${m.schedule === 15 ? ' selected' : ''}>every 15m</option>
          <option value="30"${m.schedule === 30 ? ' selected' : ''}>every 30m</option>
          <option value="60"${m.schedule === 60 ? ' selected' : ''}>every 1h</option>
          <option value="360"${m.schedule === 360 ? ' selected' : ''}>every 6h</option>
          <option value="1440"${m.schedule === 1440 ? ' selected' : ''}>every day</option>
        </select></span>
      </div>
    </div>`;
  }).join('');

  list.querySelectorAll('.macro-run-btn').forEach(b =>
    b.addEventListener('click', () => runMacro(b.dataset.id)));
  list.querySelectorAll('.macro-del-btn').forEach(b =>
    b.addEventListener('click', () => {
      if (confirm(`Delete macro "${state_macros.find(m => m.id === b.dataset.id)?.name}"?`))
        deleteMacro(b.dataset.id);
    }));
  list.querySelectorAll('.macro-schedule-sel').forEach(sel =>
    sel.addEventListener('change', () =>
      scheduleMacro(sel.dataset.id, sel.value ? Number(sel.value) : null)));
}

function timeSince(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return s + 's';
  if (s < 3600) return Math.floor(s / 60) + 'm';
  if (s < 86400) return Math.floor(s / 3600) + 'h';
  return Math.floor(s / 86400) + 'd';
}

function getConv() { return state.conversations.find(c => c.id === state.convId) || null; }

function newConv() {
  const c = { id: uid(), title: 'New Conversation', messages: [], createdAt: Date.now(), updatedAt: Date.now() };
  state.conversations.unshift(c);
  state.convId = c.id;
  return c;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
