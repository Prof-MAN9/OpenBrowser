// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// OpenBrowser v3.3 â€” Side Panel Application
// https://github.com/Prof-MAN9/OpenBrowser
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
'use strict';

// â”€â”€ PROVIDERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    keyPlaceholder: 'sk-ant-api03-â€¦',
    keyHint: 'Get your key at console.anthropic.com'
  },
  openai: {
    name: 'OpenAI', baseUrl: 'https://api.openai.com/v1/chat/completions',
    models: [
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { id: 'gpt-4', label: 'GPT-4' },
      { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
    ],
    format: 'openai', requiresKey: true,
    keyPlaceholder: 'sk-â€¦',
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
    keyPlaceholder: 'AIzaâ€¦',
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
    keyPlaceholder: 'gsk_â€¦',
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
      { id: 'llama3.3', label: 'Llama 3.3' },
      { id: 'glm-5.1:cloud', label: 'GLM 5.1' },
      { id: 'gemma3', label: 'Gemma 3' },
      { id: 'phi4', label: 'PHI 4' }
    ],
    format: 'openai', requiresKey: false,
    keyPlaceholder: '(not required)',
    keyHint: 'Ollama runs locally â€” no API key needed'
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
    keyPlaceholder: 'sk-or-v1-â€¦',
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
    keyPlaceholder: 'hf_â€¦',
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
    keyPlaceholder: 'sk-â€¦',
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
    keyPlaceholder: 'sk-â€¦',
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

// â”€â”€ TOOLS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    description: 'Intelligently fill form fields on the current page using semantic matching. Understands context: "first name", "given name", "prÃ©nom" all map correctly. Handles checkboxes, selects, radios, and textareas too.',
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
  // â”€â”€ NEW v3.2.3 TOOLS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    name: 'summarize_tabs',
    description: 'Summarize all open browser tabs (or a specific subset) and return a structured digest. Great for "catch me up on all my open research" requests.',
    parameters: {
      tab_ids: { type: 'string', description: 'Optional JSON array of specific tab IDs to summarize (from list_tabs). Leave empty to summarize all tabs.' },
      focus: { type: 'string', description: 'Optional focus topic â€” e.g. "pricing" or "technical specs". Guides what to extract from each page.' }
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
  // â”€â”€ VIRTUAL FILESYSTEM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ STATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
