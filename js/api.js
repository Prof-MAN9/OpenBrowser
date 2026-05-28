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

