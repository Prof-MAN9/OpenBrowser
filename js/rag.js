const RAG = {
  db: null,
  _dbPromise: null,
  async initDB() {
    if (this.db) return;
    if (this._dbPromise) return this._dbPromise;
    this._dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open('ob_rag', 1);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('chunks')) {
          const store = db.createObjectStore('chunks', { keyPath: 'id', autoIncrement: true });
          store.createIndex('url', 'url', { unique: false });
        }
      };
      req.onsuccess = e => { this.db = e.target.result; resolve(); };
      req.onerror = () => reject(req.error);
    });
    return this._dbPromise;
  },
  _workerPromise: null,
  async initWorker() {
    if (state.ragWorker) return;
    if (this._workerPromise) return this._workerPromise;
    this._workerPromise = new Promise((resolve) => {
      state.ragWorker = new Worker('lib/rag-worker.js', { type: 'module' });
      state.ragWorker.onmessage = (e) => {
        const { type, id, embedding, error } = e.data;
        if (type === 'embed-result' && this.pendingEmbeds[id]) {
          this.pendingEmbeds[id].resolve(embedding);
          delete this.pendingEmbeds[id];
        } else if (type === 'error' && this.pendingEmbeds[id]) {
          this.pendingEmbeds[id].reject(new Error(error));
          delete this.pendingEmbeds[id];
        }
      };
      state.ragReady = true;
      resolve();
    });
    return this._workerPromise;
  },
  pendingEmbeds: {},
  async getEmbedding(text) {
    await this.initWorker();
    const id = uid();
    return new Promise((resolve, reject) => {
      this.pendingEmbeds[id] = { resolve, reject };
      state.ragWorker.postMessage({ type: 'embed', id, text });
    });
  },
  async saveChunk(url, title, text, embedding) {
    await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('chunks', 'readwrite');
      tx.objectStore('chunks').add({ url, title, text, embedding, createdAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
  async search(queryVector, limit = 3) {
    await this.initDB();
    return new Promise((resolve) => {
      const req = this.db.transaction('chunks', 'readonly').objectStore('chunks').getAll();
      req.onsuccess = () => {
        const chunks = req.result;
        const results = chunks.map(chunk => ({
          ...chunk,
          score: this.cosineSimilarity(queryVector, chunk.embedding)
        }));
        results.sort((a, b) => b.score - a.score);
        resolve(results.slice(0, limit));
      };
    });
  },
  cosineSimilarity(v1, v2) {
    if (!v1 || !v2 || v1.length !== v2.length) return 0;
    let dot = 0, mag1 = 0, mag2 = 0;
    for (let i = 0; i < v1.length; i++) {
      dot += v1[i] * v2[i];
      mag1 += v1[i] * v1[i];
      mag2 += v2[i] * v2[i];
    }
    const mag = Math.sqrt(mag1) * Math.sqrt(mag2);
    return mag > 0 ? dot / mag : 0;
  },
  async listUrls() {
    await this.initDB();
    return new Promise((resolve) => {
      const tx = this.db.transaction('chunks', 'readonly');
      const store = tx.objectStore('chunks');
      const index = store.index('url');
      const urls = new Map();
      index.openCursor().onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          const val = cursor.value;
          if (!urls.has(val.url)) {
            urls.set(val.url, { url: val.url, title: val.title, count: 1, lastIndexed: val.createdAt });
          } else {
            const entry = urls.get(val.url);
            entry.count++;
            entry.lastIndexed = Math.max(entry.lastIndexed, val.createdAt);
          }
          cursor.continue();
        } else {
          resolve(Array.from(urls.values()).sort((a, b) => b.lastIndexed - a.lastIndexed));
        }
      };
    });
  },
  async deleteUrl(url) {
    await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('chunks', 'readwrite');
      const store = tx.objectStore('chunks');
      const index = store.index('url');
      index.openKeyCursor(IDBKeyRange.only(url)).onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        }
      };
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  },
  async clearAll() {
    await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('chunks', 'readwrite');
      tx.objectStore('chunks').clear();
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }
};

async function renderFileTree() {
  const container = el('file-tree');
  if (!container) return;
  const files = await VFS.list().catch(() => []);

  if (!files.length) {
    container.innerHTML = '<div class="file-empty">No files yet.<br><small>Ask the AI to create files — e.g.<br>"Write a Python script to parse CSV files"</small></div>';
    return;
  }

  // Group by directory
  const tree = {};
  files.sort((a, b) => a.path.localeCompare(b.path)).forEach(f => {
    const parts = f.path.split('/');
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '/';
    if (!tree[dir]) tree[dir] = [];
    tree[dir].push(f);
  });

  container.innerHTML = Object.entries(tree).map(([dir, items]) => `
    <div class="file-group">
      ${dir !== '/' ? `<div class="file-dir">📁 ${esc(dir)}</div>` : ''}
      ${items.map(f => {
    const name = f.path.split('/').pop();
    const ext = name.split('.').pop()?.toLowerCase() || '';
    const icon = { js: '🟨', ts: '🔷', py: '🐍', css: '🎨', html: '🌐', json: '📋', md: '📝', txt: '📄', csv: '📊', sh: '⚙️' }[ext] || '📄';
    const size = new Blob([f.content || '']).size;
    const sizeStr = size > 1024 ? (size / 1024).toFixed(1) + 'KB' : size + 'B';
    return `<div class="file-row" data-path="${esc(f.path)}">
          <span class="file-icon">${icon}</span>
          <span class="file-name">${esc(name)}</span>
          <span class="file-size">${sizeStr}</span>
          <div class="file-actions">
            <button class="file-btn file-view-btn" data-path="${esc(f.path)}" title="View">👁</button>
            <button class="file-btn file-dl-btn" data-path="${esc(f.path)}" title="Download">⬇</button>
            <button class="file-btn file-del-btn" data-path="${esc(f.path)}" title="Delete">✕</button>
          </div>
        </div>`;
  }).join('')}
    </div>`).join('');

  // Wire buttons
  container.querySelectorAll('.file-view-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const f = await VFS.read(btn.dataset.path);
      if (!f) return;
      showFileViewer(f.path, f.content);
    });
  });
  container.querySelectorAll('.file-dl-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const f = await VFS.read(btn.dataset.path);
      if (!f) return;
      const blob = new Blob([f.content], { type: 'text/plain' });
      const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: btn.dataset.path.split('/').pop()
      });
      a.click(); URL.revokeObjectURL(a.href);
    });
  });
  container.querySelectorAll('.file-del-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm(`Delete "${btn.dataset.path}"?`)) return;
      await VFS.delete(btn.dataset.path);
      renderFileTree();
      toast('File deleted');
    });
  });
}

function showFileViewer(path, content) {
  const existing = document.getElementById('file-viewer-modal');
  existing?.remove();

  const name = path.split('/').pop();
  const modal = document.createElement('div');
  modal.id = 'file-viewer-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-box file-viewer-box">
      <div class="modal-header">
        <div class="modal-title-row">
          <span class="modal-title">📄 ${esc(name)}</span>
          <span class="modal-path">${esc(path)}</span>
        </div>
        <button class="modal-close-btn" id="fv-close">✕</button>
      </div>
      <div class="file-content-wrap">
        <div class="file-editor-container">
          <div class="file-line-numbers" id="fv-lines"></div>
          <textarea class="file-editor-textarea" id="fv-textarea" spellcheck="false">${esc(content)}</textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button id="fv-save" class="modal-action-btn" style="background:var(--green-subtle);border-color:var(--green-border);color:var(--green-bright)">Save Changes</button>
        <button id="fv-cancel" class="modal-action-btn">Close</button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const textarea = document.getElementById('fv-textarea');
  const linesEl = document.getElementById('fv-lines');
  
  const updateLines = () => {
    const count = textarea.value.split('\n').length;
    linesEl.innerHTML = Array.from({length: count}, (_, i) => `<div>${i+1}</div>`).join('');
  };
  
  textarea.addEventListener('input', updateLines);
  textarea.addEventListener('scroll', () => {
    linesEl.scrollTop = textarea.scrollTop;
  });
  updateLines();

  document.getElementById('fv-save').addEventListener('click', async () => {
    const newContent = textarea.value;
    await VFS.write(path, newContent);
    toast('File saved ✓');
    renderFileTree();
  });

  document.getElementById('fv-close').addEventListener('click', () => modal.remove());
  document.getElementById('fv-cancel').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

// ── PROMPT TEMPLATES ─────────────────────────────────────────────────────
function renderPromptTemplates() {
  const list = el('template-list');
  if (!list) return;
  const templates = state.settings.promptTemplates || [];
  list.innerHTML = templates.map((t, i) => `
    <div class="template-row" data-idx="${i}">
      <div class="template-info">
        <div class="template-name">${esc(t.name)}</div>
        <div class="template-preview">${esc(t.prompt.substring(0, 60))}…</div>
      </div>
      <div class="template-actions">
        <button class="tmpl-use-btn" data-idx="${i}" title="Use this template">▶</button>
        <button class="tmpl-del-btn" data-idx="${i}" title="Delete">✕</button>
      </div>
    </div>`).join('') +
    `<button class="tmpl-add-btn" id="tmpl-add">+ Add Template</button>`;

  list.querySelectorAll('.tmpl-use-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = templates[btn.dataset.idx];
      if (!t) return;
      el('chat-input').value = t.prompt; autoH();
      closeModal('templates-modal');
      el('chat-input').focus();
    });
  });
  list.querySelectorAll('.tmpl-del-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      state.settings.promptTemplates.splice(Number(btn.dataset.idx), 1);
      await saveSettings(); renderPromptTemplates();
    });
  });
  document.getElementById('tmpl-add')?.addEventListener('click', () => {
    const name = prompt('Template name:');
    if (!name?.trim()) return;
    const tmplPrompt = prompt('Template prompt:');
    if (!tmplPrompt?.trim()) return;
    state.settings.promptTemplates = state.settings.promptTemplates || [];
    state.settings.promptTemplates.push({ id: 'pt' + Date.now(), name: name.trim(), prompt: tmplPrompt.trim() });
    saveSettings().then(() => renderPromptTemplates());
  });
}

function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.style.display = 'flex';
  if (id === 'templates-modal') renderPromptTemplates();
  if (id === 'shortcuts-modal') { }  // static content
  if (id === 'memory-modal') {
    renderMemoryDashboard();
    renderRAGDashboard();
  }
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.style.display = 'none';
}

// ── KEYBOARD SHORTCUTS OVERLAY ────────────────────────────────────────────
// Shown on Ctrl+? (or ? when input not focused)
const SHORTCUTS = [
  { group: 'Panel', keys: 'Ctrl+Shift+Y', desc: 'Toggle side panel open/closed' },
  { group: 'Panel', keys: 'Ctrl+Shift+P', desc: 'Quick command palette (on page)' },
  { group: 'Chat', keys: 'Enter', desc: 'Send message' },
  { group: 'Chat', keys: 'Shift+Enter', desc: 'New line in input' },
  { group: 'Chat', keys: 'Escape', desc: 'Stop the running agent' },
  { group: 'Chat', keys: 'Ctrl+?', desc: 'Show keyboard shortcuts' },
  { group: 'Nav', keys: 'Alt+1', desc: 'Switch to Chat view' },
  { group: 'Nav', keys: 'Alt+2', desc: 'Switch to History view' },
  { group: 'Nav', keys: 'Alt+3', desc: 'Switch to Files view' },
  { group: 'Nav', keys: 'Alt+4', desc: 'Switch to Macros view' },
  { group: 'Nav', keys: 'Alt+5', desc: 'Switch to Settings view' },
  { group: 'Actions', keys: 'Ctrl+K', desc: 'Open prompt templates' },
  { group: 'Actions', keys: 'Ctrl+M', desc: 'Open memory dashboard' },
  { group: 'Actions', keys: 'Ctrl+N', desc: 'New conversation' },
];



// ── MACROS ───────────────────────────────────────────────────────────────
