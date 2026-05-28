const state = {
  view: 'chat',
  conversations: [],
  convId: null,
  settings: {
    // Primary model
    provider: 'anthropic', model: 'claude-sonnet-4-5',
    apiKey: '', baseUrl: '', accountId: '',
    // Backup model - used automatically if primary hits quota/rate-limit
    backupProvider: '', backupModel: '', backupApiKey: '',
    // Agent behaviour
    maxSteps: 20, instructions: '',
    // Rate limiting — prevent runaway API usage (0 = disabled, stops 5 before limit)
    rpmLimit: 0,   // requests per minute (0 = unlimited)
    rpdLimit: 0,   // requests per day    (0 = unlimited)
    // Quality-of-life toggles
    autoScreenshot: true,   // capture page 2.5 s after every navigation/click/type
    reasoningMode: true,    // inject chain-of-thought guidance into system prompt
    persistMemory: true,    // carry memory across conversations (not just within one)
    glowEffect: true,       // green edge glow while agent is running
    theme: 'dark',          // 'dark' | 'light' | 'custom'
    accentColor: '#00ff88', // custom accent color (only used in 'custom' theme)
    promptTemplates: [      // user-editable prompt templates
      { id: 'pt1', name: 'Summarize page', prompt: 'Summarize the main content of this page in 3-5 bullet points.' },
      { id: 'pt2', name: 'Extract data', prompt: 'Extract all structured data (tables, lists, prices, specs) from this page and format as a table.' },
      { id: 'pt3', name: 'Fill form', prompt: 'Scan the form on this page and fill it intelligently. Ask me for any required info you don\'t know.' },
      { id: 'pt4', name: 'Find prices', prompt: 'Find all prices, costs, or fees mentioned on this page and list them clearly.' },
      { id: 'pt5', name: 'Screenshot & describe', prompt: 'Take a screenshot of the current page and describe what you see in detail.' },
      { id: 'pt6', name: 'Cite this page', prompt: 'Save this page as a citation in APA format with tags.' },
    ]
  },
  running: false,
  abort: null,
  memory: {},            // persistent key-value memory store
  backupActive: false,   // true when currently using backup model
  taskPlan: null,        // current visual task plan (create_task_plan tool)
  // ── Rate limit tracking ───────────────────────────────────────────
  rateLog: [],           // timestamps of recent API calls (last 24h kept)
  citations: [],         // collected citations [{ url, title, author, date, note, format }]
  bookmarks: [],         // session smart bookmarks
  ragWorker: null,       // Web Worker for Transformers.js
  ragReady: false
};

// ── UTILS ──────────────────────────────────────────────────────────
