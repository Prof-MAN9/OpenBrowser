async function load() {
  const d = await chrome.storage.local.get(['ob_settings', 'ob_conversations', 'ob_memory', 'ob_citations', 'ob_rateLog']);
  if (d.ob_settings) Object.assign(state.settings, d.ob_settings);
  if (d.ob_conversations) state.conversations = d.ob_conversations;
  if (d.ob_citations) state.citations = d.ob_citations;
  if (d.ob_rateLog) state.rateLog = d.ob_rateLog;

  // Restore persistent memory if feature is on
  if (d.ob_memory && state.settings.persistMemory) {
    Object.assign(state.memory, d.ob_memory);
  }
}
async function saveSettings() { await chrome.storage.local.set({ ob_settings: { ...state.settings } }); }
async function saveConvs() { await chrome.storage.local.set({ ob_conversations: state.conversations.slice(0, 50) }); }
async function saveMemory() { await chrome.storage.local.set({ ob_memory: { ...state.memory } }); }

// ── THEME SYSTEM ─────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    '--bg-primary': '#080c0a', '--bg-secondary': '#0d1410',
    '--bg-tertiary': '#121a15', '--bg-card': '#151e18',
    '--bg-input': '#0f1812', '--bg-hover': '#1a2620',
    '--bg-panel': '#0d1410', '--bg-active': '#1e2e24',
    '--text-primary': '#e8f5ec', '--text-secondary': '#8aab96',
    '--text-muted': '#4a6b56', '--text-dim': '#2a4034',
    '--border-color': 'rgba(0,255,136,0.12)', '--border-subtle': 'rgba(255,255,255,0.04)',
  },
  light: {
    '--bg-primary': '#f5f8f6', '--bg-secondary': '#edf2ef',
    '--bg-tertiary': '#e4ece8', '--bg-card': '#dce7e1',
    '--bg-input': '#eef5f1', '--bg-hover': '#d8e8de',
    '--bg-panel': '#edf2ef', '--bg-active': '#cfe0d7',
    '--text-primary': '#0f1f15', '--text-secondary': '#2d5540',
    '--text-muted': '#5a8a6a', '--text-dim': '#8abaaa',
    '--border-color': 'rgba(0,136,68,0.18)', '--border-subtle': 'rgba(0,0,0,0.06)',
  },
};

function applyTheme(themeName, accentHex) {
  const root = document.documentElement;
  const vars = THEMES[themeName] || THEMES.dark;

  // Apply base color variables
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);

  // Apply accent color
  const accent = accentHex || (themeName === 'light' ? '#009944' : '#00ff88');
  root.style.setProperty('--green-bright', accent);
  root.style.setProperty('--green-mid', adjustBrightness(accent, -0.15));
  root.style.setProperty('--green-dim', adjustBrightness(accent, -0.35));
  root.style.setProperty('--green-subtle', hexToRgba(accent, 0.08));
  root.style.setProperty('--green-border', hexToRgba(accent, 0.18));
  root.style.setProperty('--green-glow', hexToRgba(accent, 0.25));

  // Mark theme on body for additional CSS hooks
  document.body.dataset.theme = themeName;
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function adjustBrightness(hex, factor) {
  let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  r = Math.max(0, Math.min(255, Math.round(r * (1 + factor))));
  g = Math.max(0, Math.min(255, Math.round(g * (1 + factor))));
  b = Math.max(0, Math.min(255, Math.round(b * (1 + factor))));
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// ── MEMORY DASHBOARD ─────────────────────────────────────────────────────
function renderMemoryDashboard() {
  const container = el('memory-entries');
  if (!container) return;
  const entries = Object.entries(state.memory);
  if (!entries.length) {
    container.innerHTML = '<div class="memory-empty">No memories stored yet.<br><small>Use the <code>memorize</code> tool to save facts across conversations.</small></div>';
    return;
  }
  // Build rows with DOM creation to avoid XSS from user-controlled keys/values
  container.innerHTML = '';
  entries.forEach(([k, v]) => {
    const row = document.createElement('div');
    row.className = 'memory-row';
    row.dataset.key = k;

    const keyEl = document.createElement('div');
    keyEl.className = 'memory-key';
    keyEl.textContent = k;

    const inp = document.createElement('input');
    inp.className = 'memory-val-input';
    inp.value = String(v);
    inp.dataset.key = k;

    const del = document.createElement('button');
    del.className = 'memory-del-btn';
    del.dataset.key = k;
    del.title = 'Delete';
    del.textContent = '✕';

    row.appendChild(keyEl);
    row.appendChild(inp);
    row.appendChild(del);
    container.appendChild(row);
  });

  container.querySelectorAll('.memory-val-input').forEach(inp => {
    inp.addEventListener('change', async () => {
      state.memory[inp.dataset.key] = inp.value;
      if (state.settings.persistMemory) await saveMemory();
      toast('Memory updated');
    });
  });
  container.querySelectorAll('.memory-del-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      delete state.memory[btn.dataset.key];
      if (state.settings.persistMemory) await saveMemory();
      renderMemoryDashboard();
    });
  });
}

// ── RAG DASHBOARD ────────────────────────────────────────────────────────
async function renderRAGDashboard() {
  const container = el('rag-entries');
  if (!container) return;
  const urls = await RAG.listUrls();
  if (!urls.length) {
    container.innerHTML = '<div class="memory-empty">No pages indexed yet.<br><small>Use the <code>index_current_page</code> tool to save page content for semantic search.</small></div>';
    return;
  }
  container.innerHTML = urls.map(u => `
    <div class="rag-entry">
      <div class="rag-info">
        <div class="rag-title" title="${esc(u.title)}">${esc(u.title || u.url)}</div>
        <div class="rag-url" title="${esc(u.url)}">${esc(u.url)}</div>
        <div class="rag-stats">${u.count} segments · Indexed ${timeSince(u.lastIndexed)} ago</div>
      </div>
      <button class="memory-del-btn rag-del-btn" data-url="${esc(u.url)}" title="Remove from knowledge base">✕</button>
    </div>
  `).join('');

  container.querySelectorAll('.rag-del-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const url = btn.dataset.url;
      if (confirm(`Remove "${url}" from local knowledge base?`)) {
        await RAG.deleteUrl(url);
        renderRAGDashboard();
        toast('Page removed from knowledge base');
      }
    });
  });
}

// ── VIRTUAL FILESYSTEM ────────────────────────────────────────────────────
// IndexedDB-backed file store for AI-generated files
