# OpenBrowser — AI Browser Automation

<div align="center">

**Control your browser with plain English. Free, open-source, no subscriptions.**

[![Version](https://img.shields.io/badge/version-3.2.6-00ff88?style=flat-square)](https://github.com/Prof-MAN9/OpenBrowser/releases)
[![License](https://img.shields.io/badge/license-MIT-00ff88?style=flat-square)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/chrome-extension-00ff88?style=flat-square&logo=googlechrome)](https://github.com/Prof-MAN9/OpenBrowser)
[![Stars](https://img.shields.io/github/stars/Prof-MAN9/OpenBrowser?style=flat-square&color=00ff88)](https://github.com/Prof-MAN9/OpenBrowser/stargazers)

</div>

---

## What is OpenBrowser?

OpenBrowser is a free, open-source Chrome extension that brings AI-powered browser automation to your fingertips — without subscriptions, usage limits, or data collection. Connect your own API key and describe what you want in plain English. OpenBrowser handles the rest.

> *"Book me a flight to NYC under $400."* &nbsp;→&nbsp; Done.  
> *"Compare the specs on these three laptops I have open."* &nbsp;→&nbsp; Done.  
> *"Fill in this form with my details and submit it."* &nbsp;→&nbsp; Done.

Unlike SaaS-based browser agents, OpenBrowser runs entirely inside your browser. Your API keys and conversation history never touch a third-party server.

---

## Features

### 🤖 Multi-Provider AI Support
Connect to **12 providers** with your own API key:

| Provider | Notes |
|---|---|
| **Anthropic (Claude)** | claude-sonnet-4-5, claude-opus-4, claude-haiku-4-5 |
| **OpenAI (GPT-4)** | gpt-4o, gpt-4-turbo, gpt-3.5-turbo |
| **Google Gemini** | gemini-2.0-flash, gemini-1.5-pro |
| **Groq** | llama-3.3-70b, mixtral — fast free tier |
| **Ollama (Local)** | Fully offline — llama3.2, mistral, deepseek-r1 |
| **OpenRouter** | 200+ models via a single key |
| **Cloudflare Workers AI** | Low-latency edge inference |
| **HuggingFace** | Open-weight models |
| **MiniMax / Moonshot / Qwen** | Chinese providers with global access |
| **Custom API** | Any OpenAI-compatible endpoint |

### 🧰 50+ Built-in Agent Tools
OpenBrowser gives the AI a full toolkit for web automation:

**Navigation & Interaction**
- `navigate` — Go to any URL or site name ("YouTube", "my Gmail", "search for...")
- `click`, `type`, `scroll`, `select_option` — Interact with any page element
- `open_tab`, `switch_tab`, `list_tabs` — Manage multiple browser tabs

**Content & Data**
- `screenshot` — Capture the current page
- `get_page_content`, `scrape_page` — Extract structured page content
- `extract_data`, `export_data` — Pull data into tables, CSV, or JSON
- `download_csv` — Save extracted data as a file

**Forms**
- `smart_fill_form` — Semantic form filling (understands "first name" = "given name" = "fname")
- `scan_forms` — Discover all form fields on a page

**Research & Analysis**
- `summarize_tabs` — Digest all open tabs at once
- `cross_site_research` — Compare data across multiple open tabs simultaneously
- `auto_highlight` — Highlight relevant passages based on your goal
- `remove_highlights` — Clear all highlights

**Planning**
- `create_task_plan` — Render a live visual checklist in the chat
- `update_task_step` — Mark steps done/active/failed in real time
- `reason`, `think` — Explicit chain-of-thought before acting

**Memory & Knowledge**
- `memorize`, `recall` — Persist facts across sessions (optional)

**Files (Virtual Filesystem)**
- `write_file`, `read_file`, `list_files`, `delete_file` — AI-managed file storage in IndexedDB

**Bookmarks & Citations**
- `save_bookmark` — Auto-tagged smart bookmarking
- `show_bookmarks` — Browse saved bookmarks with tag filtering
- `add_citation` — APA/MLA/Chicago/URL format source collection
- `show_citations`, `clear_citations`

**Utilities**
- `run_javascript` — Execute arbitrary JS on the current page
- `browse_intent` — Intent-based navigation ("find me a cheap flight")
- `wait` — Pause for slow-loading pages
- `finish` — Conclude the task with a summary

### 🌊 Streaming Responses
AI answers appear token by token, just like Claude.ai. No waiting for the full response.

### 🎤 Voice Input
Click the microphone button to dictate your instructions. Live transcription via the Web Speech API — no extra APIs, works offline.

### ⌨️ Quick Command Palette
Press `Ctrl+Shift+P` on any webpage to open a floating command palette. Type your instruction and press Enter — OpenBrowser opens the side panel and runs it automatically.

### 🔖 Macros & Scheduling
Save any task as a reusable macro. Run manually or schedule it to repeat automatically (every 15 min / 30 min / 1h / 6h / daily) using Chrome alarms.

### 🧠 Persistent Memory
The AI can `memorize` facts and `recall` them across different conversations and sessions. A visual Memory Dashboard lets you edit or delete stored entries.

### 📁 Virtual Filesystem
An IndexedDB-backed file store lets the AI generate, save, read, and delete files. A "Files" tab in the panel shows a tree view with download support.

### 🎨 Themes
Dark mode (default), Light mode, and a Custom mode with a full accent color picker and preset swatches.

### 🔷 Mermaid Diagrams
When the AI outputs a mermaid code block, it renders as a live diagram — flowcharts, sequence diagrams, ER diagrams, Gantt charts — styled to match the OpenBrowser palette.

### 📝 Prompt Templates
One-click access to saved prompts. 6 built-in templates (Summarize, Extract data, Fill form, etc.) plus unlimited custom templates. Open with `Ctrl+K`.

### 🖱 Context Menu
Right-click any page for instant OpenBrowser actions: Summarize, Ask about selected text, Translate, Save as citation, Screenshot, Fill forms.

### 📊 Rate Limiting
Set RPM and RPD caps to protect your API quota. OpenBrowser stops 5 calls before the limit with a warning.

### 🔄 Backup Model
Configure a secondary provider/model. If the primary hits its quota, the agent automatically switches mid-task.

---

## Setup

### Prerequisites
- Google Chrome (version 114 or later)
- An API key from at least one supported provider  
  *(Or [Ollama](https://ollama.ai) running locally for a fully free experience)*

### Installation

**Option A — Install from source (recommended)**

1. Download the latest release ZIP from the [Releases page](https://github.com/Prof-MAN9/OpenBrowser/releases)  
   *(Or clone the repository)*

2. Open Chrome and navigate to `chrome://extensions`

3. Enable **Developer mode** (toggle in the top-right corner)

4. Click **Load unpacked** and select the `ctrl-browser/` folder  
   *(Or drag-and-drop the unzipped folder)*

5. The OpenBrowser icon will appear in your toolbar

**Option B — Chrome Web Store**  
*Coming soon.*

---

### Configuring Your First Provider

1. Click the OpenBrowser icon in your toolbar (or press `Ctrl+Shift+Y`)
2. Click **Settings** in the bottom navigation
3. Select your **Provider** (e.g. Anthropic)
4. Select your **Model** (e.g. claude-sonnet-4-5)
5. Paste your **API Key**
6. Click **Save Settings**

> ⚡ **Free option:** Select **Ollama (Local — Free)**, click **Test Connection**, and install any model with `ollama pull llama3.2`. No API key needed.

---

### Using Ollama (Fully Local & Free)

1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Start the server: `ollama serve`
3. Pull a model: `ollama pull llama3.2` (or `mistral`, `deepseek-r1`, `qwen2.5`)
4. In OpenBrowser Settings → Provider → **Ollama (Local — Free)**
5. Click **Test Connection** — OpenBrowser will auto-discover your installed models

---

## Usage

### Basic Chat
Open the side panel, type your instruction, and press Enter.

```
"Go to YouTube and search for the latest OpenAI keynote"
"Fill in the contact form with: name=John Smith, email=john@example.com"  
"Summarize all my open tabs and tell me the most important one"
"Extract the pricing table from this page as CSV"
```

### Multi-Step Tasks
For complex tasks, the AI creates a live task plan you can watch execute step by step:

```
"Research the top 5 Python web frameworks, compare their GitHub stars, 
 performance benchmarks, and learning curves, then save a comparison 
 table to a file"
```

### Smart Form Filling
```
"Fill in this checkout form. 
 Name: Jane Doe, Email: jane@example.com, 
 Country: Canada, Province: Ontario, ZIP: M5V 3A8"
```
OpenBrowser matches fields semantically — "given name", "first name", "prénom" all resolve correctly.

### Cross-Site Research
```
"I have three laptop tabs open. Compare their RAM, storage, price, 
 display size, and battery life in a table"
```

### Quick Command Palette
Press `Ctrl+Shift+P` on any page → type your instruction → press Enter.  
No side panel needed — the agent runs in the background and opens automatically.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Shift+Y` | Toggle side panel |
| `Ctrl+Shift+P` | Quick command palette (on page) |
| `Enter` | Send message |
| `Shift+Enter` | New line in input |
| `Escape` | Stop running agent |
| `Ctrl+K` | Open prompt templates |
| `Ctrl+M` | Open memory dashboard |
| `Ctrl+N` | New conversation |
| `Ctrl+?` or `?` | Show all shortcuts |
| `Alt+1–5` | Switch to Chat / History / Files / Macros / Settings |

---

## Help & FAQs

### Why does the agent stop after a few steps?
Check **Settings → Max Steps**. The default is 20. For complex tasks, increase it to 50 or 100. Each step uses one API call.

### My API key isn't working
- Make sure you copied the full key including any prefix (e.g. `sk-ant-...`)
- Check that your account has credits or is on an active plan
- For Anthropic free tier: set RPM = 5 and RPD = 25 in Settings → Rate Limits to stay within limits

### The agent can't interact with the page
Some pages (bank websites, certain Chrome pages) block extensions from injecting scripts. This is a browser security restriction and cannot be overridden. Try navigating to the page manually first, then giving the instruction.

### How do I use Ollama with OpenBrowser?
See the [Using Ollama](#using-ollama-fully-local--free) section above. Ollama runs a local HTTP server on port `11434`. OpenBrowser communicates with it the same way it does with cloud providers — no data leaves your machine.

### Does OpenBrowser collect any data?
**No.** OpenBrowser is a pure client-side extension. Your API keys, conversation history, memories, and files are stored only in your browser's local storage (`chrome.storage.local` and IndexedDB). No analytics, no telemetry, no cloud sync.

### Why does the AI sometimes use `<function=...>` syntax in its response?
This is an Anthropic model quirk — some models fall back to an XML-style tool-calling format. OpenBrowser detects and handles all known fallback formats automatically. You should never see raw `<function=...>` blocks in the chat; if you do, please [open an issue](https://github.com/Prof-MAN9/OpenBrowser/issues).

### How do I back up my macros, memory, and settings?
Open Chrome DevTools on the side panel (`right-click → Inspect`), then run:
```js
chrome.storage.local.get(null, data => console.log(JSON.stringify(data)));
```
Copy the output. To restore, paste it back and use `chrome.storage.local.set(...)`.

### The page glow effect isn't appearing
Make sure **Edge Glow** is enabled in Settings → Features. The glow injects a fixed overlay onto the active tab's DOM — it won't appear on `chrome://` pages or extension pages.

### Can I add my own provider?
Yes! Select **Custom API** as the provider and enter any OpenAI-compatible base URL. This works with LM Studio, vLLM, LocalAI, Jan, and most self-hosted inference servers.

### What's the difference between the backup model and the primary model?
The primary model handles all requests normally. If it returns a 429 (rate limit), 402 (payment required), or a quota error, OpenBrowser automatically switches to the backup model for the rest of that run. The switch is seamless — the task continues without interruption.

---

## Architecture

```
OpenBrowser/
├── manifest.json          MV3 manifest — permissions, commands, CSP
├── background.js          Service worker: sidebar toggle, context menu,
│                          page-change detector, macro scheduler, quick palette
├── sidepanel.html         Main panel UI (HTML + embedded CSS)
├── sidepanel.js           ~3500 lines: agent loop, 50+ tools, streaming,
│                          VFS, themes, Mermaid, memory, macros
├── welcome.html           Onboarding page (shown on first install)
├── welcome.js             Open Panel button handler
├── sandbox.html           Isolated iframe for safe JS evaluation
├── content-scripts/
│   └── content.js         DOM interaction layer (injected on demand)
└── icons/                 Extension icons (16, 32, 48, 128px)
```

**How the agent loop works:**
1. User sends a message → `runAgent()` starts
2. The full conversation history + system prompt → `callAIStreaming()`
3. AI response streams in token by token → rendered live in the chat
4. If the response contains tool calls → `executeTool()` runs each one
5. Tool results feed back into the conversation → next AI call
6. Loop continues until `finish` tool, max steps reached, or user stops

---

## Contributing

Contributions are warmly welcome! Here's how to get involved:

### Reporting Bugs
1. Check the [existing issues](https://github.com/Prof-MAN9/OpenBrowser/issues) first
2. Open a new issue with:
   - Chrome version (`chrome://version`)
   - OpenBrowser version (visible in Settings)
   - Provider and model being used
   - Steps to reproduce
   - What you expected vs. what happened
   - Console errors (right-click the panel → Inspect → Console)

### Suggesting Features
Open an issue with the `enhancement` label. Describe the use case, not just the feature — *"I want to do X but currently can't because Y"* is more useful than *"Add feature Z"*.

### Submitting Code

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_NAME/OpenBrowser.git`
3. **Make your changes** — the extension loads directly from the folder, no build step needed
4. **Test** by loading the folder as an unpacked extension
5. **Open a pull request** with a clear description of what changed and why

### Code Guidelines
- All JS is vanilla ES2022 — no build tools, no bundler, no dependencies
- New tools go in the `TOOLS` array (with a description) and `executeTool()` switch
- Follow existing naming conventions: `camelCase` for functions, `snake_case` for tool names
- Keep tool descriptions accurate — they go directly into the API request
- New settings fields need entries in both `loadSettingsUI()` and the save handler

### Adding a New Provider
1. Add an entry to the `PROVIDERS` object in `sidepanel.js`
2. Include: `name`, `baseUrl`, `models[]`, `format` (`'anthropic'`|`'openai'`|`'gemini'`), `requiresKey`, `keyPlaceholder`, `keyHint`
3. Add the provider to both select dropdowns in `sidepanel.html`
4. If it needs a custom request format, add a branch in `buildProviderRequest()`

---

## Roadmap

- [ ] Firefox/Edge support (Manifest V3 side panel API is Chrome-only today)
- [ ] Extension sync across devices via Chrome Sync
- [ ] Plugin/extension API for third-party tools
- [ ] Session replay — watch the agent's actions as a visual recording
- [ ] Headless mode — run agents without the side panel open
- [ ] Multi-agent — spawn parallel agents for different tabs

---

## License

MIT License — see [LICENSE](LICENSE) for details.

You are free to use, modify, and distribute OpenBrowser for any purpose. If you build something cool with it, a mention or a star is appreciated but never required.

---

## Acknowledgements

- [Anthropic](https://anthropic.com) for Claude, the model that powers most of our testing
- [Ollama](https://ollama.ai) for making local LLMs accessible to everyone
- [Do Browser](https://dobrowser.io) for the inspiration
- [Mermaid.js](https://mermaid.js.org) for diagram rendering
- Every contributor who has reported bugs, suggested features, or submitted PRs

---

Built with ❤️ and 🤖 · [github.com/Prof-MAN9/OpenBrowser](https://github.com/Prof-MAN9/OpenBrowser)
