const VFS = {
  db: null,
  _initPromise: null,
  async init() {
    if (this.db) return;
    if (this._initPromise) return this._initPromise;
    this._initPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open('ob_vfs', 1);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'path' });
        }
      };
      req.onsuccess = e => { this.db = e.target.result; resolve(); };
      req.onerror = () => reject(req.error);
    });
    return this._initPromise;
  },
  norm(path) { return (path || '').trim().replace(/\/+/g, '/').replace(/^\//, ''); },
  async write(path, content) {
    path = this.norm(path);
    if (!path) throw new Error('Path required');
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('files', 'readwrite');
      tx.objectStore('files').put({ path, content, updatedAt: Date.now() });
      tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
    });
  },
  async read(path) {
    path = this.norm(path);
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('files', 'readonly');
      const req = tx.objectStore('files').get(path);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  },
  async list() {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('files', 'readonly');
      const req = tx.objectStore('files').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },
  async delete(path) {
    path = this.norm(path);
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('files', 'readwrite');
      tx.objectStore('files').delete(path);
      tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
    });
  }
};

// ── RAG SYSTEM ────────────────────────────────────────────────────────────
