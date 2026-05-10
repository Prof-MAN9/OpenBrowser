// OpenBrowser v3.3 — Content Script / DOM Interaction Layer
// https://github.com/Prof-MAN9/OpenBrowser

(function() {
  'use strict';

  // Prevent double injection
  if (window.__OB_INJECTED__) return;
  window.__OB_INJECTED__ = true;

  // Listen for messages from sidepanel via background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.target !== 'content') return;

    switch (message.action) {
      case 'get-page-info':
        sendResponse(getPageInfo());
        return;
      case 'find-element':
        sendResponse(findElement(message.query));
        return;
      case 'click-element':
        clickElement(message.query, message.options).then(sendResponse);
        return true;
      case 'type-in-element':
        typeInElement(message.query, message.text, message.options).then(sendResponse);
        return true;
      case 'scroll-page':
        scrollPage(message.direction, message.amount);
        sendResponse({ success: true });
        return;
      case 'select-option':
        selectOption(message.query, message.value).then(sendResponse);
        return true;
      case 'get-dom-content':
        sendResponse(getDomContent(message.options));
        return;
      case 'extract-data':
        sendResponse(extractData(message.selector, message.options));
        return;
      case 'highlight-element':
        highlightElement(message.query);
        sendResponse({ success: true });
        return;
      case 'get-focused-element':
        sendResponse(getFocusedElement());
        return;
    }
  });

  function getPageInfo() {
    const focusedEl = document.activeElement;
    return {
      url: window.location.href,
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      title: document.title,
      language: document.documentElement.lang || navigator.language,
      selectedText: window.getSelection()?.toString() || '',
      scrollPosition: { x: window.scrollX, y: window.scrollY },
      pageHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
      focusedElement: focusedEl && focusedEl !== document.body ? {
        tagName: focusedEl.tagName?.toLowerCase(),
        type: focusedEl.type,
        placeholder: focusedEl.placeholder,
        ariaLabel: focusedEl.ariaLabel || focusedEl.getAttribute('aria-label'),
        name: focusedEl.name,
        value: focusedEl.tagName?.toLowerCase() === 'input' || focusedEl.tagName?.toLowerCase() === 'textarea' ? focusedEl.value : undefined
      } : null
    };
  }

  function findElement(query) {
    // Try direct CSS selector
    try {
      const el = document.querySelector(query);
      // Spread DOMRect properties — DOMRect serialises to {} over sendResponse
      if (el) {
        const r = el.getBoundingClientRect();
        return { found: true, rect: { top: r.top, left: r.left, width: r.width, height: r.height }, tagName: el.tagName };
      }
    } catch {}

    // Try text search
    const elements = findByText(query);
    if (elements.length > 0) {
      const r = elements[0].getBoundingClientRect();
      return { found: true, rect: { top: r.top, left: r.left, width: r.width, height: r.height }, tagName: elements[0].tagName };
    }

    return { found: false };
  }

  function findByText(text, tagNames = null) {
    const lowerText = text.toLowerCase().trim();
    const allElements = document.querySelectorAll(
      tagNames ? tagNames.join(',') :
      'button, a, input, select, textarea, [role="button"], [role="link"], [role="tab"], [role="menuitem"], label, h1, h2, h3, h4, h5, h6, p, span, div'
    );

    const matches = [];
    for (const el of allElements) {
      // Prefer ariaLabel property but avoid fetching getAttribute twice
      const ariaLabel = el.getAttribute('aria-label') || '';
      const elText = (el.textContent || el.value || el.placeholder || ariaLabel || el.title || '').toLowerCase().trim();
      const elValue = el.getAttribute('value') || '';
      if (
        elText.includes(lowerText) ||
        elValue.toLowerCase().includes(lowerText) ||
        ariaLabel.toLowerCase().includes(lowerText) ||
        el.getAttribute('placeholder')?.toLowerCase().includes(lowerText)
      ) {
        matches.push(el);
      }
    }
    return matches;
  }

  async function clickElement(query, options = {}) {
    let el = null;

    // Try CSS selector first
    try {
      el = document.querySelector(query);
    } catch {}

    // Try text matching
    if (!el) {
      const matches = findByText(query, ['button', 'a', '[role="button"]', '[role="link"]', '[role="tab"]', '[role="menuitem"]', 'input[type="submit"]', 'input[type="button"]']);
      el = matches[0] || null;
    }

    // Try broader text match
    if (!el) {
      const matches = findByText(query);
      el = matches[0] || null;
    }

    if (!el) return { success: false, error: `Element not found: ${query}` };

    // Scroll into view
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await sleep(100);

    // Highlight briefly
    const originalOutline = el.style.outline;
    const originalBackground = el.style.backgroundColor;
    el.style.outline = '2px solid #00ff88';
    el.style.backgroundColor = 'rgba(0, 255, 136, 0.1)';

    await sleep(200);
    el.style.outline = originalOutline;
    el.style.backgroundColor = originalBackground;

    // Click
    el.focus();
    el.click();

    // Try dispatching events for JS-heavy apps
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    return { success: true, element: el.tagName, text: el.textContent?.trim()?.substring(0, 100) };
  }

  async function typeInElement(query, text, options = {}) {
    let el = null;

    // Try CSS selector
    try {
      el = document.querySelector(query);
    } catch {}

    // Try finding input/textarea by label/placeholder
    if (!el) {
      const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, [contenteditable="true"]');
      for (const input of inputs) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        const labelText = label?.textContent?.toLowerCase() || '';
        const placeholder = (input.placeholder || '').toLowerCase();
        const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
        const name = (input.name || '').toLowerCase();
        const queryLower = query.toLowerCase();

        if (labelText.includes(queryLower) || placeholder.includes(queryLower) || ariaLabel.includes(queryLower) || name.includes(queryLower)) {
          el = input;
          break;
        }
      }
    }

    // Fallback: focused element
    if (!el && document.activeElement && document.activeElement !== document.body) {
      el = document.activeElement;
    }

    if (!el) return { success: false, error: `Input not found: ${query}` };

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.focus();
    await sleep(50);

    if (options.clear !== false) {
      el.value = '';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Type character by character for realistic simulation
    if (options.simulate) {
      for (const char of text) {
        el.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
        if (el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'textarea') {
          el.value += char;
        } else if (el.contentEditable === 'true') {
          el.textContent += char;
        }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new KeyboardEvent('keyup', { key: char, bubbles: true }));
        await sleep(20);
      }
    } else {
      // Fast type
      if (el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'textarea') {
        // Use native input setter for React compatibility
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set ||
          Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(el, text);
        } else {
          el.value = text;
        }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (el.contentEditable === 'true') {
        el.textContent = text;
        el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }));
      }
    }

    return { success: true, element: el.tagName, typed: text };
  }

  function scrollPage(direction, amount = 400) {
    switch (direction) {
      case 'down': window.scrollBy({ top: amount, behavior: 'smooth' }); break;
      case 'up': window.scrollBy({ top: -amount, behavior: 'smooth' }); break;
      case 'bottom': window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); break;
      case 'top': window.scrollTo({ top: 0, behavior: 'smooth' }); break;
      case 'right': window.scrollBy({ left: amount, behavior: 'smooth' }); break;
      case 'left': window.scrollBy({ left: -amount, behavior: 'smooth' }); break;
    }
  }

  async function selectOption(query, value) {
    let el = null;
    try { el = document.querySelector(query); } catch {}
    if (!el) {
      const selects = document.querySelectorAll('select');
      for (const select of selects) {
        const label = document.querySelector(`label[for="${select.id}"]`);
        if (label?.textContent?.toLowerCase().includes(query.toLowerCase()) ||
            select.getAttribute('aria-label')?.toLowerCase().includes(query.toLowerCase())) {
          el = select;
          break;
        }
      }
    }
    if (!el) return { success: false, error: `Select not found: ${query}` };

    el.value = value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return { success: true };
  }

  function getDomContent(options = {}) {
    const { maxLength = 30000, includeHidden = false, selector = null } = options;

    let root = document.body;
    if (selector) {
      try { root = document.querySelector(selector) || document.body; } catch {}
    }

    // Remove script and style tags for cleaner content
    const clone = root.cloneNode(true);
    clone.querySelectorAll('script, style, noscript, [aria-hidden="true"]').forEach(el => el.remove());

    const text = extractTextContent(clone);
    const truncated = text.length > maxLength ? text.substring(0, maxLength) + '...[truncated]' : text;

    return {
      text: truncated,
      url: window.location.href,
      title: document.title,
      // Use the cleaned clone's HTML, not root.innerHTML which still contains
      // <script>/<style> tags and could include sensitive or bulky content.
      html: clone.innerHTML.substring(0, 50000)
    };
  }

  function extractTextContent(node) {
    let text = '';
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.textContent + ' ';
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const tag = child.tagName?.toLowerCase();
        if (['br', 'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'tr'].includes(tag)) {
          text += '\n';
        }
        text += extractTextContent(child);
      }
    }
    return text.replace(/\s+/g, ' ').replace(/\n\s*\n/g, '\n').trim();
  }

  function extractData(selector, options = {}) {
    try {
      const elements = document.querySelectorAll(selector || 'table, ul, ol, .list, [role="grid"], [role="list"]');
      const data = [];

      for (const el of elements) {
        // Try to extract table data
        if (el.tagName?.toLowerCase() === 'table') {
          const rows = [];
          el.querySelectorAll('tr').forEach(row => {
            const cells = [];
            row.querySelectorAll('th, td').forEach(cell => cells.push(cell.textContent?.trim()));
            if (cells.some(c => c)) rows.push(cells);
          });
          if (rows.length) data.push({ type: 'table', rows });
        } else {
          // List data
          const items = [];
          el.querySelectorAll('li, [role="listitem"], [role="row"]').forEach(item => {
            items.push(item.textContent?.trim());
          });
          if (items.length) data.push({ type: 'list', items });
        }
      }

      return { success: true, data };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  function highlightElement(query) {
    let el = null;
    try { el = document.querySelector(query); } catch {}
    if (!el) {
      const matches = findByText(query);
      el = matches[0] || null;
    }
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const overlay = document.createElement('div');
    const rect = el.getBoundingClientRect();
    overlay.style.cssText = `
      position: fixed;
      top: ${rect.top - 2}px;
      left: ${rect.left - 2}px;
      width: ${rect.width + 4}px;
      height: ${rect.height + 4}px;
      border: 2px solid #00ff88;
      background: rgba(0, 255, 136, 0.1);
      z-index: 999999;
      pointer-events: none;
      border-radius: 3px;
      transition: opacity 0.5s;
    `;
    document.body.appendChild(overlay);
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 500);
    }, 2000);
  }

  function getFocusedElement() {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    return {
      tagName: el.tagName?.toLowerCase(),
      type: el.type,
      placeholder: el.placeholder,
      value: el.value,
      textContent: el.textContent?.trim()?.substring(0, 200),
      ariaLabel: el.getAttribute('aria-label'),
      id: el.id,
      className: el.className,
      name: el.name
    };
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  console.log('[OpenBrowser] Content script loaded on', window.location.hostname);
})();
