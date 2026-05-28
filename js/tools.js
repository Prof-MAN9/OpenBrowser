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
