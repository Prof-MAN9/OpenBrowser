// ═══════════════════════════════════════════════════════════════════
// OpenBrowser v3.3 — Side Panel Application
// https://github.com/Prof-MAN9/OpenBrowser
// ═══════════════════════════════════════════════════════════════════
'use strict';

// ── PROVIDERS ──────────────────────────────────────────────────────
const PROVIDERS = {
  anthropic: {
    name: 'Anthropic', baseUrl: 'https://api.anthropic.com/v1/messages',
    models: [
      { id: 'claude-opus-4-7', label: 'Claude Opus 4.7 (Reasoning)' },
      { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
      { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
      { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' }
    ],
    format: 'anthropic', requiresKey: true,
    keyPlaceholder: 'sk-ant-api03-…',
    keyHint: 'Get your key at console.anthropic.com'
  },
  openai: {
    name: 'OpenAI', baseUrl: 'https://api.openai.com/v1/responses',
    models: [
      { id: 'gpt-5.5', label: 'GPT-5.5' },
      { id: 'gpt-5.4', label: 'GPT-5.4' },
      { id: 'gpt-5.4-mini', label: 'GPT-5.4 Mini' },
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini' }
    ],
    format: 'openai-responses', requiresKey: true,
    keyPlaceholder: 'sk-…',
    keyHint: 'Get your key at platform.openai.com/api-keys'
  },
  gemini: {
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',
    models: [
      { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro' },
      { id: 'gemini-3-flash-preview', label: 'Gemini 3.1 Flash' },
      { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' }
    ],
    format: 'gemini', requiresKey: true,
    keyPlaceholder: 'AIza…',
    keyHint: 'Get your key at aistudio.google.com/app/apikey'
  },
  groq: {
    name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
    models: [
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
      { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant' },
      { id: 'groq/compound', label: 'Groq Compound' },
      { id: 'openai/gpt-oss-20b', label: 'GPT OSS 20B' }
    ],
    format: 'openai', requiresKey: true,
    keyPlaceholder: 'gsk_…',
    keyHint: 'Get your key at console.groq.com/keys'
  },
  ollama: {
    name: 'Ollama (Local)', baseUrl: 'http://localhost:11434/api/chat',
    models: [
      { id: 'quen3-coder', label: 'Qwen 3 Coder' },
      { id: 'llama4', label: 'Llama 4' },
      { id: 'deepseek-v4-pro:cloud', label: 'DeepSeek-v4 Pro' },
      { id: 'gemma4', label: 'Gemma 4' },
      { id: 'krith/qwen2.5-coder-32b-instruct:IQ3_M', label: 'Qwen 2.5 Coder' },
      { id: 'llama3.3', label: 'Llama 3.3' }
      { id: 'glm-5.1:cloud', label: 'GLM 5.1' }
      { id: 'gemma3', label: 'Gemma 3' }
      { id: 'phi4', label: 'PHI 4' }
    ],
    format: 'openai', requiresKey: false,
    keyPlaceholder: '(not required)',
    keyHint: 'Ollama runs locally — no API key needed'
  },
  openrouter: {
    name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
    models: [
      { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
      { id: 'google/gemini-pro-1.5', label: 'Gemini Pro 1.5' },
      { id: 'meta-llama/llama-3.1-70b-instruct', label: 'Llama 3.1 70B' },
      { id: 'mistralai/mistral-large', label: 'Mistral Large' },
      { id: 'openai/gpt-4o', label: 'GPT-4o' },
      { id: 'deepseek/deepseek-chat', label: 'DeepSeek Chat' }
    ],
    format: 'openai', requiresKey: true,
    keyPlaceholder: 'sk-or-v1-…',
    keyHint: 'Get your key at openrouter.ai/keys'
  },
  cloudflare: {
    name: 'Cloudflare Workers AI',
    baseUrl: 'https://api.cloudflare.com/client/v4/accounts/{accountId}/ai/v1/chat/completions',
    models: [
      { id: '@cf/meta/llama-3.1-8b-instruct', label: 'Llama 3.1 8B' },
      { id: '@cf/meta/llama-3.3-70b-instruct-fp8-fast', label: 'Llama 3.3 70B' },
      { id: '@cf/mistral/mistral-7b-instruct-v0.1', label: 'Mistral 7B' }
    ],
    format: 'openai', requiresKey: true, requiresAccountId: true,
    keyPlaceholder: 'Cloudflare API Token',
    keyHint: 'Create a token at dash.cloudflare.com/profile/api-tokens'
  },
  huggingface: {
    name: 'HuggingFace', baseUrl: 'https://api-inference.huggingface.co/v1/chat/completions',
    models: [
      { id: 'meta-llama/Llama-3.2-11B-Vision-Instruct', label: 'Llama 3.2 11B' },
      { id: 'Qwen/Qwen2.5-72B-Instruct', label: 'Qwen 2.5 72B' },
      { id: 'mistralai/Mistral-7B-Instruct-v0.3', label: 'Mistral 7B' }
    ],
    format: 'openai', requiresKey: true,
    keyPlaceholder: 'hf_…',
    keyHint: 'Get your token at huggingface.co/settings/tokens'
  },
  minimax: {
    name: 'MiniMax', baseUrl: 'https://api.minimax.chat/v1/text/chatcompletion_v2',
    models: [
      { id: 'MiniMax-Text-01', label: 'MiniMax Text-01' },
      { id: 'abab6.5s-chat', label: 'ABAB 6.5s' }
    ],
    format: 'openai', requiresKey: true,
    keyPlaceholder: 'MiniMax API key',
    keyHint: 'Get your key at api.minimax.chat'
  },
  moonshot: {
    name: 'Moonshot (Kimi)', baseUrl: 'https://api.moonshot.cn/v1/chat/completions',
    models: [
      { id: 'moonshot-v1-128k', label: 'Moonshot 128K' },
      { id: 'moonshot-v1-32k', label: 'Moonshot 32K' },
      { id: 'moonshot-v1-8k', label: 'Moonshot 8K' }
    ],
    format: 'openai', requiresKey: true,
    keyPlaceholder: 'sk-…',
    keyHint: 'Get your key at platform.moonshot.cn'
  },
  qwen: {
    name: 'Qwen (Alibaba)',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    models: [
      { id: 'qwen-max', label: 'Qwen Max' },
      { id: 'qwen-plus', label: 'Qwen Plus' },
      { id: 'qwen-turbo', label: 'Qwen Turbo' },
      { id: 'qwen2.5-72b-instruct', label: 'Qwen 2.5 72B' }
    ],
    format: 'openai', requiresKey: true,
    keyPlaceholder: 'sk-…',
    keyHint: 'Get your key at dashscope.aliyuncs.com'
  },
  custom: {
    name: 'Custom API', baseUrl: '',
    models: [{ id: 'custom-model', label: 'Custom Model' }],
    format: 'openai', requiresKey: true, requiresBaseUrl: true,
    keyPlaceholder: 'API key (if required)',
    keyHint: 'Enter the API key for your custom endpoint'
  }
};

// ── TOOLS ──────────────────────────────────────────────────────────
// RULE: tools with zero parameters must have NO input_schema at all.
// RULE: 'number' stays 'number', never 'integer'.
// RULE: 'array' must have items: { type: 'string' }.
// RULE: 'required' omitted when empty.
const TOOLS = [
  {
    name: 'think',
    description: 'Plan your approach step by step before taking any action.',
    parameters: { thought: { type: 'string', description: 'Your step-by-step reasoning and plan' } }
  },
  {
    name: 'navigate',
    description: 'Navigate the current browser tab to a URL or natural-language destination. Understands: "YouTube", "my Gmail", "Amazon product page", "search for X", plain URLs, or partial domains.',
    parameters: { url: { type: 'string', description: 'URL, domain, site name, or natural-language destination like "YouTube" or "search for best laptops 2024"' } }
  },
  {
    name: 'browse_intent',
    description: 'Start browsing from a goal or intent description. The AI picks the best URL to start from and explains its reasoning. Use when the user describes WHAT they want rather than WHERE to go.',
    parameters: {
      intent: { type: 'string', description: 'What the user wants to accomplish, e.g. "I want to buy running shoes under $100" or "Find Python tutorials for beginners"' }
    }
  },
  {
    name: 'save_bookmark',
    description: 'Save the current page (or a given URL) as a smart bookmark with AI-generated tags and a one-sentence summary.',
    parameters: {
      url: { type: 'string', description: 'URL to bookmark. Leave empty to use the current page.' },
      tags: { type: 'string', description: 'Comma-separated tags, e.g. "programming, tutorial, python". Leave empty to auto-generate.' },
      summary: { type: 'string', description: 'One-sentence summary. Leave empty to auto-generate from page content.' },
      folder: { type: 'string', description: 'Bookmark folder name (optional). Default: "OpenBrowser"' }
    }
  },
  {
    name: 'show_bookmarks',
    description: 'Show all OpenBrowser smart bookmarks in the chat panel, with search and filter options.',
    parameters: {
      filter: { type: 'string', description: 'Optional tag or keyword to filter bookmarks' }
    }
  },
  {
    name: 'click',
    description: 'Click an element on the page. Use visible text content, CSS selector, or a spatial grid ID (e.g., "12") for best results.',
    parameters: { target: { type: 'string', description: 'Visible text, CSS selector, aria-label, or spatial grid ID of the element to click' } }
  },
  {
    name: 'type',
    description: 'Type text into a focused input field, search box, or textarea.',
    parameters: {
      target: { type: 'string', description: 'Label text, placeholder, CSS selector, or spatial grid ID of the input field' },
      text: { type: 'string', description: 'Text to type into the field' },
      submit: { type: 'boolean', description: 'If true, press Enter after typing to submit the form' }
    }
  },
  {
    name: 'scroll',
    description: 'Scroll the page in a direction.',
    parameters: {
      direction: { type: 'string', enum: ['down', 'up', 'top', 'bottom'], description: 'Which direction to scroll' },
      amount: { type: 'number', description: 'Pixels to scroll (default 400, optional)' }
    }
  },
  {
    name: 'screenshot',
    description: 'Capture a screenshot of the current page to visually verify its state.',
    parameters: {}
  },
  {
    name: 'toggle_spatial_grid',
    description: 'Show or hide a spatial UI grid that overlays numbered badges on all interactive elements. Use this before taking a screenshot to easily identify elements by number. You can then pass the number to the click or type tools.',
    parameters: {
      action: { type: 'string', enum: ['show', 'hide'], description: 'Whether to show or hide the grid' }
    }
  },
  {
    name: 'get_page_content',
    description: 'Read the full text content of the current page for analysis.',
    parameters: { selector: { type: 'string', description: 'CSS selector to limit the extracted region (optional)' } }
  },
  {
    name: 'run_javascript',
    description: 'Execute JavaScript on the page and return the result. Use return to return a value.',
    parameters: { code: { type: 'string', description: 'JavaScript code to execute in the page context' } }
  },
  {
    name: 'open_tab',
    description: 'Open a URL in a new browser tab.',
    parameters: { url: { type: 'string', description: 'URL to open in the new tab' } }
  },
  {
    name: 'switch_tab',
    description: 'Switch to a different open tab by its ID.',
    parameters: { tabId: { type: 'number', description: 'The numeric ID of the tab to switch to' } }
  },
  {
    name: 'list_tabs',
    description: 'List all open tabs in the current browser window, including their IDs, titles, URLs, and any tab group they belong to.',
    parameters: {}
  },
  {
    name: 'group_tabs',
    description: 'Group multiple tabs together with a title and color. Use list_tabs first to find the tab IDs.',
    parameters: {
      tabIds: { type: 'array', items: { type: 'number' }, description: 'Array of tab IDs to group' },
      title: { type: 'string', description: 'Title for the tab group' },
      color: { type: 'string', enum: ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'], description: 'Color for the group (optional)' }
    }
  },
  {
    name: 'close_tabs',
    description: 'Close one or more open tabs by their IDs.',
    parameters: {
      tabIds: { type: 'array', items: { type: 'number' }, description: 'Array of tab IDs to close' }
    }
  },
  {
    name: 'wait',
    description: 'Wait for a page to load or for a timed delay.',
    parameters: { ms: { type: 'number', description: 'Milliseconds to wait (max 5000)' } }
  },
  {
    name: 'extract_data',
    description: 'Extract structured table or list data from the page.',
    parameters: { selector: { type: 'string', description: 'CSS selector of the element containing the data (optional)' } }
  },
  {
    name: 'select_option',
    description: 'Choose an option from a dropdown/select element.',
    parameters: {
      target: { type: 'string', description: 'CSS selector or label text of the select element' },
      value: { type: 'string', description: 'The option value or visible text to select' }
    }
  },
  {
    name: 'download_csv',
    description: 'Create and download a CSV file from extracted data.',
    parameters: {
      filename: { type: 'string', description: 'File name without the .csv extension' },
      data: { type: 'string', description: 'JSON string of an array of objects or arrays representing the rows' }
    }
  },
  {
    name: 'memorize',
    description: 'Save important information to remember for later in this session.',
    parameters: {
      key: { type: 'string', description: 'A short identifier for this piece of information' },
      value: { type: 'string', description: 'The information to remember' }
    }
  },
  {
    name: 'finish',
    description: 'Complete the task and deliver the final answer to the user.',
    parameters: { answer: { type: 'string', description: 'Your complete summary of what was accomplished and any results' } }
  },
  {
    name: 'reason',
    description: 'Think through a complex problem deeply before acting. Use this for multi-step planning, ambiguous situations, or when previous attempts have failed. Write out your full chain of thought.',
    parameters: {
      problem: { type: 'string', description: 'The specific problem or decision you need to reason about' },
      thoughts: { type: 'string', description: 'Your detailed step-by-step reasoning, considering alternatives, risks, and the best path forward' },
      plan: { type: 'string', description: 'The concrete action plan you will execute based on your reasoning' }
    }
  },
  {
    name: 'recall',
    description: 'Look up something stored in memory from a previous session or earlier in this conversation.',
    parameters: { key: { type: 'string', description: 'The memory key to look up' } }
  },
  {
    name: 'scrape_page',
    description: 'Deep-scrape a page: extracts all text, links, images, tables, headings, and metadata in one structured call. Better than get_page_content for research tasks.',
    parameters: {
      selector: { type: 'string', description: 'CSS selector to limit extraction to a region (optional)' },
      include_links: { type: 'boolean', description: 'Include all hyperlinks with their text and href (optional, default true)' },
      include_tables: { type: 'boolean', description: 'Include all table data as JSON (optional, default true)' }
    }
  },
  {
    name: 'smart_fill_form',
    description: 'Intelligently fill form fields on the current page using semantic matching. Understands context: "first name", "given name", "prénom" all map correctly. Handles checkboxes, selects, radios, and textareas too.',
    parameters: {
      fields: {
        type: 'string',
        description: 'JSON string of field-to-value pairs, e.g. \'{"first name":"John","email":"john@example.com","country":"Canada"}\'. Keys are human-readable descriptions; the tool finds the best matching field.'
      },
      submit: { type: 'boolean', description: 'If true, submit the form after filling (optional, default false)' }
    }
  },
  {
    name: 'scan_forms',
    description: 'Scan the current page and return all form fields with their labels, types, options, and current values. Use this before smart_fill_form to understand what fields exist.',
    parameters: {}
  },
  {
    name: 'create_task_plan',
    description: 'Display a structured task plan in the chat with numbered steps. Use this at the start of complex multi-step tasks so the user can see your plan before you execute.',
    parameters: {
      title: { type: 'string', description: 'Short task title, e.g. "Book flight to NYC"' },
      steps: { type: 'string', description: 'JSON array of step strings, e.g. ["Navigate to expedia.com", "Search NYC flights for next Friday"]' }
    }
  },
  {
    name: 'update_task_step',
    description: 'Mark a step in the current task plan as done, in-progress, or failed.',
    parameters: {
      step_index: { type: 'number', description: 'Zero-based index of the step to update' },
      status: { type: 'string', description: 'New status: "done", "active", or "failed"' },
      note: { type: 'string', description: 'Optional short note to show next to the step (e.g. "Found flight for $312")' }
    }
  },
  {
    name: 'export_data',
    description: 'Export structured data (array of objects) as a downloadable CSV or JSON file, and display it as a table in the chat.',
    parameters: {
      data: { type: 'string', description: 'JSON-encoded array of objects to export' },
      filename: { type: 'string', description: 'Base filename without extension' },
      format: { type: 'string', description: '"csv" or "json" (default csv)' }
    }
  },
  // ── NEW v3.2.3 TOOLS ─────────────────────────────────────────────
  {
    name: 'summarize_tabs',
    description: 'Summarize all open browser tabs (or a specific subset) and return a structured digest. Great for "catch me up on all my open research" requests.',
    parameters: {
      tab_ids: { type: 'string', description: 'Optional JSON array of specific tab IDs to summarize (from list_tabs). Leave empty to summarize all tabs.' },
      focus: { type: 'string', description: 'Optional focus topic — e.g. "pricing" or "technical specs". Guides what to extract from each page.' }
    }
  },
  {
    name: 'cross_site_research',
    description: 'Compare information across multiple open tabs simultaneously. Use for "compare these laptops", "which of these services is cheapest", etc.',
    parameters: {
      tab_ids: { type: 'string', description: 'JSON array of tab IDs to compare (get IDs from list_tabs first)' },
      attributes: { type: 'string', description: 'JSON array of attributes to extract from each page, e.g. ["price","RAM","storage","display size"]' },
      question: { type: 'string', description: 'The comparison question to answer, e.g. "Which laptop has the best value under $1000?"' }
    }
  },
  {
    name: 'auto_highlight',
    description: 'Highlight the most relevant parts of the current page based on a goal or keyword. Adds visible green highlights to matching text. Call remove_highlights to clear.',
    parameters: {
      goal: { type: 'string', description: 'What the user is looking for, e.g. "pricing information" or "side effects" or "installation steps"' },
      max_highlights: { type: 'number', description: 'Maximum number of passages to highlight (default 8, max 25)' }
    }
  },
  {
    name: 'remove_highlights',
    description: 'Remove all auto-highlights from the current page.',
    parameters: {}
  },
  {
    name: 'add_citation',
    description: 'Save the current page (or a specific URL) as a citation. Automatically extracts title, author, date, and URL.',
    parameters: {
      url: { type: 'string', description: 'URL to cite. Leave empty to use the current page.' },
      note: { type: 'string', description: 'Optional personal note about why this source is relevant.' },
      format: { type: 'string', description: 'Citation format: "apa", "mla", "chicago", or "url" (default url)' }
    }
  },
  {
    name: 'show_citations',
    description: 'Display all collected citations in the chat and optionally export them.',
    parameters: {
      export_format: { type: 'string', description: 'Optional: "txt", "bib", or "md" to also download the citation list.' }
    }
  },
  {
    name: 'clear_citations',
    description: 'Remove all saved citations.',
    parameters: {}
  },
  // ── VIRTUAL FILESYSTEM ───────────────────────────────────────────
  {
    name: 'write_file',
    description: 'Write content to a file in the virtual filesystem. Creates directories automatically. Use for saving code, data, notes, or any generated content.',
    parameters: {
      path: { type: 'string', description: 'File path, e.g. "scripts/hello.py" or "notes/ideas.md"' },
      content: { type: 'string', description: 'Full file content to write' }
    }
  },
  {
    name: 'read_file',
    description: 'Read the contents of a file from the virtual filesystem.',
    parameters: { path: { type: 'string', description: 'File path to read' } }
  },
  {
    name: 'list_files',
    description: 'List all files in the virtual filesystem, optionally filtered by directory.',
    parameters: { dir: { type: 'string', description: 'Optional directory prefix filter, e.g. "scripts/"' } }
  },
  {
    name: 'delete_file',
    description: 'Delete a file from the virtual filesystem.',
    parameters: { path: { type: 'string', description: 'File path to delete' } }
  },
  {
    name: 'index_current_page',
    description: 'Index the current page into your local knowledge base for semantic retrieval later.',
    parameters: {}
  },
  {
    name: 'semantic_search_memory',
    description: 'Search your local knowledge base for information using natural language.',
    parameters: {
      query: { type: 'string', description: 'The search query or question to answer from memory' },
      limit: { type: 'number', description: 'Maximum number of results to return (optional, default 3)' }
    }
  }
];

// ── STATE ──────────────────────────────────────────────────────────
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
const uid = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
const wait = ms => new Promise(r => setTimeout(r, ms));

function esc(s) {
  if (s === undefined || s === null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── MERMAID DIAGRAM RENDERER ─────────────────────────────────────────────
let mermaidLoaded = false;
let mermaidLoading = false;
let mermaidQueue = [];

async function loadMermaid() {
  if (mermaidLoaded) return Promise.resolve();
  if (mermaidLoading) return new Promise(r => mermaidQueue.push(r));
  mermaidLoading = true;
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/mermaid/11.4.1/mermaid.min.js';
    s.onload = () => {
      window.mermaid?.initialize({
        startOnLoad: false, theme: 'dark',
        themeVariables: {
          primaryColor: '#00ff88', primaryTextColor: '#e8f5ec',
          primaryBorderColor: '#00ff88', lineColor: '#00cc6a',
          background: '#0d1410', mainBkg: '#151e18', nodeBorder: '#00ff88'
        }
      });
      mermaidLoaded = true; mermaidLoading = false;
      mermaidQueue.forEach(r => r()); mermaidQueue = [];
      resolve();
    };
    s.onerror = () => { mermaidLoading = false; resolve(); };
    document.head.appendChild(s);
  });
}

async function renderMermaidEl(el) {
  await loadMermaid();
  if (!window.mermaid) return;
  const id = 'mmd_' + Math.random().toString(36).slice(2);
  try {
    const { svg } = await window.mermaid.render(id, el.textContent.trim());
    const wrapper = document.createElement('div');
    wrapper.className = 'mermaid-diagram';
    // svg is generated by the trusted mermaid library, not user content
    wrapper.innerHTML = svg;
    el.replaceWith(wrapper);
  } catch (e) {
    el.classList.add('mermaid-error');
    el.title = 'Diagram parse error: ' + e.message;
  }
}

function md(text) {
  if (!text) return '';
  let hasMermaid = false;
  const result = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```mermaid\n?([\s\S]*?)```/gi, (_, code) => {
      hasMermaid = true;
      const id = 'mmd_pre_' + Math.random().toString(36).slice(2);
      // Mermaid code is rendered inside esc() via the original block, but we escaped everything at start.
      // Re-reversing the &lt; and &gt; for mermaid specifically so it can parse its syntax.
      const unescapedCode = code.trim().replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      return `<pre class="mermaid-pre" id="${id}">${esc(unescapedCode)}</pre>`;
    })
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, l, c) => {
      const unescapedCode = c.trim().replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      return `<pre><code>${esc(unescapedCode)}</code></pre>`;
    })
    .replace(/`([^`\n]+)`/g, (_, c) => {
      const unescapedCode = c.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      return `<code>${esc(unescapedCode)}</code>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, m => `<ul>${m}</ul>`)
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/^([^<\n].+)$/gm, m => m.startsWith('<') ? m : `<p>${m}</p>`)
    .replace(/<p><\/p>/g, '')
    .replace(/\[(.*?)\]\((https?:\/\/.*?)\)/g, (_, label, url) => {
      const u = url.replace(/&amp;/g, '&');
      const safeUrl = u.replace(/"/g, '%22').replace(/'/g, '%27');
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    })
    .replace(/(?<!href=")(https?:\/\/[^\s<"]+)/g, (_, url) => {
      const u = url.replace(/&amp;/g, '&');
      if (!/^https?:\/\//i.test(u)) return url;
      const safeUrl = u.replace(/"/g, '%22').replace(/'/g, '%27');
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${esc(u)}</a>`;
    });

  if (hasMermaid) {
    setTimeout(() => {
      document.querySelectorAll('.mermaid-pre').forEach(el => renderMermaidEl(el));
    }, 50);
  }
  return result;
}

function csvFromJSON(raw) {
  let rows;
  try { rows = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { rows = []; }
  if (!Array.isArray(rows) || !rows.length) return '';
  const data = Array.isArray(rows[0]) ? rows : (() => {
    const keys = Object.keys(rows[0]);
    return [keys, ...rows.map(r => keys.map(k => r[k]))];
  })();
  return data.map(r => r.map(c => {
    const s = String(c ?? '');
    return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(',')).join('\n');
}

// ── STORAGE ────────────────────────────────────────────────────────
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
  toast(`Macro "${name}" saved ✓`);
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
  toast(intervalMinutes ? `Scheduled every ${intervalMinutes}m ✓` : 'Schedule removed');
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
          <button class="macro-run-btn" data-id="${m.id}" title="Run now">▶</button>
          <button class="macro-del-btn" data-id="${m.id}" title="Delete">✕</button>
        </div>
      </div>
      <div class="macro-meta">
        <span>Last run: ${ago}</span>
        <span>Schedule: <select class="macro-schedule-sel" data-id="${m.id}">
          <option value="">manual${!m.schedule ? ' ✓' : ''}</option>
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

// ══════════════════════════════════════════════════════════════════
// API LAYER — THREE FORMATS
// ══════════════════════════════════════════════════════════════════

// ── ANTHROPIC ─────────────────────────────────────────────────────
//
// CRITICAL RULES for Anthropic JSON Schema:
//  1. Tools with ZERO parameters: omit input_schema entirely
//  2. 'number' stays 'number' (NOT integer)  
//  3. 'array'  must include items: { type: 'string' }
//  4. 'required' omitted when empty
//  5. Screenshot/list_tabs/finish have no params → NO input_schema
//
function buildAnthropicTools(tools) {
  return tools.map(t => {
    const entries = Object.entries(t.parameters);

    // ── Zero-parameter tools: no input_schema at all ──────────────
    if (entries.length === 0) {
      return { name: t.name, description: t.description };
    }

    // ── Build valid JSON Schema properties ────────────────────────
    const properties = {};
    for (const [k, v] of entries) {
      const jsType = (v.type || 'string').toLowerCase();
      const prop = { description: v.description || '' };

      if (jsType === 'boolean') prop.type = 'boolean';
      else if (jsType === 'number') prop.type = 'number';   // NEVER convert to integer
      else if (jsType === 'array') { prop.type = 'array'; prop.items = { type: 'string' }; }
      else prop.type = 'string';

      if (v.enum) prop.enum = v.enum;
      properties[k] = prop;
    }

    // Parameters that are always optional (never go into 'required')
    // This must stay in sync with tool definitions above.
    const OPTIONAL = new Set([
      // core nav/interaction
      'selector', 'amount', 'submit', 'ms', 'world',
      // scrape_page
      'include_links', 'include_tables',
      // type
      'clear_first',
      // scroll
      'direction',
      // create_task_plan / update_task_step
      'note',
      // export_data / show_citations / add_citation
      'format', 'export_format', 'filename',
      // summarize_tabs
      'tab_ids', 'focus',
      // cross_site_research
      'question', 'attributes',
      // auto_highlight
      'max_highlights',
      // add_citation (url is optional — defaults to current tab)
      'url',
    ]);
    const required = entries.map(([k]) => k).filter(k => !OPTIONAL.has(k));

    const schema = { type: 'object', properties };
    if (required.length) schema.required = required;

    return { name: t.name, description: t.description, input_schema: schema };
  });
}

function buildAnthropicMessages(messages) {
  const out = [];
  for (const m of messages) {
    if (m.role === 'system') continue;

    if (m.type === 'tool_result') {
      // Strip image data — only text reaches Anthropic as a tool_result
      const text = typeof m.content === 'string'
        ? m.content
        : Array.isArray(m.content)
          ? m.content.filter(p => p.type === 'text').map(p => p.text).join('\n')
          : String(m.content);
      out.push({ role: 'user', content: [{ type: 'tool_result', tool_use_id: m.tool_use_id, content: text }] });

    } else if (m.type === 'tool_use') {
      out.push({ role: 'assistant', content: [{ type: 'tool_use', id: m.id, name: m.name, input: m.input }] });

    } else {
      out.push({ role: m.role, content: m.content || '' });
    }
  }

  // Merge consecutive same-role turns (Anthropic requires strict alternation)
  const merged = [];
  for (const m of out) {
    const prev = merged[merged.length - 1];
    if (prev && prev.role === m.role) {
      const prevC = Array.isArray(prev.content) ? prev.content : [{ type: 'text', text: String(prev.content) }];
      const curC = Array.isArray(m.content) ? m.content : [{ type: 'text', text: String(m.content) }];
      merged[merged.length - 1] = { role: m.role, content: [...prevC, ...curC] };
    } else {
      merged.push({ ...m });
    }
  }

  return merged;
}

// ── OPENAI ────────────────────────────────────────────────────────
function buildOpenAITools(tools) {
  return tools.map(t => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: {
        type: 'object',
        properties: Object.fromEntries(Object.entries(t.parameters).map(([k, v]) => {
          const jsType = (v.type || 'string').toLowerCase();
          const prop = { description: v.description || '' };
          if (jsType === 'boolean') prop.type = 'boolean';
          else if (jsType === 'number') prop.type = 'number';
          else if (jsType === 'array') { prop.type = 'array'; prop.items = { type: 'string' }; }
          else prop.type = 'string';
          if (v.enum) prop.enum = v.enum;
          return [k, prop];
        })),
        required: Object.keys(t.parameters).filter(k =>
          !['selector', 'amount', 'submit', 'ms', 'world', 'include_links', 'include_tables',
            'clear_first', 'note', 'format', 'export_format', 'filename', 'tab_ids', 'focus',
            'question', 'attributes', 'max_highlights', 'url', 'direction'].includes(k))
      }
    }
  }));
}

function buildOpenAIMessages(messages, sys) {
  // sys may be null when called for the Responses API (system goes in `instructions` field)
  const out = sys != null ? [{ role: 'system', content: sys }] : [];
  for (const m of messages) {
    if (m.role === 'system') continue;
    if (m.type === 'tool_result') {
      const text = typeof m.content === 'string' ? m.content
        : Array.isArray(m.content) ? m.content.filter(p => p.type === 'text').map(p => p.text).join('\n')
          : String(m.content);
      out.push({ role: 'tool', tool_call_id: m.tool_use_id, content: text });
    } else if (m.type === 'tool_use') {
      const prev = out[out.length - 1];
      if (prev && prev.role === 'assistant') {
        if (!prev.tool_calls) prev.tool_calls = [];
        prev.tool_calls.push({ id: m.id, type: 'function', function: { name: m.name, arguments: JSON.stringify(m.input) } });
      } else {
        out.push({ role: 'assistant', content: null, tool_calls: [{ id: m.id, type: 'function', function: { name: m.name, arguments: JSON.stringify(m.input) } }] });
      }
    } else {
      out.push({ role: m.role, content: m.content || '' });
    }
  }
  return out;
}

// ── GEMINI ────────────────────────────────────────────────────────
function toGeminiType(t) {
  switch ((t || 'string').toLowerCase()) {
    case 'boolean': return 'BOOLEAN';
    case 'number': return 'NUMBER';
    case 'integer': return 'INTEGER';
    case 'array': return 'ARRAY';
    case 'object': return 'OBJECT';
    default: return 'STRING';
  }
}

function buildGeminiTools(tools) {
  return [{
    functionDeclarations: tools.map(t => {
      const entries = Object.entries(t.parameters);
      const fn = { name: t.name, description: t.description };
      if (entries.length > 0) {
        const props = {};
        const req = [];
        for (const [k, v] of entries) {
          const prop = { type: toGeminiType(v.type), description: v.description || '' };
          if (v.enum) prop.enum = v.enum;
          if (prop.type === 'ARRAY') prop.items = { type: 'STRING' };
          if (!['selector', 'amount', 'submit', 'ms'].includes(k)) req.push(k);
          props[k] = prop;
        }
        fn.parameters = { type: 'OBJECT', properties: props };
        if (req.length) fn.parameters.required = req;
      }
      return fn;
    })
  }];
}

function buildGeminiContents(messages) {
  const contents = [];
  for (const m of messages) {
    if (m.role === 'system') continue;
    if (m.type === 'tool_result') {
      const text = typeof m.content === 'string' ? m.content
        : Array.isArray(m.content) ? m.content.filter(p => p.type === 'text').map(p => p.text).join('\n')
          : String(m.content);
      contents.push({ role: 'user', parts: [{ functionResponse: { name: m.toolName || 'tool', response: { output: text } } }] });
    } else if (m.type === 'tool_use') {
      contents.push({ role: 'model', parts: [{ functionCall: { name: m.name, args: m.input || {} } }] });
    } else {
      contents.push({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content || '' }] });
    }
  }
  // Merge same-role turns
  const merged = [];
  for (const c of contents) {
    const prev = merged[merged.length - 1];
    if (prev && prev.role === c.role) prev.parts.push(...c.parts);
    else merged.push({ role: c.role, parts: [...c.parts] });
  }
  return merged;
}

function generateXMLToolsSchema() {
  const toolsXML = TOOLS.map(t => {
    const props = Object.entries(t.parameters).map(([k, v]) => `  "${k}": "${v.type}"${!['selector', 'amount', 'submit', 'ms', 'world', 'include_links', 'include_tables', 'clear_first', 'note', 'format', 'export_format', 'filename', 'tab_ids', 'focus', 'question', 'attributes', 'max_highlights', 'url', 'direction'].includes(k) ? ' (required)' : ''}`).join(',\n');
    return `Tool: ${t.name}\nDescription: ${t.description}\nInput JSON Schema:\n{\n${props}\n}`;
  }).join('\n\n');
  return `\n\n## Tools Available\nYou have access to the following tools. To use a tool, respond ONLY with the following exact format:\n<function=tool_name>{"arg_name": "arg_value"}</function>\n\n${toolsXML}`;
}

// ── CALL AI ───────────────────────────────────────────────────────
// Build request body + headers for a given provider config + credentials
async function buildProviderRequest(providerKey, modelId, apiKeyVal, baseUrlVal, accountIdVal, messages, sys) {
  const pc = PROVIDERS[providerKey];
  if (!pc) throw new Error('Unknown provider: ' + providerKey);
  let url, headers, body;

  // Determine max output tokens based on model era.
  // Modern models (Claude 4.5+, GPT-5+, Gemini 3+) support much larger output buffers.
  const isModernModel = modelId.includes('4.') || modelId.includes('5.') || modelId.includes('3.');
  const maxTokens = isModernModel ? 65536 : 4096;

  if (pc.format === 'anthropic') {
    url = pc.baseUrl;
    headers = {
      'Content-Type': 'application/json',
      'x-api-key': apiKeyVal,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    };
    body = {
      model: modelId, max_tokens: maxTokens, system: sys,
      messages: buildAnthropicMessages(messages),
      tools: buildAnthropicTools(TOOLS),
      tool_choice: { type: 'auto' }
    };

  } else if (pc.format === 'openai-responses') {
    // OpenAI Responses API (/v1/responses) — different shape from Chat Completions.
    // Uses `input` instead of `messages`, `instructions` for system prompt,
    // and `max_output_tokens` instead of `max_tokens`.
    url = baseUrlVal || pc.baseUrl;
    headers = { 'Content-Type': 'application/json' };
    if (apiKeyVal) headers['Authorization'] = `Bearer ${apiKeyVal}`;
    const oaiTools = buildOpenAITools(TOOLS);
    body = {
      model: modelId,
      input: buildOpenAIMessages(messages, null), // system excluded from input
      instructions: sys,                           // system goes here
      max_output_tokens: maxTokens,
      tools: oaiTools,
      tool_choice: 'auto'
    };

  } else if (pc.format === 'gemini') {
    const mdl = modelId.includes('/') ? modelId.split('/').pop() : modelId;
    url = pc.baseUrl.replace('{model}', mdl) + (apiKeyVal ? `?key=${apiKeyVal}` : '');
    // If it's going to stream (we detect this when called from callAIStreaming), we'll add ?alt=sse there
    headers = { 'Content-Type': 'application/json' };
    body = {
      contents: buildGeminiContents(messages),
      tools: buildGeminiTools(TOOLS),
      systemInstruction: { parts: [{ text: sys }] },
      generationConfig: { maxOutputTokens: maxTokens }
    };

  } else {
    // Generic OpenAI-compatible (Chat Completions) — covers openrouter, groq, ollama, cloudflare etc.
    let finalTools = buildOpenAITools(TOOLS);
    let finalSysPrompt = sys;
    if (providerKey === 'ollama') {
      const supportsTools = await checkOllamaToolSupport(baseUrlVal, modelId);
      if (!supportsTools) {
        finalTools = undefined; // Drop the tools array
        finalSysPrompt += generateXMLToolsSchema(); // Inject XML schema
      }
    }

    let base = baseUrlVal || pc.baseUrl;
    if (providerKey === 'cloudflare' && accountIdVal) base = pc.baseUrl.replace('{accountId}', accountIdVal);
    url = base;
    headers = { 'Content-Type': 'application/json' };
    if (apiKeyVal) headers['Authorization'] = `Bearer ${apiKeyVal}`;
    if (providerKey === 'openrouter') {
      headers['HTTP-Referer'] = 'https://github.com/Prof-MAN9/OpenBrowser';
      headers['X-Title'] = 'OpenBrowser';
    }
    body = {
      model: modelId, max_tokens: maxTokens,
      messages: buildOpenAIMessages(messages, finalSysPrompt),
      tools: finalTools,
      tool_choice: finalTools ? 'auto' : undefined
    };
    // Ollama: keep the model resident in memory between turns.
    // Without this, Ollama unloads the model after 5 minutes of inactivity,
    // causing the next request to stall for 30-120s while it reloads.
    // -1 means "never unload while this panel is open".
    if (providerKey === 'ollama') {
      body.keep_alive = -1;
    }
  }

  return { url, headers, body, format: pc.format };
}

// Quota/rate-limit errors that should trigger backup model
function isQuotaError(status, text) {
  if (status === 429) return true;                                 // rate limit
  if (status === 402) return true;                                 // payment required
  if (status === 529) return true;                                 // overloaded
  if (text.toLowerCase().includes('quota')) return true;
  if (text.toLowerCase().includes('rate_limit')) return true;
  if (text.toLowerCase().includes('overloaded')) return true;
  if (text.toLowerCase().includes('capacity')) return true;
  return false;
}

// ── NATURAL LANGUAGE NAVIGATION ─────────────────────────────────────────
// Known site name → canonical URL mapping
const SITE_MAP = {
  'youtube': 'https://www.youtube.com', 'yt': 'https://www.youtube.com',
  'gmail': 'https://mail.google.com', 'mail': 'https://mail.google.com',
  'google': 'https://www.google.com', 'drive': 'https://drive.google.com',
  'docs': 'https://docs.google.com', 'sheets': 'https://sheets.google.com',
  'slides': 'https://slides.google.com', 'calendar': 'https://calendar.google.com',
  'meet': 'https://meet.google.com', 'maps': 'https://maps.google.com',
  'github': 'https://github.com', 'gh': 'https://github.com',
  'reddit': 'https://www.reddit.com', 'twitter': 'https://x.com',
  'x': 'https://x.com', 'facebook': 'https://www.facebook.com',
  'fb': 'https://www.facebook.com', 'instagram': 'https://www.instagram.com',
  'ig': 'https://www.instagram.com', 'linkedin': 'https://www.linkedin.com',
  'amazon': 'https://www.amazon.com', 'ebay': 'https://www.ebay.com',
  'netflix': 'https://www.netflix.com', 'spotify': 'https://open.spotify.com',
  'wikipedia': 'https://www.wikipedia.org', 'wiki': 'https://www.wikipedia.org',
  'stackoverflow': 'https://stackoverflow.com', 'so': 'https://stackoverflow.com',
  'mdn': 'https://developer.mozilla.org', 'npm': 'https://www.npmjs.com',
  'pypi': 'https://pypi.org', 'hackernews': 'https://news.ycombinator.com',
  'hn': 'https://news.ycombinator.com', 'producthunt': 'https://www.producthunt.com',
  'claude': 'https://claude.ai', 'openai': 'https://chat.openai.com',
  'chatgpt': 'https://chat.openai.com', 'perplexity': 'https://www.perplexity.ai',
  'vercel': 'https://vercel.com', 'heroku': 'https://heroku.com',
  'figma': 'https://www.figma.com', 'notion': 'https://www.notion.so',
  'jira': 'https://www.atlassian.com/software/jira',
  'slack': 'https://slack.com', 'discord': 'https://discord.com',
  'twitch': 'https://www.twitch.tv', 'tiktok': 'https://www.tiktok.com',
  'news': 'https://news.google.com', 'bbc': 'https://www.bbc.com',
  'cnn': 'https://www.cnn.com', 'nytimes': 'https://www.nytimes.com',
};

function resolveNavigationTarget(raw) {
  if (!raw) return 'https://www.google.com';

  // Already a full URL
  if (/^https?:\/\//i.test(raw)) return raw;

  // Looks like a domain: example.com or sub.example.co.uk
  if (/^[a-z0-9-]+\.[a-z]{2,}(\/|$)/i.test(raw)) return 'https://' + raw;

  const lower = raw.toLowerCase().trim();

  // Search intent: "search for X" / "look up X" / "find X"
  const searchMatch = lower.match(/^(?:search(?:\s+for)?|look\s+up|find|google)\s+(.+)$/);
  if (searchMatch) return 'https://www.google.com/search?q=' + encodeURIComponent(searchMatch[1]);

  // Go to / open / visit X
  const goMatch = lower.match(/^(?:go\s+to|open|visit|navigate\s+to)\s+(.+)$/);
  const target = goMatch ? goMatch[1].trim() : lower;

  // Check site map (exact or partial)
  const key = target.replace(/[^a-z0-9]/g, '');
  if (SITE_MAP[key]) return SITE_MAP[key];
  if (SITE_MAP[target]) return SITE_MAP[target];

  // Partial match: "my gmail" → gmail
  for (const [k, v] of Object.entries(SITE_MAP)) {
    if (target.includes(k) || k.includes(target.replace(/\s+/g, ''))) return v;
  }

  // Looks like a bare domain word (one word, no spaces)
  if (/^[a-z0-9-]+$/i.test(target)) return `https://www.${target}.com`;

  // Fallback: Google search
  return 'https://www.google.com/search?q=' + encodeURIComponent(raw);
}

// ── INTENT-BASED BROWSING ────────────────────────────────────────────────
// Maps a user intent to the best starting URL using heuristics
function resolveIntentToUrl(intent) {
  const lower = intent.toLowerCase();

  // Shopping
  if (/buy|shop|purchase|price|order|deal|discount|cheap/i.test(lower)) {
    if (/book|novel|kindle|ebook/i.test(lower)) return 'https://www.amazon.com/books';
    if (/flight|ticket|travel|hotel/i.test(lower)) return 'https://www.google.com/travel/flights';
    if (/food|restaurant|delivery|eat/i.test(lower)) return 'https://www.doordash.com';
    return 'https://www.google.com/search?q=' + encodeURIComponent(intent + ' buy');
  }

  // News / current events
  if (/news|latest|today|current|happening/i.test(lower)) return 'https://news.google.com';

  // Learning / tutorials
  if (/learn|tutorial|how to|course|guide|beginner/i.test(lower)) {
    if (/code|program|develop|javascript|python|react/i.test(lower))
      return 'https://www.google.com/search?q=' + encodeURIComponent(intent + ' tutorial site:github.com OR site:developer.mozilla.org OR site:freecodecamp.org');
    return 'https://www.google.com/search?q=' + encodeURIComponent(intent);
  }

  // Research / information
  if (/what is|who is|explain|define|meaning|history/i.test(lower))
    return 'https://en.wikipedia.org/w/index.php?search=' + encodeURIComponent(intent.replace(/^(what|who|why|how)\s+(is|are|was|were)\s+/i, ''));

  // Watching / streaming
  if (/watch|video|movie|show|episode|stream/i.test(lower)) {
    if (/youtube/i.test(lower)) return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(intent);
    return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(intent);
  }

  // Default: Google search
  return 'https://www.google.com/search?q=' + encodeURIComponent(intent);
}

// ── SMART BOOKMARKS ──────────────────────────────────────────────────────
function autoTagBookmark(url, title, summary) {
  const text = (url + ' ' + title + ' ' + summary).toLowerCase();
  const tagRules = [
    ['programming', /github|code|developer|api|npm|python|javascript|react|css|html|stackoverflow/],
    ['ai', /openai|claude|anthropic|llm|gpt|gemini|artificial intelligence|machine learning/],
    ['news', /news|bbc|cnn|reuters|times|nytimes|guardian|breaking/],
    ['shopping', /amazon|ebay|shop|store|buy|cart|product|price/],
    ['video', /youtube|twitch|vimeo|netflix|watch|video|stream/],
    ['social', /twitter|x\.com|reddit|linkedin|instagram|facebook|discord/],
    ['tools', /tool|app|dashboard|editor|playground|calculator/],
    ['docs', /docs|documentation|guide|reference|manual|readme/],
    ['research', /wikipedia|scholar|paper|study|research|science/],
    ['finance', /stock|crypto|finance|invest|bank|tax|money/],
    ['design', /figma|design|ux|ui|color|font|typography/],
    ['travel', /flight|hotel|trip|travel|booking|airbnb/],
  ];
  const tags = tagRules.filter(([, re]) => re.test(text)).map(([t]) => t);
  // Add domain as a tag too
  try { tags.unshift(new URL(url).hostname.replace(/^www\./, '').split('.')[0]); } catch { }
  return [...new Set(tags)].slice(0, 5).join(', ');
}

async function saveSmartBookmark({ url, title, summary, tags, folder }) {
  // Use chrome.bookmarks API
  const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
  try {
    // Find or create the folder
    const results = await chrome.bookmarks.search({ title: folder });
    let folderId;
    const existing = results.find(r => r.url === undefined); // folders have no url
    if (existing) {
      folderId = existing.id;
    } else {
      const newFolder = await chrome.bookmarks.create({ title: folder });
      folderId = newFolder.id;
    }
    // Create the bookmark — append tags and summary to title
    const fullTitle = `${title}${tagList.length ? ' [' + tagList.join(', ') + ']' : ''}`;
    await chrome.bookmarks.create({ parentId: folderId, title: fullTitle, url });
    // Also store in local state for the panel
    if (!state.bookmarks) state.bookmarks = [];
    state.bookmarks.unshift({ url, title, summary, tags: tagList, savedAt: Date.now() });
    return { ok: true };
  } catch (e) {
    // Fallback: save only in session state
    if (!state.bookmarks) state.bookmarks = [];
    state.bookmarks.unshift({ url, title, summary, tags: tagList, savedAt: Date.now() });
    return { ok: true, warn: 'bookmarks permission missing — saved in session only' };
  }
}

async function loadSmartBookmarks(filter = '') {
  // Pull from state first (includes session-only ones)
  const sessionBms = state.bookmarks || [];
  // Also pull from Chrome bookmarks API
  try {
    const results = await chrome.bookmarks.search({ title: filter || '' });
    const chromeBms = results
      .filter(r => r.url)
      .map(r => ({
        url: r.url, title: r.title?.replace(/\s*\[[^\]]*\]\s*$/, ''),
        tags: (r.title.match(/\[([^\]]+)\]/) || ['', ''])[1].split(',').map(t => t.trim()).filter(Boolean),
        summary: '', savedAt: r.dateAdded
      }));
    // Merge, dedupe by URL
    const seen = new Set(sessionBms.map(b => b.url));
    const all = [...sessionBms, ...chromeBms.filter(b => !seen.has(b.url))];
    return filter ? all.filter(b => JSON.stringify(b).toLowerCase().includes(filter.toLowerCase())) : all;
  } catch {
    return filter ? sessionBms.filter(b => JSON.stringify(b).toLowerCase().includes(filter.toLowerCase())) : sessionBms;
  }
}

// ── OLLAMA DISCOVERY ─────────────────────────────────────────────────────
async function discoverOllamaModels(baseUrl) {
  const root = (baseUrl || 'http://localhost:11434').replace(/\/v1\/.*$/, '').replace(/\/$/, '');
  try {
    // 8s timeout — /api/tags is a lightweight call but can be slow if Ollama
    // is first starting up or if the system is under load.
    const res = await fetch(`${root}/api/tags`, { signal: AbortSignal.timeout(8000) });
    // 403 = Ollama is running but rejected the chrome-extension:// origin.
    // Return a sentinel so the caller can give a CORS-specific error message.
    if (res.status === 403) return { corsError: true };
    if (!res.ok) return null;
    const data = await res.json();
    return (data.models || []).map(m => ({
      id: m.name,
      label: m.name + (m.details?.parameter_size ? ` (${m.details.parameter_size})` : '')
    }));
  } catch {
    return null;
  }
}

const ollamaToolSupportCache = {};
async function checkOllamaToolSupport(baseUrl, modelId) {
  if (ollamaToolSupportCache[modelId] !== undefined) return ollamaToolSupportCache[modelId];
  const root = (baseUrl || 'http://localhost:11434').replace(/\/v1\/.*$/, '').replace(/\/$/, '');
  try {
    const res = await fetch(`${root}/api/show`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelId }),
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const tmpl = data.template || '';
    // If the template references .Tools, the model natively understands tool calling
    const supports = tmpl.includes('{{- if .Tools }}') || tmpl.includes('{{ .Tools }}') || tmpl.includes('{{.Tools}}');
    ollamaToolSupportCache[modelId] = supports;
    return supports;
  } catch {
    // If we fail to check, assume false to be safe (fallback to XML)
    return false;
  }
}

// ── RATE LIMITER ─────────────────────────────────────────────────────────
// Tracks API call timestamps. Enforces RPM / RPD limits (stops 5 before limit).
function recordApiCall() {
  const now = Date.now();
  state.rateLog.push(now);
  // Prune entries older than 24h to prevent unbounded growth
  const cutoff = now - 86_400_000;
  state.rateLog = state.rateLog.filter(t => t > cutoff);
  chrome.storage.local.set({ ob_rateLog: state.rateLog }).catch(() => { });
  updateRateDisplay();
}

function checkRateLimit() {
  const s = state.settings;
  const now = Date.now();
  const BUFFER = 5; // stop this many calls before the limit

  if (s.rpmLimit > 0) {
    const perMinute = state.rateLog.filter(t => now - t < 60_000).length;
    if (perMinute >= s.rpmLimit - BUFFER) {
      throw new Error(`RPM limit safety stop: ${perMinute} calls in the last minute (limit ${s.rpmLimit}, buffer ${BUFFER}). Wait a moment or raise the limit in Settings.`);
    }
  }
  if (s.rpdLimit > 0) {
    const perDay = state.rateLog.filter(t => now - t < 86_400_000).length;
    if (perDay >= s.rpdLimit - BUFFER) {
      throw new Error(`RPD limit safety stop: ${perDay} calls today (limit ${s.rpdLimit}, buffer ${BUFFER}). Daily limit nearly reached.`);
    }
  }
}

function updateRateDisplay() {
  const badge = document.getElementById('rate-badge');
  if (!badge) return;
  const now = Date.now();
  const s = state.settings;
  const rpm = state.rateLog.filter(t => now - t < 60_000).length;
  const rpd = state.rateLog.filter(t => now - t < 86_400_000).length;

  const parts = [];
  if (s.rpmLimit > 0) parts.push(`${rpm}/${s.rpmLimit} rpm`);
  if (s.rpdLimit > 0) parts.push(`${rpd}/${s.rpdLimit} rpd`);

  if (parts.length) {
    badge.textContent = parts.join(' · ');
    badge.style.display = 'inline';
    // Warn if close to limit (within 10%)
    const rpmWarn = s.rpmLimit > 0 && rpm >= s.rpmLimit * 0.9;
    const rpdWarn = s.rpdLimit > 0 && rpd >= s.rpdLimit * 0.9;
    badge.className = 'rate-badge' + (rpmWarn || rpdWarn ? ' rate-warn' : '');
  } else {
    badge.style.display = 'none';
  }
}

async function callAI(messages, sys, signal) {
  const s = state.settings;

  // ── Rate limit check (throws if within buffer of limit) ────────
  checkRateLimit();

  // ── Try primary model ──────────────────────────────────────────
  if (!state.backupActive) {
    const req = await buildProviderRequest(s.provider, s.model, s.apiKey, s.baseUrl, s.accountId, messages, sys);
    const res = await fetch(req.url, { method: 'POST', headers: req.headers, body: JSON.stringify(req.body), signal });

    // Record AFTER receiving the response (counts only real API round-trips)
    recordApiCall();

    if (res.ok) {
      return parseAIResponse(await res.json(), req.format);
    }

    const errText = await res.text().catch(() => '');
    // Ollama-specific: 403 means the server rejected the chrome-extension:// origin.
    // This is a CORS configuration issue, not a quota error — don't try the backup model.
    if (res.status === 403 && s.provider === 'ollama') {
      throw new Error(
        'Ollama blocked this request (HTTP 403 — CORS).\n\n' +
        'Ollama does not allow requests from browser extensions by default.\n\n' +
        'Fix: restart Ollama with the OLLAMA_ORIGINS environment variable:\n\n' +
        '  macOS/Linux:   OLLAMA_ORIGINS="chrome-extension://*" ollama serve\n' +
        '  Windows (PS):  $env:OLLAMA_ORIGINS="chrome-extension://*"; ollama serve\n\n' +
        'Then click "Test Connection" in Settings to confirm it worked.'
      );
    }
    // If it's a quota/rate-limit error AND backup is configured, fall through
    if (isQuotaError(res.status, errText) && s.backupProvider && s.backupModel && s.backupApiKey) {
      state.backupActive = true;
      addStep('error', '⚠️', 'Primary quota hit', `Switching to backup: ${s.backupModel}`);
      toast('Primary model quota exceeded — switching to backup model');
    } else {
      throw new Error(`API ${res.status}: ${errText.substring(0, 400)}`);
    }
  }

  // ── Try backup model ───────────────────────────────────────────
  const req = await buildProviderRequest(s.backupProvider, s.backupModel, s.backupApiKey, '', '', messages, sys);
  const res = await fetch(req.url, { method: 'POST', headers: req.headers, body: JSON.stringify(req.body), signal });
  if (!res.ok) {
    const errText = await res.text().catch(() => 'Unknown error');
    state.backupActive = false;  // reset so next run tries primary again
    throw new Error(`Backup API ${res.status}: ${errText.substring(0, 400)}`);
  }
  return parseAIResponse(await res.json(), req.format);
}

// ── PARSE RESPONSE ────────────────────────────────────────────────
// Safety net: detect XML <function_calls> fallback and re-parse it.
// This happens if the model falls back to its old format.
// Detect ALL known Anthropic XML / text-format tool-call fallbacks.
// Anthropic has used several formats across model versions:
//   Format A (old):  <function_calls><invoke name="X">...</invoke></function_calls>
//   Format B (current): <function=X{"arg": "val"}>
//   Format C:        <function=X>{"arg": "val"}</function>
//   Format D:        [X({"arg": "val"})]
function detectXMLToolCalls(text) {
  if (!text) return null;
  const calls = [];
  const knownNames = new Set(TOOLS.map(t => t.name));

  // Helper: safe JSON parse
  const tryParse = (s) => { try { return JSON.parse(s.trim()); } catch { return null; } };

  // ── Format B (current): <function=toolName{...}> ─────────────────
  // e.g. <function=navigate{"url": "https://youtube.com"}>
  // IMPORTANT: tool name is ONLY word chars — the { starts the JSON immediately
  const fmtB = /<function=([a-zA-Z_]\w*)(\{[\s\S]*?\})(?:>|$)/g;
  let m;
  while ((m = fmtB.exec(text)) !== null) {
    const name = m[1];
    if (!knownNames.has(name)) continue;
    const input = tryParse(m[2]) || {};
    calls.push({ id: uid(), name, input });
  }
  if (calls.length) return calls;

  // ── Format B2: <function=toolName> (no json, just the name) ──────
  const fmtB2 = /<function=([a-zA-Z_]\w*)>/g;
  while ((m = fmtB2.exec(text)) !== null) {
    const name = m[1];
    if (!knownNames.has(name)) continue;
    calls.push({ id: uid(), name, input: {} });
  }
  if (calls.length) return calls;

  // ── Format C: <function=toolName>{"arg": "val"}</function> ───────
  const fmtC = /<function=([a-zA-Z_]\w*)>([\s\S]*?)<\/function>/g;
  while ((m = fmtC.exec(text)) !== null) {
    const name = m[1];
    if (!knownNames.has(name)) continue;
    const input = tryParse(m[2]) || {};
    calls.push({ id: uid(), name, input });
  }
  if (calls.length) return calls;

  // ── Format A (old): <function_calls><invoke name="X">...</invoke> ─
  if (text.includes('<function_calls>') || text.includes('<invoke')) {
    const invokeRE = /<invoke\s+name="([^"]+)">([\s\S]*?)<\/invoke>/g;
    while ((m = invokeRE.exec(text)) !== null) {
      const name = m[1];
      const body = m[2];
      const input = {};
      const paramRE = /<(\w+)>([\s\S]*?)<\/\1>/g;
      let p;
      while ((p = paramRE.exec(body)) !== null) input[p[1]] = p[2].trim();
      calls.push({ id: uid(), name, input });
    }
  }
  if (calls.length) return calls;

  // ── Format D: [toolName({"arg": "val"})] ─────────────────────────
  const fmtD = /\[([a-zA-Z_]\w*)\((\{[\s\S]*?\})\)\]/g;
  while ((m = fmtD.exec(text)) !== null) {
    const name = m[1];
    if (!knownNames.has(name)) continue;
    const input = tryParse(m[2]) || {};
    calls.push({ id: uid(), name, input });
  }
  if (calls.length) return calls;

  // ── Format E: bare JSON block after tool name (model gets confused) ─
  // e.g.  navigate\n{"url": "https://..."}\n
  const fmtE = /^([a-zA-Z_]\w*)\s*\n(\{[\s\S]*?\})/m;
  const mE = fmtE.exec(text);
  if (mE && knownNames.has(mE[1])) {
    const input = tryParse(mE[2]) || {};
    calls.push({ id: uid(), name: mE[1], input });
  }

  return calls.length ? calls : null;
}

function parseAIResponse(data, format) {
  if (format === 'anthropic') {
    const blocks = data.content || [];
    const text = blocks.filter(b => b.type === 'text').map(b => b.text).join('\n');
    const uses = blocks.filter(b => b.type === 'tool_use');

    // Check for XML fallback in text blocks
    const xmlTools = !uses.length && text ? detectXMLToolCalls(text) : null;
    if (xmlTools) return { type: 'tool_use', tools: xmlTools, text: '' };

    return uses.length
      ? { type: 'tool_use', tools: uses.map(b => ({ id: b.id, name: b.name, input: b.input })), text }
      : { type: 'text', text };
  }

  if (format === 'gemini') {
    const parts = data.candidates?.[0]?.content?.parts || [];
    const text = parts.filter(p => p.text).map(p => p.text).join('\n');
    const fns = parts.filter(p => p.functionCall);
    const xmlTools = !fns.length && text ? detectXMLToolCalls(text) : null;
    if (xmlTools) return { type: 'tool_use', tools: xmlTools, text: '' };
    return fns.length
      ? { type: 'tool_use', tools: fns.map(p => ({ id: uid(), name: p.functionCall.name, input: p.functionCall.args || {} })), text }
      : { type: 'text', text };
  }

  // OpenAI
  const msg = data.choices?.[0]?.message;
  if (!msg) throw new Error('Empty response from API');
  if (msg.tool_calls?.length) {
    return {
      type: 'tool_use',
      tools: msg.tool_calls.map(tc => ({
        id: tc.id, name: tc.function.name,
        input: (() => { try { return JSON.parse(tc.function.arguments || '{}'); } catch { return {}; } })()
      })),
      text: msg.content || ''
    };
  }
  const text = msg.content || '';
  const xmlTools = detectXMLToolCalls(text);
  if (xmlTools) return { type: 'tool_use', tools: xmlTools, text: '' };
  return { type: 'text', text };
}

// ══════════════════════════════════════════════════════════════════
// TOOL EXECUTOR
// ══════════════════════════════════════════════════════════════════
async function injectAndRun(tabId, func, args = []) {
  // Dynamic injection — no static content_scripts needed
  const results = await chrome.scripting.executeScript({
    target: { tabId }, func, args, world: 'MAIN'
  });
  return results?.[0]?.result;
}

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) throw new Error('No active tab found. Please navigate to a webpage first.');
  return tab;
}

async function executeTool(name, input) {
  setStatus('loading', name + '…');
  try {
    switch (name) {
      case 'think': return { ok: true, result: 'Plan noted.' };
      case 'memorize': {
        state.memory[input.key] = input.value;
        if (state.settings.persistMemory) saveMemory().catch(() => { });
        return { ok: true, result: `Stored "${input.key}" = "${input.value}".` };
      }
      case 'finish': return { ok: true, result: input.answer, final: true };

      case 'navigate': {
        let url = (input.url || '').trim();
        url = resolveNavigationTarget(url);
        const tab = await activeTab();
        await chrome.tabs.update(tab.id, { url });
        await wait(2000);
        return { ok: true, result: `Navigated to ${url}` };
      }

      case 'browse_intent': {
        const startUrl = resolveIntentToUrl(input.intent || '');
        const tab = await activeTab();
        await chrome.tabs.update(tab.id, { url: startUrl });
        await wait(2000);
        return { ok: true, result: `Opening best starting point for: "${input.intent}"\n→ ${startUrl}` };
      }

      case 'save_bookmark': {
        let url = (input.url || '').trim();
        let title = '', summary = input.summary || '', tags = (input.tags || '').trim();
        const folder = input.folder || 'OpenBrowser';
        if (!url) {
          const tab = await activeTab();
          url = tab.url; title = tab.title || url;
          if (!summary) {
            const r = await injectAndRun(tab.id, () => {
              const desc = document.querySelector('meta[name=description]')?.content
                || document.querySelector('meta[property="og:description"]')?.content || '';
              const h1 = document.querySelector('h1')?.innerText?.trim() || '';
              const body = (document.body?.innerText || '').replace(/\s+/g, ' ').trim().substring(0, 500);
              return { desc, h1, body, title: document.title };
            });
            if (r) { title = r.title || title; summary = r.desc || (r.h1 + '. ' + r.body).substring(0, 120); }
          }
        } else { title = url; }
        if (!tags) tags = autoTagBookmark(url, title, summary);
        await saveSmartBookmark({ url, title, summary, tags, folder });
        renderBookmarkSaved({ url, title, summary, tags: tags.split(',').map(t => t.trim()).filter(Boolean) });
        return { ok: true, result: `Bookmarked: "${title}"\nTags: ${tags}\nSummary: ${summary}` };
      }

      case 'show_bookmarks': {
        const bms = await loadSmartBookmarks(input.filter || '');
        renderBookmarkPanel(bms, input.filter || '');
        return { ok: true, result: `Showing ${bms.length} bookmark${bms.length !== 1 ? 's' : ''}${input.filter ? ` matching "${input.filter}"` : ''}.` };
      }

      case 'screenshot': {
        const r = await chrome.runtime.sendMessage({ type: 'take-screenshot' });
        if (r?.error) return { ok: false, result: 'Screenshot failed: ' + r.error };
        return { ok: true, result: 'Screenshot taken.', screenshot: r.data };
      }

      case 'toggle_spatial_grid': {
        const tab = await activeTab();
        const r = await injectAndRun(tab.id, (action) => {
          if (action === 'hide') {
            const existing = document.getElementById('ob-spatial-grid');
            if (existing) existing.remove();
            delete window.__ob_spatial_map;
            return { ok: true, result: 'Spatial grid hidden.' };
          }

          const existing = document.getElementById('ob-spatial-grid');
          if (existing) existing.remove();

          const grid = document.createElement('div');
          grid.id = 'ob-spatial-grid';
          grid.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2147483647; overflow: hidden;';

          const elements = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [contenteditable="true"]');
          
          window.__ob_spatial_map = {};
          let count = 1;
          for (const el of elements) {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) continue;
            
            const style = window.getComputedStyle(el);
            if (style.visibility === 'hidden' || style.opacity === '0' || style.display === 'none') continue;

            window.__ob_spatial_map[count] = el;

            const badge = document.createElement('div');
            badge.textContent = count;
            badge.style.cssText = `
              position: absolute;
              top: ${window.scrollY + rect.top - 8}px;
              left: ${window.scrollX + rect.left - 8}px;
              background: #ffaa22;
              color: #000;
              font-size: 11px;
              font-family: monospace;
              font-weight: bold;
              padding: 2px 4px;
              border-radius: 4px;
              border: 1px solid #000;
              box-shadow: 0 2px 4px rgba(0,0,0,0.5);
              z-index: 2147483647;
            `;
            grid.appendChild(badge);
            count++;
          }

          document.body.appendChild(grid);
          return { ok: true, result: `Spatial grid shown with ${count - 1} interactive elements.` };
        }, [input.action]);
        return r || { ok: false, result: 'Failed to toggle spatial grid.' };
      }

      case 'get_page_content': {
        const tab = await activeTab();
        const r = await injectAndRun(tab.id, (sel) => {
          let root = document.body;
          if (sel) { try { root = document.querySelector(sel) || root; } catch { } }
          const c = root.cloneNode(true);
          c.querySelectorAll('script,style,noscript').forEach(e => e.remove());
          return { text: (c.innerText || '').replace(/\s+/g, ' ').trim().substring(0, 15000), title: document.title, url: location.href };
        }, [input.selector || null]);
        return r ? { ok: true, result: `${r.title}\n${r.url}\n\n${r.text}` } : { ok: false, result: 'Could not read page.' };
      }

      case 'click': {
        const tab = await activeTab();
        const r = await injectAndRun(tab.id, async (q) => {
          function find(txt) {
            const lc = txt.toLowerCase().trim();
            for (const el of document.querySelectorAll('button,a,[role=button],[role=link],[role=tab],[role=menuitem],input,label,span,div,h1,h2,h3,li')) {
              const t = (el.textContent || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '').toLowerCase().trim();
              if (t === lc || t.includes(lc)) return el;
            }
            return null;
          }
          let el = null;
          if (/^\d+$/.test(q) && window.__ob_spatial_map && window.__ob_spatial_map[q]) {
            el = window.__ob_spatial_map[q];
          } else {
            try { el = document.querySelector(q); } catch { }
            if (!el) el = find(q);
          }
          if (!el) return { ok: false, error: 'Not found: ' + q };
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          await new Promise(r => setTimeout(r, 150));
          el.focus(); el.click();
          el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          return { ok: true, tag: el.tagName, text: (el.textContent || '').trim().substring(0, 80) };
        }, [input.target]);
        return r || { ok: false, result: 'Click failed.' };
      }

      case 'type': {
        const tab = await activeTab();
        const r = await injectAndRun(tab.id, async (target, text, submit) => {
          function findInput(q) {
            try { const e = document.querySelector(q); if (e) return e; } catch { }
            const lq = q.toLowerCase();
            for (const el of document.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]),textarea,[contenteditable=true]')) {
              const t = [
                document.querySelector(`label[for="${el.id}"]`)?.textContent,
                el.placeholder, el.getAttribute('aria-label'), el.name
              ].filter(Boolean).join(' ').toLowerCase();
              if (t.includes(lq)) return el;
            }
            return document.activeElement !== document.body ? document.activeElement : null;
          }
          let el = null;
          if (/^\d+$/.test(target) && window.__ob_spatial_map && window.__ob_spatial_map[target]) {
            el = window.__ob_spatial_map[target];
          } else {
            el = findInput(target);
          }
          if (!el) return { ok: false, error: 'Input not found: ' + target };
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
          await new Promise(r => setTimeout(r, 60));
          const setter = Object.getOwnPropertyDescriptor(
            el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype, 'value'
          )?.set;
          if (setter && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) setter.call(el, text);
          else if (el.contentEditable === 'true') el.textContent = text;
          else el.value = text;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          if (submit) {
            el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
            el.form?.requestSubmit?.();
          }
          return { ok: true, typed: text };
        }, [input.target, input.text, !!input.submit]);
        return r || { ok: false, result: 'Type failed.' };
      }

      case 'scroll': {
        const tab = await activeTab();
        await injectAndRun(tab.id, (dir, amt) => {
          const a = amt || 400;
          ({
            down: () => window.scrollBy({ top: a, behavior: 'smooth' }),
            up: () => window.scrollBy({ top: -a, behavior: 'smooth' }),
            top: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
            bottom: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
          })[dir]?.();
        }, [input.direction, input.amount]);
        await wait(500);
        return { ok: true, result: `Scrolled ${input.direction}` };
      }

      case 'run_javascript': {
        const tab = await activeTab();
        // Use ISOLATED world so extension CSP (which allows eval) applies,
        // not the page's own strict CSP. Indirect eval (0, eval) runs in global scope.
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          world: 'ISOLATED',
          func: (codeStr) => {
            try {
              // eslint-disable-next-line no-eval
              const val = (0, eval)(codeStr);
              return { ok: true, result: val !== undefined ? JSON.stringify(val, null, 2) : 'undefined' };
            } catch (e) {
              return { ok: false, error: e.message };
            }
          },
          args: [input.code]
        }).catch(e => [{ result: { ok: false, error: e.message } }]);
        const r = results?.[0]?.result;
        return r || { ok: false, result: 'Script execution failed.' };
      }

      case 'open_tab': {
        let url = input.url;
        if (!url.match(/^https?:\/\//)) url = 'https://' + url;
        const tab = await chrome.tabs.create({ url, active: true });
        await wait(1800);
        return { ok: true, result: `Opened tab ${tab.id}: ${url}` };
      }

      case 'switch_tab': {
        const switchId = Number(input.tabId);
        if (!switchId) return { ok: false, result: 'Invalid tabId. Use list_tabs first.' };
        await chrome.tabs.update(switchId, { active: true });
        return { ok: true, result: `Switched to tab ${switchId}` };
      }

      case 'list_tabs': {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        const groups = await chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }).catch(() => []);
        const groupMap = Object.fromEntries(groups.map(g => [g.id, g]));
        
        return { ok: true, result: tabs.map(t => {
          let str = `[${t.id}] ${t.title} — ${t.url}`;
          if (t.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE && groupMap[t.groupId]) {
            const g = groupMap[t.groupId];
            str += ` (Group: ${g.title || 'Untitled'}, Color: ${g.color})`;
          }
          return str;
        }).join('\n') };
      }

      case 'group_tabs': {
        if (!input.tabIds || !input.tabIds.length) return { ok: false, result: 'No tabIds provided.' };
        try {
          const groupId = await chrome.tabs.group({ tabIds: input.tabIds.map(Number) });
          const updateOpts = {};
          if (input.title) updateOpts.title = input.title;
          if (input.color) updateOpts.color = input.color;
          if (Object.keys(updateOpts).length > 0) {
            await chrome.tabGroups.update(groupId, updateOpts);
          }
          return { ok: true, result: `Successfully grouped ${input.tabIds.length} tabs into group "${input.title || 'Untitled'}".` };
        } catch (e) {
          return { ok: false, result: 'Failed to group tabs: ' + e.message };
        }
      }

      case 'close_tabs': {
        if (!input.tabIds || !input.tabIds.length) return { ok: false, result: 'No tabIds provided.' };
        try {
          await chrome.tabs.remove(input.tabIds.map(Number));
          return { ok: true, result: `Successfully closed ${input.tabIds.length} tabs.` };
        } catch (e) {
          return { ok: false, result: 'Failed to close tabs: ' + e.message };
        }
      }

      case 'wait': {
        const ms = Math.min(Math.max(input.ms || 1000, 100), 10000);
        await wait(ms);
        return { ok: true, result: `Waited ${ms}ms` };
      }

      case 'extract_data': {
        const tab = await activeTab();
        const r = await injectAndRun(tab.id, (sel) => {
          const root = sel ? (document.querySelector(sel) || document.body) : document.body;
          const data = [];
          root.querySelectorAll('table').forEach(tbl => {
            const rows = [...tbl.querySelectorAll('tr')].map(r =>
              [...r.querySelectorAll('th,td')].map(c => c.innerText?.trim())
            );
            if (rows.length) data.push({ type: 'table', rows });
          });
          if (!data.length) {
            const items = [...root.querySelectorAll('li,[role=listitem]')]
              .map(e => e.innerText?.trim()).filter(Boolean);
            if (items.length) data.push({ type: 'list', items });
          }
          return { ok: true, data };
        }, [input.selector || null]);
        return r ? { ok: true, result: JSON.stringify(r.data, null, 2) } : { ok: false, result: 'Extraction failed.' };
      }

      case 'select_option': {
        const tab = await activeTab();
        const r = await injectAndRun(tab.id, (target, value) => {
          let el = null;
          try { el = document.querySelector(target); } catch { }
          if (!el) {
            const q = target.toLowerCase();
            for (const s of document.querySelectorAll('select')) {
              const t = ((s.getAttribute('aria-label') || '') + (document.querySelector(`label[for="${s.id}"]`)?.textContent || '')).toLowerCase();
              if (t.includes(q)) { el = s; break; }
            }
          }
          if (!el) return { ok: false, error: `Select not found: ${target}` };
          el.value = value;
          el.dispatchEvent(new Event('change', { bubbles: true }));
          return { ok: true };
        }, [input.target, input.value]);
        return r || { ok: false, result: 'Select failed.' };
      }

      case 'download_csv': {
        const csv = csvFromJSON(input.data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = Object.assign(document.createElement('a'), {
          href: URL.createObjectURL(blob),
          download: `${input.filename || 'export'}.csv`
        });
        a.click(); URL.revokeObjectURL(a.href);
        let count = 0;
        try { count = JSON.parse(input.data).length; } catch { }
        return { ok: true, result: `Downloaded ${input.filename || 'export'}.csv (${count} rows)` };
      }

      // ── REASON: deep chain-of-thought ─────────────────────────────
      case 'reason': {
        const summary = `Problem: ${input.problem}\n\nReasoning:\n${input.thoughts}\n\nPlan:\n${input.plan}`;
        return { ok: true, result: summary };
      }

      // ── RECALL: look up persistent memory ──────────────────────────
      case 'recall': {
        const val = state.memory[input.key];
        if (val !== undefined) return { ok: true, result: `${input.key}: ${val}` };
        // Search for partial key match
        const matches = Object.entries(state.memory)
          .filter(([k]) => k.toLowerCase().includes(input.key.toLowerCase()))
          .map(([k, v]) => `${k}: ${v}`);
        return matches.length
          ? { ok: true, result: matches.join('\n') }
          : { ok: false, result: `Nothing found for key "${input.key}". Known keys: ${Object.keys(state.memory).join(', ') || 'none'}` };
      }

      // ── SCRAPE_PAGE: deep structured extraction ─────────────────────
      case 'scrape_page': {
        const tab = await activeTab();
        const r = await injectAndRun(tab.id, (sel, doLinks, doTables) => {
          const root = sel ? (document.querySelector(sel) || document.body) : document.body;

          // Text
          const clone = root.cloneNode(true);
          clone.querySelectorAll('script,style,noscript,nav,footer,header').forEach(e => e.remove());
          const text = (clone.innerText || '').replace(/\s{3,}/g, '\n\n').trim().substring(0, 20000);

          // Headings
          const headings = [...root.querySelectorAll('h1,h2,h3,h4')].map(h => ({
            level: h.tagName, text: h.innerText?.trim()
          })).filter(h => h.text).slice(0, 60);

          // Links
          const links = doLinks !== false
            ? [...root.querySelectorAll('a[href]')]
              .map(a => ({ text: a.innerText?.trim().substring(0, 80), href: a.href }))
              .filter(l => l.text && l.href && !l.href.startsWith('javascript'))
              .slice(0, 100)
            : [];

          // Tables
          const tables = doTables !== false
            ? [...root.querySelectorAll('table')].map(tbl => ({
              headers: [...(tbl.querySelector('thead tr') || tbl.querySelector('tr'))
                ?.querySelectorAll('th,td') || []].map(c => c.innerText?.trim()),
              rows: [...tbl.querySelectorAll('tr')].slice(1, 51).map(r =>
                [...r.querySelectorAll('td')].map(c => c.innerText?.trim()))
            }))
            : [];

          // Meta
          const meta = {
            title: document.title,
            url: location.href,
            description: document.querySelector('meta[name=description]')?.content || '',
            ogTitle: document.querySelector('meta[property="og:title"]')?.content || '',
          };

          return { ok: true, meta, text, headings, links, tables };
        }, [input.selector || null, input.include_links !== false, input.include_tables !== false]);

        if (!r) return { ok: false, result: 'Scrape failed.' };
        const out = [
          `## ${r.meta.title}`,
          `URL: ${r.meta.url}`,
          r.meta.description ? `Description: ${r.meta.description}` : '',
          '',
          '### Text Content',
          r.text,
          r.headings.length ? '\n### Headings\n' + r.headings.map(h => `${h.level}: ${h.text}`).join('\n') : '',
          r.links.length ? '\n### Links (' + r.links.length + ')\n' + r.links.map(l => `- [${l.text}](${l.href})`).join('\n') : '',
          r.tables.length ? '\n### Tables (' + r.tables.length + ')\n' + JSON.stringify(r.tables, null, 2).substring(0, 3000) : ''
        ].filter(Boolean).join('\n');
        return { ok: true, result: out };
      }

      // ── SCAN_FORMS: discover all form fields ───────────────────────
      case 'scan_forms': {
        const tab = await activeTab();
        const r = await injectAndRun(tab.id, () => {
          const fields = [];
          const inputs = document.querySelectorAll('input:not([type=hidden]),textarea,select,button[type=submit]');
          inputs.forEach((el, i) => {
            // Get associated label text
            let labelText = '';
            if (el.id) {
              const lbl = document.querySelector(`label[for="${el.id}"]`);
              if (lbl) labelText = lbl.innerText.trim();
            }
            if (!labelText) {
              const parent = el.closest('label');
              if (parent) labelText = parent.innerText.replace(el.value || '', '').trim();
            }
            if (!labelText) {
              // Check preceding sibling text or parent legend
              const legend = el.closest('fieldset')?.querySelector('legend');
              if (legend) labelText = legend.innerText.trim();
            }
            const opts = el.tagName === 'SELECT'
              ? [...el.options].map(o => o.text).join(', ')
              : '';
            fields.push({
              index: i, tag: el.tagName.toLowerCase(),
              type: el.type || 'text', name: el.name || '', id: el.id || '',
              placeholder: el.placeholder || '', label: labelText,
              ariaLabel: el.getAttribute('aria-label') || '',
              value: el.value || '', options: opts,
              required: el.required
            });
          });
          return fields;
        });
        if (!r) return { ok: false, result: 'Could not scan page forms.' };
        const summary = r.map(f =>
          `[${f.index}] ${f.tag}[${f.type}]` +
          (f.label ? ` label:"${f.label}"` : '') +
          (f.name ? ` name="${f.name}"` : '') +
          (f.placeholder ? ` placeholder="${f.placeholder}"` : '') +
          (f.ariaLabel ? ` aria-label="${f.ariaLabel}"` : '') +
          (f.options ? ` options:[${f.options}]` : '') +
          (f.required ? ' *required' : '')
        ).join('\n');
        return { ok: true, result: `Found ${r.length} form fields:\n\n${summary}` };
      }

      // ── SMART_FILL_FORM: semantic field matching + fill ──────────────
      case 'smart_fill_form': {
        const tab = await activeTab();
        let fieldsMap;
        try { fieldsMap = JSON.parse(input.fields); } catch {
          return { ok: false, result: 'fields must be valid JSON, e.g. {"first name":"John","email":"test@test.com"}' };
        }

        const r = await injectAndRun(tab.id, (fieldsJson, doSubmit) => {
          const fields = JSON.parse(fieldsJson);
          const results = [];

          // Score a form element against a semantic key
          function score(el, key) {
            const k = key.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();
            const tokens = k.split(/\s+/);
            let s = 0;

            // Sources to check, in priority order
            const sources = [];
            if (el.id) sources.push({ text: el.id.toLowerCase().replace(/[-_]/g, ' '), weight: 9 });
            if (el.name) sources.push({ text: el.name.toLowerCase().replace(/[-_]/g, ' '), weight: 8 });

            // Label text
            let lbl = '';
            if (el.id) {
              const l = document.querySelector(`label[for="${el.id}"]`);
              if (l) lbl = l.innerText.trim().toLowerCase();
            }
            if (!lbl) {
              const p = el.closest('label');
              if (p) lbl = p.innerText.toLowerCase();
            }
            if (lbl) sources.push({ text: lbl, weight: 10 });

            if (el.placeholder) sources.push({ text: el.placeholder.toLowerCase(), weight: 7 });
            if (el.getAttribute('aria-label')) sources.push({ text: el.getAttribute('aria-label').toLowerCase(), weight: 9 });
            if (el.getAttribute('aria-placeholder')) sources.push({ text: el.getAttribute('aria-placeholder').toLowerCase(), weight: 7 });

            sources.forEach(({ text, weight }) => {
              if (text === k) { s += weight * 10; return; }
              const overlap = tokens.filter(t => text.includes(t)).length;
              s += overlap * weight;
            });

            // Semantic synonym map
            const synonyms = {
              'first name': ['given name', 'prénom', 'firstname', 'fname', 'forename'],
              'last name': ['family name', 'surname', 'lastname', 'lname', 'nom'],
              'email': ['e-mail', 'email address', 'courriel'],
              'phone': ['telephone', 'tel', 'mobile', 'cell', 'phone number'],
              'address': ['street', 'street address', 'address line 1', 'addr'],
              'city': ['town', 'ville', 'municipality'],
              'state': ['province', 'region', 'département'],
              'zip': ['postal code', 'postcode', 'zip code', 'code postal'],
              'country': ['pays', 'nation'],
              'password': ['pass', 'pwd', 'mot de passe'],
              'username': ['user', 'login', 'handle'],
              'birthday': ['date of birth', 'dob', 'birth date'],
              'company': ['organization', 'organisation', 'employer', 'business'],
            };
            for (const [canonical, alts] of Object.entries(synonyms)) {
              const allForms = [canonical, ...alts];
              const keyMatchesAny = allForms.some(f => k.includes(f) || f.includes(k));
              if (!keyMatchesAny) continue;
              const srcMatchesAny = sources.some(({ text }) => allForms.some(f => text.includes(f)));
              if (srcMatchesAny) s += 50;
            }
            return s;
          }

          // Fill a single element
          function fillEl(el, value) {
            if (el.tagName === 'SELECT') {
              const v = value.toLowerCase();
              let best = null, bestScore = -1;
              for (const opt of el.options) {
                const t = opt.text.toLowerCase(), ov = opt.value.toLowerCase();
                const sc = (t === v || ov === v) ? 100 : (t.includes(v) || v.includes(t)) ? 50 : 0;
                if (sc > bestScore) { bestScore = sc; best = opt; }
              }
              if (best) { best.selected = true; el.dispatchEvent(new Event('change', { bubbles: true })); return true; }
              return false;
            }
            if (el.type === 'checkbox' || el.type === 'radio') {
              const v = value.toLowerCase();
              el.checked = ['true', 'yes', '1', 'on', 'checked'].includes(v);
              el.dispatchEvent(new Event('change', { bubbles: true }));
              return true;
            }
            // For React/Vue inputs, trigger native input setter
            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
              || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
            if (nativeSetter) {
              nativeSetter.call(el, value);
            } else {
              el.value = value;
            }
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
          }

          const allInputs = [...document.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]),textarea,select')];

          for (const [key, value] of Object.entries(fields)) {
            let bestEl = null, bestScore = -1;
            for (const el of allInputs) {
              const s = score(el, key);
              if (s > bestScore) { bestScore = s; bestEl = el; }
            }
            if (bestEl && bestScore > 0) {
              const ok = fillEl(bestEl, String(value));
              results.push({ field: key, matched: bestEl.name || bestEl.id || bestEl.placeholder || bestEl.type, score: bestScore, filled: ok });
            } else {
              results.push({ field: key, matched: null, score: 0, filled: false });
            }
          }

          // Submit if requested
          if (doSubmit) {
            const form = allInputs[0]?.closest('form');
            const submitBtn = form?.querySelector('[type=submit]') || document.querySelector('[type=submit]');
            if (submitBtn) submitBtn.click();
            else if (form) form.submit();
          }

          return results;
        }, [input.fields, input.submit === true]);

        if (!r) return { ok: false, result: 'Form fill failed.' };
        const filled = r.filter(x => x.filled).length;
        const summary = r.map(x =>
          x.filled
            ? `✓ "${x.field}" → ${x.matched} (score ${x.score})`
            : `✗ "${x.field}" — no match found`
        ).join('\n');
        return { ok: true, result: `Filled ${filled}/${r.length} fields:\n${summary}` };
      }

      // ── CREATE_TASK_PLAN: display visual checklist in chat ───────────
      case 'create_task_plan': {
        let steps;
        try { steps = JSON.parse(input.steps); } catch {
          return { ok: false, result: 'steps must be a JSON array of strings' };
        }
        // Store the plan in state so update_task_step can modify it
        state.taskPlan = { title: input.title, steps: steps.map(s => ({ text: s, status: 'pending', note: '' })) };
        renderTaskPlan();
        return { ok: true, result: `Task plan created with ${steps.length} steps. Proceed with step 0: "${steps[0]}"` };
      }

      // ── UPDATE_TASK_STEP: tick off steps in the plan ─────────────────
      case 'update_task_step': {
        if (!state.taskPlan) return { ok: false, result: 'No active task plan. Use create_task_plan first.' };
        const idx = Number(input.step_index);
        if (idx < 0 || idx >= state.taskPlan.steps.length) return { ok: false, result: `Step index ${idx} out of range.` };
        state.taskPlan.steps[idx].status = input.status || 'done';
        state.taskPlan.steps[idx].note = input.note || '';
        renderTaskPlan();
        const remaining = state.taskPlan.steps.filter(s => s.status === 'pending').length;
        return { ok: true, result: `Step ${idx} marked ${input.status}. ${remaining} steps remaining.` };
      }

      // ── EXPORT_DATA: render table + download CSV/JSON ────────────────
      case 'export_data': {
        let rows;
        try { rows = JSON.parse(input.data); } catch {
          return { ok: false, result: 'data must be a JSON array of objects.' };
        }
        if (!Array.isArray(rows) || !rows.length) return { ok: false, result: 'No data to export.' };
        const fmt = (input.format || 'csv').toLowerCase();
        const name = (input.filename || 'export').replace(/[^a-z0-9_-]/gi, '_');

        // Render table in chat
        renderDataTable(rows, name);

        // Trigger download
        let blob, mime, ext;
        if (fmt === 'json') {
          blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
          mime = 'application/json'; ext = '.json';
        } else {
          blob = new Blob([csvFromJSON(JSON.stringify(rows))], { type: 'text/csv' });
          mime = 'text/csv'; ext = '.csv';
        }
        const a = Object.assign(document.createElement('a'), {
          href: URL.createObjectURL(blob),
          download: name + ext
        });
        a.click(); URL.revokeObjectURL(a.href);
        return { ok: true, result: `Exported ${rows.length} rows as "${name}${ext}" and displayed table in chat.` };
      }

      // ── SUMMARIZE_TABS ───────────────────────────────────────────
      case 'summarize_tabs': {
        const allTabs = await chrome.tabs.query({ currentWindow: true });
        let targetTabs = allTabs.filter(t =>
          t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://') && !t.url.startsWith('about:')
        );
        // Filter to specific IDs if provided
        if (input.tab_ids) {
          try {
            const ids = JSON.parse(input.tab_ids).map(Number);
            targetTabs = targetTabs.filter(t => ids.includes(t.id));
          } catch { /* use all */ }
        }
        if (!targetTabs.length) return { ok: false, result: 'No valid tabs to summarize.' };

        const focus = input.focus ? `Focus on: "${input.focus}".` : '';
        const summaries = [];

        for (const tab of targetTabs.slice(0, 8)) { // cap at 8 tabs
          try {
            const r = await injectAndRun(tab.id, (focusTopic) => {
              const clone = document.body.cloneNode(true);
              clone.querySelectorAll('script,style,nav,footer,header,aside,[role=navigation],[role=banner]').forEach(e => e.remove());
              const text = (clone.innerText || '').replace(/\s{3,}/g, '\n\n').trim().substring(0, 3000);
              const h1 = document.querySelector('h1')?.innerText?.trim() || '';
              const meta = document.querySelector('meta[name=description]')?.content || '';
              return { text, h1, meta, title: document.title, url: location.href };
            }, [input.focus || '']);

            if (r) summaries.push({
              tabId: tab.id, title: r.title, url: r.url,
              h1: r.h1, meta: r.meta, snippet: r.text,
              focus
            });
          } catch { summaries.push({ tabId: tab.id, title: tab.title, url: tab.url, error: 'Could not access tab' }); }
        }

        // Build a compact digest
        const digest = summaries.map((s, i) => {
          if (s.error) return `**Tab ${i + 1}: ${s.title}**\n_${s.error}_`;
          return `**Tab ${i + 1}: ${s.h1 || s.title}**\n${s.url}\n${s.meta || s.snippet.substring(0, 200)}`;
        }).join('\n\n---\n\n');

        renderTabSummary(summaries);
        return {
          ok: true,
          result: `Scraped ${summaries.length} tabs. Here is the raw content for your analysis:\n\n` +
            summaries.filter(s => !s.error).map(s =>
              `=== [Tab ${s.tabId}] ${s.title} ===\nURL: ${s.url}\n${s.snippet}`
            ).join('\n\n')
        };
      }

      // ── CROSS_SITE_RESEARCH ──────────────────────────────────────
      case 'cross_site_research': {
        let tabIds, attributes;
        try { tabIds = JSON.parse(input.tab_ids).map(Number); } catch {
          return { ok: false, result: 'tab_ids must be a JSON array, e.g. [123, 456]. Use list_tabs first.' };
        }
        try { attributes = JSON.parse(input.attributes); } catch { attributes = []; }

        const rows = [];
        for (const tabId of tabIds.slice(0, 6)) {
          const [tabInfo] = await chrome.tabs.query({ currentWindow: true }).then(ts => ts.filter(t => t.id === tabId));
          try {
            const r = await injectAndRun(tabId, (attrs) => {
              const clone = document.body.cloneNode(true);
              clone.querySelectorAll('script,style').forEach(e => e.remove());
              return {
                title: document.title, url: location.href,
                text: (clone.innerText || '').replace(/\s{3,}/g, '\n').trim().substring(0, 4000)
              };
            }, [attributes]);
            if (r) rows.push({ tabId, title: r.title, url: r.url, content: r.text });
          } catch { rows.push({ tabId, title: tabInfo?.title || `Tab ${tabId}`, url: tabInfo?.url || '', content: 'Could not access tab content.' }); }
        }

        // Render comparison scaffold in chat — AI will fill it in
        renderComparisonTable(rows, attributes, input.question);

        return {
          ok: true,
          result: `Collected content from ${rows.length} tabs. Here is the raw data:\n\n` +
            rows.map(r => `=== ${r.title} ===\nURL: ${r.url}\n${r.content}`).join('\n\n---\n\n') +
            `\n\nQuestion to answer: ${input.question || 'Compare these pages.'}\nAttributes to compare: ${attributes.join(', ')}`
        };
      }

      // ── AUTO_HIGHLIGHT ────────────────────────────────────────────
      case 'auto_highlight': {
        const tab = await activeTab();
        const maxH = Math.min(Number(input.max_highlights) || 8, 25);
        const goal = input.goal || '';

        const r = await injectAndRun(tab.id, (goalText, maxCount) => {
          // Remove previous highlights
          document.querySelectorAll('.ob-highlight').forEach(el => {
            const parent = el.parentNode;
            parent.replaceChild(document.createTextNode(el.textContent), el);
            parent.normalize();
          });

          if (!goalText) return { count: 0 };

          // Score all text nodes by relevance to goal keywords
          const keywords = goalText.toLowerCase().split(/\s+/).filter(w => w.length > 3);
          if (!keywords.length) return { count: 0 };

          const walker = document.createTreeWalker(
            document.body, NodeFilter.SHOW_TEXT,
            {
              acceptNode: n => {
                const p = n.parentNode;
                if (!p) return NodeFilter.FILTER_REJECT;
                const tag = p.tagName?.toLowerCase();
                if (['script', 'style', 'noscript', 'code', 'pre'].includes(tag)) return NodeFilter.FILTER_REJECT;
                const text = n.nodeValue?.trim() || '';
                return text.length > 20 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
              }
            }
          );

          const candidates = [];
          let node;
          while ((node = walker.nextNode())) {
            const text = node.nodeValue.toLowerCase();
            const score = keywords.reduce((s, kw) => {
              const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
              return s + (text.match(re)?.length || 0);
            }, 0);
            if (score > 0) candidates.push({ node, score, text: node.nodeValue.trim() });
          }

          candidates.sort((a, b) => b.score - a.score);
          let count = 0;

          for (const { node } of candidates.slice(0, maxCount)) {
            const span = document.createElement('mark');
            span.className = 'ob-highlight';
            span.style.cssText = 'background:rgba(0,255,136,0.28);color:inherit;border-radius:2px;padding:0 1px;outline:1px solid rgba(0,255,136,0.5);';
            const range = document.createRange();
            range.selectNode(node);
            try {
              range.surroundContents(span);
              count++;
            } catch { /* skip nodes that span elements */ }
          }

          // Scroll to first highlight
          const first = document.querySelector('.ob-highlight');
          if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });

          return { count, keywords };
        }, [goal, maxH]);

        if (!r) return { ok: false, result: 'Could not apply highlights.' };
        return {
          ok: true, result: r.count > 0
            ? `Highlighted ${r.count} relevant passages for "${goal}". Keywords matched: ${r.keywords?.join(', ')}.`
            : `No strong matches for "${goal}" found on this page.`
        };
      }

      // ── REMOVE_HIGHLIGHTS ─────────────────────────────────────────
      case 'remove_highlights': {
        const tab = await activeTab();
        await injectAndRun(tab.id, () => {
          document.querySelectorAll('.ob-highlight').forEach(el => {
            const parent = el.parentNode;
            parent.replaceChild(document.createTextNode(el.textContent), el);
            parent.normalize();
          });
        });
        return { ok: true, result: 'All highlights removed.' };
      }

      // ── ADD_CITATION ──────────────────────────────────────────────
      case 'add_citation': {
        let url = input.url?.trim();
        let meta = {};

        if (!url) {
          // Use active tab
          const tab = await activeTab();
          url = tab.url;
          const r = await injectAndRun(tab.id, () => {
            const get = (sel) => document.querySelector(sel)?.content?.trim() || '';
            const getT = (sel) => document.querySelector(sel)?.innerText?.trim() || '';
            return {
              title: document.title,
              author: get('meta[name=author]') || get('meta[property="article:author"]') || getT('[rel=author]') || getT('.author') || '',
              date: get('meta[property="article:published_time"]') || get('meta[name=date]') || getT('time[datetime]') || new Date().toISOString().slice(0, 10),
              site: location.hostname.replace(/^www\./, ''),
              desc: get('meta[name=description]') || get('meta[property="og:description"]') || ''
            };
          });
          if (r) meta = r;
        } else {
          meta = { title: url, author: '', date: new Date().toISOString().slice(0, 10), site: new URL(url).hostname.replace(/^www\./, ''), desc: '' };
        }

        const fmt = input.format || 'url';
        const year = meta.date?.substring(0, 4) || new Date().getFullYear();
        let formatted = '';
        if (fmt === 'apa') {
          formatted = `${meta.author || 'Unknown'}. (${year}). *${meta.title}*. ${meta.site}. ${url}`;
        } else if (fmt === 'mla') {
          formatted = `"${meta.title}." *${meta.site}*, ${meta.date || year}, ${url}.`;
        } else if (fmt === 'chicago') {
          formatted = `${meta.author || 'Unknown'}. "${meta.title}." ${meta.site}. ${meta.date || year}. ${url}.`;
        } else {
          formatted = url;
        }

        const citation = {
          id: 'c_' + Date.now(),
          url, title: meta.title || url,
          author: meta.author, date: meta.date, site: meta.site,
          note: input.note || '', format: fmt, formatted,
          addedAt: Date.now()
        };
        state.citations.push(citation);
        updateCitationBadge();

        return { ok: true, result: `Citation saved (${state.citations.length} total):\n${formatted}${input.note ? '\nNote: ' + input.note : ''}` };
      }

      // ── SHOW_CITATIONS ────────────────────────────────────────────
      case 'show_citations': {
        if (!state.citations.length) return { ok: false, result: 'No citations saved yet. Use add_citation while browsing.' };
        renderCitationPanel();

        if (input.export_format) {
          const efmt = input.export_format.toLowerCase();
          let content = '';
          if (efmt === 'bib') {
            content = state.citations.map((c, i) => {
              const key = `ref${i + 1}`;
              return `@misc{${key},\n  author={${c.author || 'Unknown'}},\n  title={${c.title}},\n  year={${c.date?.substring(0, 4) || ''}},\n  url={${c.url}}\n}`;
            }).join('\n\n');
          } else if (efmt === 'md') {
            content = state.citations.map((c, i) =>
              `${i + 1}. [${c.title}](${c.url})${c.author ? ' — ' + c.author : ''}${c.date ? ', ' + c.date.substring(0, 10) : ''}${c.note ? '\n   > ' + c.note : ''}`
            ).join('\n');
          } else {
            content = state.citations.map((c, i) => `[${i + 1}] ${c.formatted}`).join('\n');
          }
          const blob = new Blob([content], { type: 'text/plain' });
          const a = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(blob),
            download: `citations.${efmt === 'bib' ? 'bib' : efmt === 'md' ? 'md' : 'txt'}`
          });
          a.click(); URL.revokeObjectURL(a.href);
        }

        return { ok: true, result: `Showing ${state.citations.length} citations.` };
      }

      // ── CLEAR_CITATIONS ───────────────────────────────────────────
      case 'clear_citations': {
        state.citations = [];
        updateCitationBadge();
        toast('Citations cleared');
        return { ok: true, result: 'All citations cleared.' };
      }

      // ── VFS TOOLS ────────────────────────────────────────────────
      case 'write_file': {
        const path = (input.path || '').trim().replace(/^\/+/, '');
        const content = input.content || '';
        if (!path) return { ok: false, result: 'path is required' };
        await VFS.write(path, content);
        renderFileTree();  // Refresh the Files tab if it's open
        return { ok: true, result: `File written: "${path}" (${new Blob([content]).size} bytes)` };
      }
      case 'read_file': {
        const path = (input.path || '').trim().replace(/^\/+/, '');
        const f = await VFS.read(path);
        if (!f) return { ok: false, result: `File not found: "${path}". Use list_files to see available files.` };
        return { ok: true, result: `=== ${f.path} ===\n${f.content}` };
      }
      case 'list_files': {
        const files = await VFS.list();
        const prefix = input.dir?.replace(/^\/+/, '') || '';
        const filtered = prefix ? files.filter(f => f.path.startsWith(prefix)) : files;
        if (!filtered.length) return { ok: true, result: prefix ? `No files in "${prefix}"` : 'Virtual filesystem is empty.' };
        return {
          ok: true, result: filtered.map(f =>
            `${f.path} (${new Blob([f.content || '']).size}B, updated ${new Date(f.updatedAt).toLocaleTimeString()})`
          ).join('\n')
        };
      }
      case 'delete_file': {
        const path = (input.path || '').trim().replace(/^\/+/, '');
        const f = await VFS.read(path);
        if (!f) return { ok: false, result: `File not found: "${path}"` };
        await VFS.delete(path);
        renderFileTree();
        return { ok: true, result: `Deleted "${path}"` };
      }

      // ── RAG TOOLS ────────────────────────────────────────────────
      case 'index_current_page': {
        const tab = await activeTab();
        const r = await injectAndRun(tab.id, () => {
          const body = (document.body?.innerText || '').replace(/\s+/g, ' ').trim();
          return { text: body, title: document.title, url: location.href };
        });
        if (!r || !r.text) return { ok: false, result: 'Could not read page content.' };
        
        // Improved chunking: Overlapping windows for better semantic retrieval
        const chunks = [];
        const chunkSize = 800;
        const overlap = 200;
        let isTruncated = false;
        for (let i = 0; i < r.text.length; i += (chunkSize - overlap)) {
          if (chunks.length >= 25) { isTruncated = true; break; }
          chunks.push(r.text.substring(i, i + chunkSize));
        }

        toast(`Indexing ${chunks.length} segments...`);
        
        let completed = 0;
        try {
          for (const chunk of chunks) {
            try {
              const vector = await RAG.getEmbedding(chunk);
              await RAG.saveChunk(r.url, r.title, chunk, vector);
              completed++;
              if (completed % 5 === 0) setStatus('loading', `Indexing... (${completed}/${chunks.length})`);
            } catch (e) {
              console.error('[RAG] Chunk failed:', e.message);
            }
          }
        } finally {
          setStatus('idle', 'Ready');
        }

        const summary = `Successfully indexed "${r.title}" into local memory.
- Segments: ${completed}/${chunks.length}${isTruncated ? ' (Truncated: Page is very long)' : ''}
- Total length: ~${Math.round(r.text.length / 4)} tokens
- URL: ${r.url}

${isTruncated ? '> [!NOTE]\n> Only the first ~20k characters were indexed due to local performance limits.' : ''}
You can now ask questions about this page using semantic search.`;
        return { ok: true, result: summary };
      }

      case 'semantic_search_memory': {
        if (!input.query) return { ok: false, result: 'query is required' };
        const limit = parseInt(input.limit) || 3;
        toast('Searching memory...');
        setStatus('loading', 'Searching...');
        try {
          const queryVector = await RAG.getEmbedding(input.query);
          const results = await RAG.search(queryVector, limit);
          if (!results.length) return { ok: true, result: 'No relevant memories found.' };

          const formatted = results.map((r, i) => 
            `**Result ${i+1}** (Score: ${r.score.toFixed(3)})\nSource: [${r.title}](${r.url})\n"${r.text.substring(0, 300)}..."`
          ).join('\n\n---\n\n');
          return { ok: true, result: `Found ${results.length} relevant results:\n\n${formatted}` };
        } finally {
          setStatus('idle', 'Ready');
        }
      }

      default: return { ok: false, result: `Unknown tool: ${name}` };
    }
  } catch (e) {
    return { ok: false, result: `Error in ${name}: ${e.message}` };
  }
}

// ── SYSTEM PROMPT ──────────────────────────────────────────────────
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

  return 'You are OpenBrowser v3.3, an expert AI browser automation agent.\nGitHub: https://github.com/Prof-MAN9/OpenBrowser' + backupNote + '\n\nCurrent page: ' + (page && page.url || 'none') + ' — "' + (page && page.title || '') + '"' + mem + custom + autoNote + reasoning + '\n\n## Core rules\n- Prefer visible text when clicking, not CSS selectors\n- Fill all form fields before submitting\n- If one approach fails, try an alternative\n- Always call finish when done\n- You control a REAL browser — actions have real effects';
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

  let page = null;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) page = { url: tab.url, title: tab.title };
  } catch { }

  const sys = buildSys(page);
  const messages = [...conv.messages];
  const maxSteps = parseInt(state.settings.maxSteps) || 20;
  let steps = 0;
  let done = false;

  try {
    while (steps < maxSteps && !state.abort.signal.aborted && !done) {
      steps++;
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
const el = id => document.getElementById(id);
let stepN = 0;

function msgs() { return el('chat-messages'); }

function showTyping() {
  const id = 'ty-' + uid();
  const d = document.createElement('div');
  d.id = id; d.className = 'typing-indicator';
  d.innerHTML = '<div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div><span>Thinking…</span>';
  msgs().appendChild(d); scrollEnd(); return id;
}

function removeEl(id) { el(id)?.remove(); }

// ── TAB SUMMARY RENDERER ─────────────────────────────────────────────────
function renderTabSummary(tabs) {
  const d = document.createElement('div');
  d.className = 'msg tab-summary-msg';
  d.innerHTML = `
    <div class="tab-summary-header">📑 Tab Summary — ${tabs.length} tab${tabs.length !== 1 ? 's' : ''}</div>
    <div class="tab-summary-list">
      ${tabs.map(t => `
        <div class="tab-summary-item">
          <img class="tab-favicon" src="https://www.google.com/s2/favicons?sz=16&domain=${encodeURIComponent(t.url || '')}" width="14" height="14" onerror="this.style.display='none'" />
          <div class="tab-summary-info">
            <div class="tab-summary-title">${esc(t.title || 'Untitled')}</div>
            <div class="tab-summary-url">${esc((t.url || '').substring(0, 55))}${(t.url || '').length > 55 ? '…' : ''}</div>
          </div>
          <span class="tab-id-badge">#${t.tabId}</span>
        </div>`).join('')}
    </div>`;
  msgs().appendChild(d);
  d.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// ── COMPARISON TABLE RENDERER ─────────────────────────────────────────────
function renderComparisonTable(rows, attributes, question) {
  const d = document.createElement('div');
  d.className = 'msg data-table-msg';
  const cols = attributes?.length ? attributes : ['Content'];
  const header = ['Source', ...cols].map(k => `<th>${esc(k)}</th>`).join('');
  const bodyRows = rows.map(r =>
    `<tr><td><a class="compare-link" href="${esc(r.url)}" target="_blank" title="${esc(r.url)}">${esc((r.title || r.url || '').substring(0, 32))}…</a></td>${cols.map(() => '<td class="compare-empty">—</td>').join('')}</tr>`
  ).join('');
  d.innerHTML = `
    <div class="data-table-header">🔀 Cross-site Research — ${rows.length} tabs
      ${question ? `<div class="compare-q">${esc(question)}</div>` : ''}
    </div>
    <div class="data-table-wrap">
      <table class="data-table"><thead><tr>${header}</tr></thead><tbody>${bodyRows}</tbody></table>
    </div>
    <div class="table-more">AI analysis follows ↓</div>`;
  msgs().appendChild(d);
  d.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// ── CITATION PANEL RENDERER ───────────────────────────────────────────────
function renderCitationPanel() {
  const d = document.createElement('div');
  d.className = 'msg citation-panel';
  d.innerHTML = `
    <div class="citation-header">
      <span>📚 Citations (${state.citations.length})</span>
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
          ${c.author ? `<div class="citation-meta">${esc(c.author)}${c.date ? ' · ' + c.date.substring(0, 10) : ''}</div>` : ''}
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

// ── BOOKMARK RENDERERS ───────────────────────────────────────────────────
function renderBookmarkSaved({ url, title, summary, tags }) {
  const d = document.createElement('div');
  d.className = 'msg bookmark-saved-msg';
  d.innerHTML = `
    <div class="bookmark-saved-icon">🔖</div>
    <div class="bookmark-saved-body">
      <div class="bookmark-saved-title"><a href="${esc(url)}" target="_blank">${esc(title)}</a></div>
      ${summary ? `<div class="bookmark-saved-summary">${esc(summary.substring(0, 100))}…</div>` : ''}
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
      <span>📂 Bookmarks${filter ? ` — "${esc(filter)}"` : ''} (${bookmarks.length})</span>
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

// ── TOOLTIP SYSTEM ───────────────────────────────────────────────────────
// Floating "i" icons that appear next to labeled UI elements
const TOOLTIPS = {
  'settings-provider': 'The AI service that powers OpenBrowser. Anthropic (Claude), OpenAI (GPT-4), Gemini, Groq (free+fast), or Ollama (fully local, free).',
  'settings-model': 'The specific model to use. Larger models are smarter but slower and more expensive.',
  'settings-apikey': 'Your private API key — stored only in your browser, never sent to us.',
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

// ── TASK PLAN RENDERER ──────────────────────────────────────────────────
let taskPlanEl = null;  // keep reference so we can update it in-place

function renderTaskPlan() {
  const plan = state.taskPlan;
  if (!plan) return;

  const statusIcon = { pending: '○', active: '◉', done: '✓', failed: '✗' };
  const statusClass = { pending: 'task-pending', active: 'task-active', done: 'task-done', failed: 'task-failed' };

  const inner = `
    <div class="task-plan-title">${esc(plan.title)}</div>
    <ol class="task-plan-steps">
      ${plan.steps.map((s, i) => `
        <li class="task-step ${statusClass[s.status] || 'task-pending'}">
          <span class="task-step-icon">${statusIcon[s.status] || '○'}</span>
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

// ── DATA TABLE RENDERER ──────────────────────────────────────────────────
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
      <span>📊 ${esc(name)} — ${rows.length} rows × ${keys.length} cols</span>
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

// ── STREAMING ASSISTANT MESSAGE ──────────────────────────────────────────
// Creates a live-updating bubble that streams tokens in character by character.
// Returns { el, update(chunk), finish(fullText) }
function createStreamingBubble() {
  msgs().querySelector('.empty-state')?.remove();
  const d = document.createElement('div');
  d.className = 'message message-assistant streaming-msg';
  d.innerHTML = `<div class="msg-bubble"><span class="stream-text"></span><span class="stream-cursor">▋</span></div>`;
  msgs().appendChild(d); scrollEnd();
  const span = d.querySelector('.stream-text');
  const cursor = d.querySelector('.stream-cursor');
  let rawText = '';

  return {
    el: d,
    update(chunk) {
      rawText += chunk;
      // md() output is produced by our own renderer with esc() applied to
      // user-visible text — safe to assign as innerHTML here.
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

// ── STREAMING callAI ─────────────────────────────────────────────────────
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
    // This is a CORS configuration issue — don't fall through to backup model logic.
    if (res.status === 403 && providerKey === 'ollama') {
      throw new Error(
        'Ollama blocked this request (HTTP 403 — CORS).\n\n' +
        'Ollama does not allow requests from browser extensions by default.\n\n' +
        'Fix: restart Ollama with the OLLAMA_ORIGINS environment variable:\n\n' +
        '  macOS/Linux:   OLLAMA_ORIGINS="chrome-extension://*" ollama serve\n' +
        '  Windows (PS):  $env:OLLAMA_ORIGINS="chrome-extension://*"; ollama serve\n\n' +
        'Then click "Test Connection" in Settings to confirm it worked.'
      );
    }
    if (!state.backupActive && isQuotaError(res.status, errText) && s.backupProvider && s.backupModel && s.backupApiKey) {
      state.backupActive = true;
      addStep('error', '⚠️', 'Primary quota hit', `Switching to backup: ${s.backupModel}`);
      toast('Primary model quota exceeded — switching to backup model');
      return callAIStreaming(messages, sys, signal, onChunk);
    }
    throw new Error(`API ${res.status}: ${errText.substring(0, 400)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let rawBody = '';  // Raw accumulation — fallback if Ollama returns non-SSE JSON
  let fullText = '';
  const toolCalls = [];    // For OpenAI streaming tool accumulation
  let currentToolCall = null;

  // UX: if Ollama takes > 6s with no tokens (model loading), update status bar
  let firstTokenReceived = false;
  const ollamaLoadingHint = (providerKey === 'ollama') ? setTimeout(() => {
    if (!firstTokenReceived) setStatus('loading', 'Ollama is loading the model…');
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

  // ── Fallback: Ollama (and some providers) sometimes return plain JSON
  // instead of SSE when stream:true is set but the model buffers the full
  // response before sending (e.g. during initial model load). Try parsing
  // the raw body as a standard chat completion response.
  if (!fullText && !toolCalls.length && rawBody.trim()) {
    try {
      const fallbackData = JSON.parse(rawBody.trim());
      return parseAIResponse(fallbackData, req.format);
    } catch { /* not valid JSON — fall through to empty-response error */ }
  }

  // ── Empty stream: surface a clear error instead of silently returning
  // blank text (which makes the agent stop with no user-visible output).
  if (!fullText && !toolCalls.length) {
    const hint = providerKey === 'ollama'
      ? 'Ollama returned an empty response. The model may have been unloaded or does not support streaming with tool definitions. Try sending your message again — if the problem persists, try a different model (llama3.2 or qwen2.5 work best).'
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
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABmJLR0QA/wD/AP+gvaeTAAAHiElEQVR4nO2dP4wVRRzHP3ORyhAhEq0sLAiVsboQEUjQQCJoh41WGhOMFmBMuHeaeAcxvHdnDJBIIg1WVtqR04I/xYlgvFhJczE2dhgIklgY/7yxeG+Gt/v2/Z/d+c3sfLrb2/39Jnw/M/vu2LlV1BHdPATqBLC/e2Qd1FnUwhWfw/KB8j2AStHNQzC3DPq5AWfcBLVcJxHqIcDo4PPURoS4BZg8+DzRixCnAJ17/BKwx1HFaEWISwD3weeJToQ4BCg/+DzRiBC2ANUHnyd4EcIUwH/weYIVISwB3Ae/BkqBPuyoXnAihCGAbu0FTgMHHFW8CupD1MKP3frPgvoQ9FGc/JuoW6CbqMbl2WuVi2wByg6+v1/tRJApQNXB9/evjQiyBPAdfP94ohdBhgDSgs8TsQh+BZAefJ4IRfAjQGjB54lIhGoFCD34PBGIUI0AsQWfJ2ARyhUg9uDzBChCOQLULfg8AYngVoC6B58nABHcCJCCH45gEWYbTAp+MgSKMN0gUvCzIUiEyZqn4N0iQITxmqbgy8WjCMObpeCrxYMIxU1S8H6pUIRs8RS8LCoQoVNUr+6E9iVg7+xNAFgDfQq1uOGoXr3Rzfnuw7BHHFW8AXNvok7+otAfPwWPbABPOiicgi8TtyLcgX/nFbp1CXhjxmIp+CpxJ8IXCt26AzwxZYEUvE9mF+H3OWDrlBdvwtxKCt8janED5laAzSkrbJ0Dbk958S5or6NbV9Gr+6askZgWvboP3boK7XVg15RVbit06zXgSwdDugZzp1Anv3NQKzEIvboP2kvAiw6qvd79MbB5BlQDN/89nEQoA7fBa9At1OIHDwPv/BLoFPCCgwaQRHCD2+ABrgNLqMYNKJrx+szzndVAveymn/oe2h+hFq+7qVcTdGsP6EW3ObCEWriWOTp4AEkEL1QUvP3u6AElESqh4uDtWWPXSyKUg6fg7dkT108iuMFz8PaqqfslEaZDSPD26pn7JxHGQ1jwtoqbwZBEGITQ4G01F0UyJBE6CA/eVnVZLENdRQgkeFu9jKIZ6iJCYMHbLmUWzxCrCIEGb7tV0SRDLCIEHrztWmWzDKGKEEnwtruPphlCESGy4O0ofDbPIFWESIM3yBHAIEWEyIM3yBPA4EuEmgRvkCuAoSoRaha8Qb4Ahs6zccu4e2bxeueVclBK3UCehQxHAIPzFcEVYcz4PEOeCVxZg/YGqLOoxoMKxzQeYkQQHLz+5FH47y3gICy8glI6f8qgPxDxEvBN96t7oD9LIuQJIvhFHu76PoxqfJs/dZAAPwC7c0eTCECAwRt+goX5/CpQsC8gM/uLEC6C8w+LBrkf7oYH30vfKlAkQNHsL0K4CK5WhGBnfBF9q0D+bwSNmv1FRCpCVMH3klkF8gKMO/uLiESEaIM3ZFaB3s2h08z+IoSLMHCzpdzNrG6C78WuAj0CrGyF9judWcI2B02Ei9B6Btjf/Wod1fjZ53AKcR/8n6AuQHsFtXgfCj8E1kwEiVQQvGHYbwKTCFVTYfCGMXYHJxFKx0Pwhgl2BycRnOMxeMMUu4OTCDMjIHjDDLuDkwgTIyh4g4PdwUmEkQgM3uBwd3ASoQ/BwRtK2B2cRAgheEOJu4NrKEJAwRsq2B1cAxECDN5Q4e7gCEUIOHiDh93BEYgQQfAGj7uDAxQhouAN/vcFhCBChMEb/AtgkChCxMEb5AhgkCBCDYI3yBPA4EOEGgVvkCuAoQoRahi8Qb4ABt3cDuoEcBx4zEHFe6A+7RZ/H3jcQc0HwHnQ56QHbxjySNjZbaj3/qhwLOPhXgQXyA5+SJYD9gZe3AL3N4FfkfryZ/e3hmmQvdQ/fPn0bvhrJ2r57/wpgzaHHgM+7zki9y3gfkQIJfjet46/jWpczJ9a8Fi4nf1PF5SuuwghBm/4rWgVKNocmp/9RQgWoZTPCMLv8UOD76VvFcjtDRw6+4sQLIKTFSHkGV9E3yqQ3xw6zuwvIjYRYgu+l8wq0LM3cOLZX0ToIsQcvCGzCvRuDj0K+isHwwRYA31K5KvldXM7cBzUu8CO7tG7oC8A52UG35wHtQQccVNQvYpa+Br6bwF7gdPAATeNJK8IF7fA3e5r13dsoo7943dABbiZ8T2oW6CbqMZle2RA4/qIIJEKgrffGTGQJEKVVBi8PWPMgSURysRD8PbMieomEdziMXh7xVR9kgizISB4e+VMfZMIkyEoeFth9kGQRBiFwOBtpdkH00MSIYvg4G1FV4Uy1F2EAIK3lV0XzFA3EQIK3nYoq3CG2EUIMHjbqewGGWITIeDgbceqGmUIXYQIgredq26YITQRIgrejsBX4wzSRYgweDsS3wPIIE2EiIM3yBLA4FuEGgRvkCmAoWoRahS8QbYAhrJFqGHwhjAEMOiVg6CXgT1uCqruK3L0YTf1uAlqGbVwxVG90glLAINzEWYmuOANYQpgcH9rmJBwlvpBhC2AoXIRwg/eEIcAhtJFiCd4Q1wCGNx/Rgj2Hj+KOAUwzLwixDfj88QtgGFiEeIP3lAPAQwjRahP8IZ6CWDQKweBE6C7r45V68C5GO/xo/gf2Gop57rrOqIAAAAASUVORK5CYII=" width="52" height="52" alt="OpenBrowser" style="filter:drop-shadow(0 0 12px rgba(0,255,136,0.5))" />
      </div>
      <div class="empty-title">OpenBrowser</div>
      <div class="empty-subtitle">Free, open-source AI browser agent. Describe your task below.</div>
      <div class="example-grid" id="eg">
        <button class="example-item" data-p="Scrape all the data on this page into a CSV file"><span class="example-icon">📊</span>Scrape to CSV</button>
        <button class="example-item" data-p="Fill out this form using my information"><span class="example-icon">📝</span>Fill a form</button>
        <button class="example-item" data-p="Search Google for the best price of this product and compare results"><span class="example-icon">🛒</span>Compare prices</button>
        <button class="example-item" data-p="Summarize the main points on this page"><span class="example-icon">📖</span>Summarize page</button>
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
      
      const stepId = addStep(status, TOOL_ICONS[m.name] || '🔧', m.name, JSON.stringify(m.input).substring(0, 100));
      
      if (resultText) {
        updateStep(stepId, status, TOOL_ICONS[m.name] || '🔧', m.name, resultText.substring(0, 200));
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
      <div class="history-meta">${dt.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ${c.messages.filter(m => m.role === 'user').length} msgs</div>`;
    d.addEventListener('click', () => { state.convId = c.id; renderConv(c.id); switchView('chat'); });
    list.appendChild(d);
  });
}

// ── SETTINGS UI ────────────────────────────────────────────────────
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
    ? '<option value="">— disabled —</option>'
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

// ── VIEW ───────────────────────────────────────────────────────────
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
  toast('Conversation exported ✓');
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

// ── BOOT ───────────────────────────────────────────────────────────
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

  // ── Check for pending prompts (Omnibox / Context Menu) ────────────────
  const PENDING_OMNIBOX = { message: 'pendingOmniboxMessage', messageId: 'pendingOmniboxMessageId' };
  chrome.storage.local.get([PENDING_OMNIBOX.message, PENDING_OMNIBOX.messageId]).then(res => {
    const prompt = res[PENDING_OMNIBOX.message];
    if (prompt) {
      chrome.storage.local.remove([PENDING_OMNIBOX.message, PENDING_OMNIBOX.messageId]);
      el('chat-input').value = prompt; autoH();
      runAgent(prompt);
    }
  });

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
