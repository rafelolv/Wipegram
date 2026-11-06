import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SCRIPT = path.join(ROOT, 'wipegram.user.js');
const CHROME = process.env.WIPEGRAM_CHROME
  || '/home/roliveira15/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome';
const SCREENSHOT = path.join(os.tmpdir(), 'wipegram-ui-test.png');
const EXTENSION = process.env.WIPEGRAM_TEST_EXTENSION === '1';

const HARNESS = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Wipegram UI test</title>
    <style>
      html, body { margin: 0; height: 100%; font-family: -apple-system, "Segoe UI", Roboto, sans-serif; }
      body { background: #e7ebf0; color: #1b1f24; }
      .app { height: 100%; display: flex; align-items: flex-start; gap: 12px; padding: 10px; }
      .sidebar { width: 300px; height: 100%; background: #fff; border-radius: 10px; box-shadow: 0 1px 6px rgba(0,0,0,.08); }
      .chat { flex: 1; height: 100%; background: #fff; border-radius: 10px; box-shadow: 0 1px 6px rgba(0,0,0,.08); display: flex; flex-direction: column; }
      .topbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid #e3e7eb; }
      .chat-utils { display: flex; gap: 4px; }
      .fake-body { flex: 1; display: flex; align-items: center; justify-content: center; color: #8a8f94; }
      .btn-icon { width: 36px; height: 36px; border: 0; border-radius: 50%; background: transparent; cursor: pointer; display: inline-grid; place-items: center; font: inherit; }
      .btn-icon:hover { background: #f0f2f4; }
      html.night body { background: #17181a; color: #f2f2f2; }
      html.night .sidebar, html.night .chat { background: #212121; box-shadow: none; border: 1px solid #2f2f2f; }
      html.night .topbar { border-color: #2f2f2f; }
      html.night .btn-icon:hover { background: #2b2b2b; }
    </style>
  </head>
  <body>
    <div class="app">
      <div class="sidebar"></div>
      <div class="chat">
        <div class="topbar">
          <strong>Test Chat</strong>
          <div class="chat-utils">
            <button class="btn-icon" type="button" title="Search">🔍</button>
            <button class="btn-icon" type="button" id="fake-more" title="More">⋮</button>
          </div>
        </div>
        <div class="fake-body">mocked Telegram Web K</div>
        <div id="telegram-composer" contenteditable="true" role="textbox" aria-label="Telegram message"></div>
      </div>
    </div>
  </body>
</html>`;

function message(id) {
  return {
    _: 'message',
    id,
    date: 1_700_000_000 + id,
    pFlags: { out: true },
    from_id: { _: 'peerUser', user_id: 999 },
    message: `Test message #${id} — invoice ${id}`
  };
}

async function waitForShadow(page, expression, timeout = 5_000) {
  await page.waitForFunction((source) => {
    const host = document.getElementById('wipegram-ui');
    const root = host?.shadowRoot;
    if (!root) return false;
    // eslint-disable-next-line no-new-func
    return Function('root', `return (${source});`)(root);
  }, expression, { timeout });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  await fs.access(SCRIPT).catch(() => {
    throw new Error('wipegram.user.js is missing. Run "npm run build" first.');
  });

  const options = {
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  };
  let browser;
  let context;
  let profile;
  if (EXTENSION) {
    const extensionPath = path.join(ROOT, 'dist/chromium');
    await fs.access(path.join(extensionPath, 'manifest.json'));
    profile = await fs.mkdtemp(path.join(os.tmpdir(), 'wipegram-extension-'));
    options.args.push(`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`);
    context = await chromium.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 900 } });
    browser = { close: async () => { await context.close(); await fs.rm(profile, { recursive: true, force: true }); } };
  } else {
    browser = await chromium.launch(options);
    context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  }

  try {
  await context.addInitScript(() => {
    window.__keyboardLeaks = [];
    // Telegram-style type-to-compose sees the retargeted Shadow DOM host,
    // not the input inside it. Install before Wipegram to test capture order.
    for (const type of ['keydown', 'keypress', 'keyup']) {
      document.addEventListener(type, event => {
        if (!event.composedPath().some(node => node?.id === 'wipegram-ui')) return;
        window.__keyboardLeaks.push(type);
        if (type === 'keydown' && event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
          document.getElementById('telegram-composer')?.focus();
        }
      }, true);
    }
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(String(error)));

  await page.route('https://web.telegram.org/k/', route => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: HARNESS
  }));
  await page.goto('https://web.telegram.org/k/');

  await page.evaluate((messages) => {
    window.__messages = messages;
    window.__deleted = [];

    const selfId = 999;
    const peer = { _: 'user', id: 777, first_name: 'Test', last_name: 'Chat' };
    const chat = {
      peerId: 777,
      type: 'chat',
      isPreview: false,
      isBroadcast: false,
      isMonoforum: false,
      isForum: false,
      threadId: 0
    };

    const invokeApi = async (method, params) => {
      if (method === 'messages.search' || method === 'messages.getHistory' || method === 'messages.getReplies') {
        if (params?.filter?._ === 'inputMessagesFilterPinned') {
          return { _: 'messages.messages', messages: [], count: 0 };
        }
        if (window.__holdSearch) {
          await new Promise(resolve => { window.__releaseSearch = resolve; });
        }
        if (method === 'messages.search' && window.__emptySenderSearch) {
          return { _: 'messages.messages', messages: [], count: 0 };
        }

        const sorted = [...window.__messages].filter(message => method !== 'messages.search' || !params.from_id
          || (message.from_id?._ === 'peerUser' && message.from_id.user_id === selfId)).sort((a, b) => b.id - a.id);
        const offsetId = params?.offset_id || 0;
        const remaining = offsetId ? sorted.filter(item => item.id < offsetId) : sorted;
        return {
          _: 'messages.messages',
          messages: remaining.slice(0, params?.limit || 100),
          count: sorted.length
        };
      }

      if ((method === 'messages.deleteMessages' || method === 'channels.deleteMessages') && window.__holdDelete) {
        await new Promise(resolve => { window.__releaseDelete = resolve; });
      }
      if (method === 'messages.deleteMessages') {
        window.__deleted.push(...(params?.id || []));
        window.__messages = window.__messages.filter(message => !params.id.includes(message.id));
        return { _: 'messages.affectedMessages', pts: 1, pts_count: params?.id?.length || 0 };
      }

      if (method === 'channels.deleteMessages') {
        window.__deleted.push(...(params?.id || []));
        window.__messages = window.__messages.filter(message => !params.id.includes(message.id));
        return { _: 'messages.affectedMessages', pts: 1, pts_count: params?.id?.length || 0 };
      }

      throw new Error(`Unexpected MTProto method: ${method}`);
    };

    window.rootScope = {
      myId: selfId,
      managers: {
        apiManager: { invokeApi },
        appPeersManager: new Proxy({}, { get: () => () => { throw new Error('Worker proxy used synchronously'); } })
      }
    };
    window.__peer = peer;
    window.apiManagerProxy = { getPeer: () => ({ ...window.__peer, access_hash: '1' }) };
    window.appImManager = { chat };
  }, [message(100), message(101), message(102), { ...message(90), pFlags: {}, from_id: { _: 'peerUser', user_id: 7 } }]);

  if (!EXTENSION) await page.addScriptTag({ path: SCRIPT });
  await page.waitForSelector('#wipegram-launcher', { timeout: 5_000 });
  assert(await page.evaluate(() => window.__deleted.length === 0), 'Startup must not delete messages');
  // Userscript and extension share one runtime even when both are installed.
  await page.addScriptTag({ path: SCRIPT });
  assert(await page.locator('#wipegram-ui').count() === 1, 'Duplicate runtime mounted');

  assert(await page.locator('#wipegram-fab').isVisible(), 'Second launcher must coexist with the toolbar');
  await page.evaluate(() => { window.__testToolbar = document.querySelector('.chat-utils'); window.__testToolbar.remove(); });
  await page.waitForSelector('#wipegram-launcher', { state: 'detached' });
  assert(await page.locator('#wipegram-fab').isVisible(), 'Floating access must survive a toolbar rerender');
  await page.evaluate(() => document.querySelector('.topbar').appendChild(window.__testToolbar));
  await page.waitForSelector('#wipegram-launcher');
  await page.click('#wipegram-fab');
  await waitForShadow(page, '!root.getElementById("panel").hidden');
  await waitForShadow(page, 'root.getElementById("scan-btn").disabled === false');

  const targetName = await page.evaluate(() => {
    const root = document.getElementById('wipegram-ui').shadowRoot;
    return root.getElementById('target-name').textContent;
  });
  assert(targetName === 'Test Chat', `Unexpected target name: ${targetName}`);

  assert(await page.inputValue('#max-messages') === '100', 'Quick limit must start at 100');
  assert(await page.isChecked('#skip-pinned') === false, 'Skip pinned must start unchecked');
  await page.click('#limit-500');
  assert(await page.inputValue('#max-messages') === '500', '500 preset must update the scan cap');
  await page.click('#limit-100');
  await page.fill('#max-messages', '-1');
  await page.click('#scan-btn');
  await waitForShadow(page, '/Message limit must be/.test(root.getElementById("form-error").textContent)');
  await page.click('#limit-100');

  if (process.env.WIPEGRAM_UI_SMOKE === '1') {
    for (const width of [1280, 380, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => {
        window.__wipegram.ui.showToast('Toast position smoke test');
        if (innerWidth > 680) window.__wipegram.ui.positionPanel(24, 90);
      });
      await page.waitForTimeout(180);
      const geometry = await page.evaluate(() => {
        const root = document.getElementById('wipegram-ui').shadowRoot;
        const panel = root.getElementById('panel');
        const toast = root.getElementById('toast');
        const p = panel.getBoundingClientRect(), t = toast.getBoundingClientRect();
        const header = root.querySelector('.wg-header').getBoundingClientRect();
        const scan = root.getElementById('scan-btn').getBoundingClientRect();
        return { inside: panel.contains(toast) && t.left >= p.left && t.right <= p.right,
          belowHeader: t.top >= header.bottom, aboveActions: t.bottom < scan.top,
          mobileWidth: t.width, panelWidth: p.width };
      });
      assert(geometry.inside && geometry.belowHeader && geometry.aboveActions, `Toast misplaced at ${width}px`);
      if (width <= 680) assert(geometry.mobileWidth >= geometry.panelWidth - 30, 'Mobile toast should fill available panel width');
    }
    await page.click('#close-btn');
    assert(await page.locator('#toast').isVisible() === false, 'Toast must hide with its panel');
    console.log('Toast smoke test passed: desktop, moved panel, mobile and close.');
    return;
  }

  // Keyboard shortcut toggles the panel.
  await page.keyboard.press('Alt+Shift+W');
  await waitForShadow(page, 'root.getElementById("panel").hidden === true');
  await page.keyboard.press('Alt+Shift+W');
  await waitForShadow(page, 'root.getElementById("panel").hidden === false');
  await waitForShadow(page, 'root.getElementById("scan-btn").disabled === false');

  if (process.env.WIPEGRAM_UI_SCREENSHOT !== '0') {
    await page.waitForTimeout(250);
    await page.screenshot({ path: SCREENSHOT });
    await page.locator('#panel').screenshot({ path: path.join(os.tmpdir(), 'wipegram-panel-light.png') });
    await page.evaluate(() => document.documentElement.classList.add('night'));
    await page.waitForTimeout(150);
    await page.locator('#panel').screenshot({ path: path.join(os.tmpdir(), 'wipegram-panel-dark-empty.png') });
    await page.evaluate(() => document.documentElement.classList.remove('night'));
  }

  const initialLayout = await page.evaluate(() => {
    const root = document.getElementById('wipegram-ui').shadowRoot;
    const review = root.querySelector('.wg-review-scroll');
    return { rail: root.querySelector('.wg-rail'), settings: root.getElementById('filters-shortcut'), overflow: review.scrollHeight - review.clientHeight };
  });
  assert(!initialLayout.rail && !initialLayout.settings, 'Redundant sidebar/settings shortcut must be removed');
  assert(initialLayout.overflow <= 1, `Empty workspace has unnecessary scrolling: ${initialLayout.overflow}`);

  // A running scan must expose Stop even before the first page completes.
  await page.evaluate(() => { window.__holdSearch = true; });
  await page.click('#scan-btn');
  await page.waitForFunction(() => typeof window.__releaseSearch === 'function');
  await page.waitForSelector('#stop-btn', { state: 'visible' });
  await page.click('#stop-btn');
  await page.evaluate(() => { window.__holdSearch = false; window.__releaseSearch(); });
  await waitForShadow(page, 'root.getElementById("status-text").textContent === "Scan stopped."');
  assert(await page.evaluate(() => window.__deleted.length === 0), 'Stop during scan must not delete');

  await page.click('#scan-btn');
  await waitForShadow(page, 'root.getElementById("delete-btn").disabled === false', 10_000);

  const afterScan = await page.evaluate(() => {
    const root = document.getElementById('wipegram-ui').shadowRoot;
    return {
      status: root.getElementById('status-text').textContent,
      found: root.getElementById('metric-found').textContent,
      checked: root.getElementById('metric-checked').textContent,
      results: root.querySelectorAll('.wg-result').length,
      deleteLabel: root.getElementById('delete-label').textContent
    };
  });
  assert(afterScan.found === '3', `Expected 3 found messages, got ${afterScan.found}`);
  assert(afterScan.checked === '3', `Only unique own messages must be counted, got ${afterScan.checked}`);
  assert(afterScan.results === 3, `Expected 3 result rows, got ${afterScan.results}`);
  assert(/ready to delete/i.test(afterScan.status), `Unexpected scan status: ${afterScan.status}`);
  assert(/Delete 3 messages/.test(afterScan.deleteLabel), `Unexpected delete label: ${afterScan.deleteLabel}`);

  await page.click('#privacy-btn');
  const privacyClass = await page.evaluate(() => document.getElementById('wipegram-ui').classList.contains('wg-private'));
  assert(privacyClass === true, 'Privacy mode did not apply');
  await waitForShadow(page, 'getComputedStyle(root.getElementById("target-name")).filter === "blur(5px)"');

  await page.fill('#query-input', 'invoice');
  await waitForShadow(page, 'root.getElementById("delete-btn").disabled && root.getElementById("results").hidden');
  assert(await page.evaluate(() => window.__wipegram.ui.scanSnapshot === null), 'Editing filters must invalidate the previous preview');
  await page.fill('#query-input', '');
  await page.click('#scan-btn');
  await waitForShadow(page, '!root.getElementById("delete-btn").disabled');

  await page.click('#delete-btn');
  await waitForShadow(page, '!root.getElementById("modal").hidden');
  const modalTitle = await page.evaluate(() => {
    const root = document.getElementById('wipegram-ui').shadowRoot;
    return root.getElementById('modal-title').textContent;
  });
  assert(/Delete 3 messages/.test(modalTitle), `Unexpected modal title: ${modalTitle}`);

  await waitForShadow(page, 'root.activeElement === root.getElementById("confirm-cancel")');
  await page.keyboard.press('Shift+Tab');
  await waitForShadow(page, 'root.activeElement === root.getElementById("confirm-delete")');
  await page.keyboard.press('Tab');
  await waitForShadow(page, 'root.activeElement === root.getElementById("confirm-cancel")');
  await page.keyboard.press('Escape');
  await waitForShadow(page, 'root.getElementById("modal").hidden && !root.getElementById("panel").hidden');
  assert(await page.evaluate(() => window.__deleted.length === 0), 'Escape must cancel without deleting');
  await page.click('#delete-btn');

  await page.click('#confirm-delete');
  await waitForShadow(page, '/^Done\\. 3 messages deleted\\./.test(root.getElementById("status-text").textContent)', 10_000);

  const afterDelete = await page.evaluate(() => {
    const root = document.getElementById('wipegram-ui').shadowRoot;
    return {
      deleted: window.__deleted,
      status: root.getElementById('status-text').textContent,
      deletedMetric: root.getElementById('metric-deleted').textContent,
      reportDisabled: root.getElementById('report-btn').disabled,
      deleteDisabled: root.getElementById('delete-btn').disabled,
      logText: root.getElementById('log').textContent
    };
  });

  assert(afterDelete.deleted.length === 3, `Expected 3 deleted IDs, got ${afterDelete.deleted.length}`);
  assert(afterDelete.deletedMetric === '3', `Expected deleted metric 3, got ${afterDelete.deletedMetric}`);
  assert(afterDelete.reportDisabled === false, 'Report button should be enabled after a scan');
  assert(afterDelete.deleteDisabled === true, 'Delete button must be disabled after deletion');
  assert(/Delete started/.test(afterDelete.logText), 'Activity log is missing the delete start entry');

  const completed = await page.evaluate(() => {
    const ui = window.__wipegram.ui;
    return { candidates: ui.entries.length, reportMessages: ui.buildReport().messages.length, title: ui.readyTitle.textContent, hidden: ui.readyState.hidden };
  });
  assert(completed.candidates === 0 && completed.reportMessages === 3, 'Completed cleanup must clear stale candidates while preserving report messages');
  assert(completed.title === 'Cleanup finished' && !completed.hidden, 'Completed cleanup needs a visible completion state');

  // New messages after cleanup must be found even while sender search is empty.
  await page.evaluate(freshMessage => {
    window.__messages.push(freshMessage);
    window.__emptySenderSearch = true;
  }, message(103));
  await page.click('#scan-btn');
  await waitForShadow(page, 'root.getElementById("delete-btn").disabled === false', 10_000);
  const freshScan = await page.evaluate(() => ({
    ids: window.__wipegram.ui.entries.map(message => message.id),
    mode: window.__wipegram.ui.scanSnapshot.mode,
    recentPages: window.__wipegram.ui.scanSnapshot.stats.recentHistoryPages,
    deleted: window.__deleted.length
  }));
  assert(freshScan.ids.length === 1 && freshScan.ids[0] === 103, 'Rescan missed fresh message after cleanup');
  assert(freshScan.mode === 'search' && freshScan.recentPages === 1, 'Auto must recover fresh messages with one bounded history page');
  assert(freshScan.deleted === 3, 'Rescanning must not authorize additional deletion');
  await page.evaluate(() => { window.__emptySenderSearch = false; });

  // The >100 messages confirmation gate.
  await page.click('#limit-all');
  assert(await page.inputValue('#max-messages') === '0', 'All preset must remove the cap');
  await page.evaluate(() => {
    window.__messages = Array.from({ length: 120 }, (_, index) => ({
      _: 'message',
      id: 1_000 + index,
      date: 1_700_000_000 + index,
      pFlags: { out: true },
      from_id: { _: 'peerUser', user_id: 999 },
      message: `bulk message ${index}`
    }));
    window.__deleted = [];
  });
  await page.click('#scan-btn');
  await waitForShadow(page, 'root.getElementById("delete-btn").disabled === false', 10_000);
  await page.click('#delete-btn');
  await waitForShadow(page, '!root.getElementById("modal").hidden');
  const confirmState = await page.evaluate(() => {
    const root = document.getElementById('wipegram-ui').shadowRoot;
    return {
      fieldHidden: root.getElementById('confirm-field').hidden,
      confirmDisabled: root.getElementById('confirm-delete').disabled,
      title: root.getElementById('modal-title').textContent
    };
  });
  assert(/Delete 120 messages/.test(confirmState.title), `Unexpected bulk modal title: ${confirmState.title}`);
  assert(confirmState.fieldHidden === false, 'Typed confirmation should be required above 100 messages');
  assert(confirmState.confirmDisabled === true, 'Confirm button must start disabled');

  await waitForShadow(page, 'root.activeElement === root.getElementById("confirm-input")');
  await page.evaluate(() => document.getElementById('telegram-composer').focus());
  await waitForShadow(page, 'root.activeElement === root.getElementById("confirm-input")');
  await page.keyboard.type('DELET');
  assert(await page.isDisabled('#confirm-delete'), 'Partial confirmation must remain disabled');
  await page.keyboard.type('E');
  const keyboardState = await page.evaluate(() => ({
    leaks: window.__keyboardLeaks,
    composer: document.getElementById('telegram-composer').textContent,
    confirmation: document.getElementById('wipegram-ui').shadowRoot.getElementById('confirm-input').value
  }));
  assert(keyboardState.confirmation === 'DELETE', 'Physical typing must stay in confirmation input');
  assert(keyboardState.composer === '', 'Confirmation text leaked into Telegram composer');
  assert(keyboardState.leaks.length === 0, `Telegram received Wipegram keyboard events: ${keyboardState.leaks}`);
  const confirmEnabled = await page.evaluate(() => {
    const root = document.getElementById('wipegram-ui').shadowRoot;
    return root.getElementById('confirm-delete').disabled === false;
  });
  assert(confirmEnabled, 'Confirm button did not enable after typing DELETE');
  if (process.env.WIPEGRAM_UI_SCREENSHOT !== '0') {
    await page.locator('.wg-modal-card').screenshot({ path: path.join(os.tmpdir(), 'wipegram-confirmation.png') });
  }
  await page.click('#confirm-cancel');
  assert(await page.evaluate(() => window.__deleted.length === 0), 'Typed confirmation alone must not delete');
  await waitForShadow(page, 'root.activeElement === root.getElementById("delete-btn")');
  await page.click('#delete-btn');
  await waitForShadow(page, 'root.activeElement === root.getElementById("confirm-input")');
  assert(await page.inputValue('#confirm-input') === '', 'Reopening confirmation must clear previous acceptance');
  await page.keyboard.press('Escape');
  await waitForShadow(page, 'root.getElementById("modal").hidden && !root.getElementById("panel").hidden');

  // Long result lists must scroll inside the panel instead of pushing the
  // footer past the viewport.
  const layout = await page.evaluate(() => {
    const root = document.getElementById('wipegram-ui').shadowRoot;
    const panel = root.getElementById('panel');
    const body = root.querySelector('.wg-review-scroll');
    const footer = root.querySelector('.wg-footer');
    const panelRect = panel.getBoundingClientRect();
    const bodyRect = body.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();
    return {
      viewport: window.innerHeight,
      panelTop: panelRect.top,
      panelBottom: panelRect.bottom,
      bodyTop: bodyRect.top,
      bodyBottom: bodyRect.bottom,
      bodyClient: body.clientHeight,
      bodyScroll: body.scrollHeight,
      bodyOverflow: getComputedStyle(body).overflowY,
      footerBottom: footerRect.bottom
    };
  });
  assert(layout.panelTop >= 0, `Panel starts above the viewport: ${layout.panelTop}`);
  assert(layout.panelBottom <= layout.viewport, `Panel extends past the viewport: ${layout.panelBottom} > ${layout.viewport}`);
  assert(layout.bodyOverflow === 'auto', `Panel body should scroll, got overflow-y: ${layout.bodyOverflow}`);
  assert(layout.bodyScroll > layout.bodyClient, 'Long result list did not produce an internal scroll area');

  await page.evaluate(() => {
    const body = document.getElementById('wipegram-ui').shadowRoot.querySelector('.wg-review-scroll');
    body.scrollTop = body.scrollHeight;
  });
  const footerAfterScroll = await page.evaluate(() => {
    const root = document.getElementById('wipegram-ui').shadowRoot;
    const panelRect = root.getElementById('panel').getBoundingClientRect();
    const headerRect = root.querySelector('.wg-header').getBoundingClientRect();
    const body = root.querySelector('.wg-review-scroll');
    const bodyRect = body.getBoundingClientRect();
    const footerRect = root.querySelector('.wg-footer').getBoundingClientRect();
    return {
      viewport: window.innerHeight,
      panelTop: panelRect.top,
      panelBottom: panelRect.bottom,
      headerTop: headerRect.top,
      headerBottom: headerRect.bottom,
      bodyTop: bodyRect.top,
      bodyBottom: bodyRect.bottom,
      bodyScrollTop: body.scrollTop,
      footerTop: footerRect.top,
      footerBottom: footerRect.bottom
    };
  });
  assert(footerAfterScroll.footerTop >= 0, 'Footer scrolled above the viewport');
  assert(
    footerAfterScroll.footerBottom <= footerAfterScroll.panelBottom + 1
      && footerAfterScroll.footerBottom <= footerAfterScroll.viewport,
    'Footer is not reachable inside the panel'
  );
  assert(
    Math.abs(footerAfterScroll.headerTop - footerAfterScroll.panelTop) <= 1,
    `Panel header scrolled away: header ${footerAfterScroll.headerTop}, panel ${footerAfterScroll.panelTop}`
  );

  const footerLinks = await page.evaluate(() => {
    const root = document.getElementById('wipegram-ui').shadowRoot;
    return { author: root.querySelector('.wg-author').href, license: root.querySelector('.wg-license').href };
  });
  assert(footerLinks.author === 'https://github.com/rafelolv', 'Creator GitHub link is missing');
  assert(footerLinks.license.endsWith('/blob/main/LICENSE'), 'License link is missing');
  const countBeforeClear = await page.locator('.wg-result').count();
  await page.click('#clear-log-btn');
  assert(await page.locator('#log').textContent() === '', 'Clear log must remove log content');
  assert(await page.locator('.wg-result').count() === countBeforeClear, 'Clear log must preserve the preview');

  // Theme + responsive smoke checks.
  await page.evaluate(() => {
    const body = document.getElementById('wipegram-ui').shadowRoot.querySelector('.wg-body');
    body.scrollTop = 0;
  });
  await page.evaluate(() => document.documentElement.classList.add('night'));
  const nightClass = await page.evaluate(() => document.getElementById('wipegram-ui').classList.contains('wg-night'));
  assert(nightClass, 'Dark theme class did not propagate');
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(os.tmpdir(), 'wipegram-ui-test-night.png') });
  if (process.env.WIPEGRAM_UI_SCREENSHOT !== '0') {
    await page.locator('#panel').screenshot({ path: path.join(os.tmpdir(), 'wipegram-panel-dark.png') });
  }

  await page.setViewportSize({ width: 380, height: 720 });
  const mobileBox = await page.evaluate(() => {
    const root = document.getElementById('wipegram-ui').shadowRoot;
    const rect = root.getElementById('panel').getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      width: rect.width,
      viewport: window.innerWidth,
      viewportHeight: window.innerHeight
    };
  });
  assert(mobileBox.left >= 0 && mobileBox.right <= mobileBox.viewport, 'Mobile panel overflows the viewport');
  assert(mobileBox.bottom <= mobileBox.viewportHeight, 'Mobile panel is taller than the viewport');

  if (process.env.WIPEGRAM_UI_SCREENSHOT !== '0') {
    await page.locator('#panel').screenshot({ path: path.join(os.tmpdir(), 'wipegram-panel-mobile.png') });
  }
  const mobileContent = await page.evaluate(() => {
    const root = document.getElementById('wipegram-ui').shadowRoot;
    const body = root.querySelector('.wg-body');
    body.scrollTop = body.scrollHeight;
    return { scrollable: body.scrollHeight > body.clientHeight, width: body.scrollWidth, client: body.clientWidth };
  });
  assert(mobileContent.scrollable && mobileContent.width <= mobileContent.client + 1, 'Mobile workspace must scroll vertically without horizontal clipping');

  await page.setViewportSize({ width: 320, height: 600 });
  const narrow = await page.evaluate(() => {
    const root = document.getElementById('wipegram-ui').shadowRoot;
    const panel = root.getElementById('panel').getBoundingClientRect();
    const close = root.getElementById('close-btn').getBoundingClientRect();
    const brand = root.querySelector('.wg-brand').getBoundingClientRect();
    return { panelRight: panel.right, closeRight: close.right, closeLeft: close.left, brandRight: brand.right };
  });
  assert(narrow.closeRight <= narrow.panelRight && narrow.brandRight <= narrow.closeLeft, 'Narrow screens must keep the title and Close button separate and visible');
  await page.setViewportSize({ width: 380, height: 720 });

  // Admin scope requires an explicit opt-in, verified rights and typed acceptance.
  await page.locator('#include-others').evaluate(input => { input.closest('details').open = true; });
  await page.click('#include-others');
  await waitForShadow(page, 'root.getElementById("include-others").checked === false');
  assert(await page.evaluate(() => window.__deleted.length === 0), 'Private chat cannot enable moderation');
  await page.evaluate(own => {
    window.__peer = { _: 'channel', id: 55, title: 'Admin group', pFlags: { megagroup: true, creator: true } };
    window.appImManager.chat.peerId = -55;
    window.__messages = [own, { ...own, id: 1999, from_id: { _: 'peerUser', user_id: 7 }, pFlags: {} }];
    window.__deleted = [];
    window.__wipegram.ui.refreshTarget({ quiet: true });
  }, message(2000));
  await page.click('#scan-btn');
  await waitForShadow(page, 'root.getElementById("delete-btn").disabled === false');
  assert(await page.evaluate(() => window.__wipegram.ui.entries.length === 1), 'Admin rights alone must not include other authors');
  await page.check('#include-others');
  await waitForShadow(page, 'root.getElementById("delete-btn").disabled === true');
  assert(await page.evaluate(() => window.__wipegram.ui.entries.length === 0), 'Changing author scope must clear the preview');
  await page.click('#scan-btn');
  await waitForShadow(page, 'root.getElementById("metric-found").textContent === "2" && !root.getElementById("delete-btn").disabled');
  await page.click('#delete-btn');
  await waitForShadow(page, '!root.getElementById("confirm-field").hidden && root.getElementById("confirm-delete").disabled');
  assert((await page.textContent('#modal-title')).startsWith('Admin:'), 'Admin confirmation must identify broad scope');
  if (process.env.WIPEGRAM_UI_SCREENSHOT !== '0') {
    await page.locator('.wg-modal-card').screenshot({ path: path.join(os.tmpdir(), 'wipegram-admin-confirmation.png') });
  }
  await page.keyboard.type('DELETE');
  // Change permission and invoke acceptance in the same task, before polling
  // can close the modal; this exercises the final permission guard itself.
  await page.evaluate(() => {
    window.__peer.pFlags.creator = false;
    document.getElementById('wipegram-ui').shadowRoot.getElementById('confirm-delete').click();
  });
  await waitForShadow(page, 'root.getElementById("delete-btn").disabled && !root.getElementById("include-others").checked');
  assert(await page.evaluate(() => window.__deleted.length === 0), 'Revoked admin permission must prevent deletion');
  await page.evaluate(() => {
    window.__peer.pFlags.creator = true;
    window.__wipegram.ui.refreshTarget({ quiet: true });
  });
  await page.check('#include-others');
  await page.click('#scan-btn');
  await waitForShadow(page, 'root.getElementById("metric-found").textContent === "2" && !root.getElementById("delete-btn").disabled');
  await page.click('#delete-btn');
  await waitForShadow(page, 'root.activeElement === root.getElementById("confirm-input")');
  await page.keyboard.type('DELETE');
  await page.click('#confirm-delete');
  await waitForShadow(page, 'root.getElementById("metric-deleted").textContent === "2"');
  assert(await page.evaluate(() => window.__deleted.includes(1999)), 'Explicit authorized admin mode must allow other authors');
  await page.click('#close-btn');
  await page.click('#wipegram-launcher');
  await waitForShadow(page, '!root.getElementById("panel").hidden && !root.getElementById("include-others").checked');
  await page.evaluate(() => {
    window.__peer = { _: 'user', id: 777, first_name: 'Test', last_name: 'Chat' };
    window.appImManager.chat.peerId = 777;
    window.__messages = Array.from({ length: 120 }, (_, index) => ({ _: 'message', id: 1000 + index, date: 1700000000 + index, pFlags: { out: true }, from_id: { _: 'peerUser', user_id: 999 }, message: `bulk message ${index}` }));
    window.__deleted = [];
    window.__wipegram.ui.refreshTarget({ quiet: true });
  });
  await page.click('#scan-btn');
  await waitForShadow(page, 'root.getElementById("metric-found").textContent === "120" && !root.getElementById("delete-btn").disabled');

  // Changing accounts in the same chat must invalidate an accepted preview,
  // including the interval before the UI's polling timer catches the change.
  await page.click('#delete-btn');
  await waitForShadow(page, '!root.getElementById("modal").hidden');
  await page.fill('#confirm-input', 'DELETE');
  await page.evaluate(() => {
    window.rootScope.myId = 1000;
    document.getElementById('wipegram-ui').shadowRoot.getElementById('confirm-delete').click();
  });
  await waitForShadow(page, 'root.getElementById("delete-btn").disabled === true');
  assert(await page.evaluate(() => window.__deleted.length === 0), 'Account switch reused another account\'s preview');

  // Selection must work beyond the first 200 rendered rows and delete only
  // the selected subset, without losing unselected messages in the report.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.evaluate(messages => {
    window.rootScope.myId = 999;
    window.__messages = messages;
    window.__deleted = [];
    window.__wipegram.ui.refreshTarget({ quiet: true });
  }, Array.from({ length: 501 }, (_, i) => message(1000 + i)));
  await page.click('#limit-all');
  await page.click('#scan-btn');
  await waitForShadow(page, 'root.getElementById("metric-found").textContent === "501" && !root.getElementById("delete-btn").disabled', 15000);
  await page.click('#results-toggle');
  await page.click('#results-next');
  await page.uncheck('[data-message-id="1200"] .wg-result-select');
  await page.click('#results-next');
  await page.click('#results-prev');
  assert(await page.isChecked('[data-message-id="1200"] .wg-result-select') === false, 'Selection must survive page navigation');
  await page.click('#results-next');
  await page.click('#select-none-btn');
  assert(await page.isDisabled('#delete-btn'), 'Empty selection must disable deletion');
  await page.check('[data-message-id="1100"] .wg-result-select');
  assert(await page.textContent('#selection-count') === '1 of 501 selected', 'Selected count must include offscreen matches');
  if (process.env.WIPEGRAM_UI_SCREENSHOT !== '0') {
    await page.evaluate(() => {
      const ui = window.__wipegram.ui;
      if (ui.privacy) ui.togglePrivacy();
      ui.shadow.querySelector('.wg-review-scroll').scrollTop = 0;
    });
    await page.locator('#panel').screenshot({ path: path.join(os.tmpdir(), 'wipegram-panel-selection.png') });
  }
  await page.click('#delete-btn');
  assert((await page.textContent('#modal-title')).includes('1 message'), 'Confirmation must use selected count, not all matches');
  assert(await page.locator('#confirm-field').isHidden(), 'One own selected message must not inherit the >100 gate from unselected results');
  assert((await page.textContent('#modal-warning')).includes('Pinned messages are included'), 'Confirmation must show disabled pin protection');
  await page.evaluate(() => { window.__holdDelete = true; });
  await page.click('#confirm-delete');
  await page.waitForFunction(() => typeof window.__releaseDelete === 'function');
  assert(await page.textContent('#batch-label') === 'Batch 1 of 1', 'Actual batch progress must be visible');
  assert(await page.locator('.wg-result-select').first().isDisabled(), 'Selection must freeze while deleting');
  await page.waitForTimeout(1100);
  assert(!/Elapsed 0s/.test(await page.textContent('#elapsed-label')), 'Elapsed time must advance during a pending request');
  await page.evaluate(() => window.__wipegram.ui.handleEngineEvent({ type: 'flood', seconds: 3, until: Date.now() + 2200 }));
  await waitForShadow(page, '/Retry in [12]s/.test(root.getElementById("wait-label").textContent)');
  await page.evaluate(() => { window.__holdDelete = false; window.__releaseDelete(); });
  await waitForShadow(page, 'root.getElementById("metric-deleted").textContent === "1" && root.getElementById("scan-btn").hidden === false');
  const selectionOutcome = await page.evaluate(() => ({
    ids: window.__deleted,
    remaining: window.__messages.length,
    report: window.__wipegram.ui.buildReport(),
    timer: window.__wipegram.ui.progressTimer,
    waiting: window.__wipegram.ui.waitLabel.hidden,
    found: window.__wipegram.ui.metricFound.textContent
  }));
  assert(JSON.stringify(selectionOutcome.ids) === '[1100]' && selectionOutcome.remaining === 500, 'Deletion must exclude every unchecked message');
  assert(selectionOutcome.found === '501', 'Found counter must keep all matches rather than shrink to the selection');
  assert(selectionOutcome.report.selection.count === 1 && selectionOutcome.report.messages.length === 501, 'Report must distinguish selection from all scanned matches');
  assert(selectionOutcome.report.messages.filter(m => m.selected).length === 1, 'Report selection flags must remain after cleanup');
  assert(selectionOutcome.timer === null && selectionOutcome.waiting, 'Finished operations must stop timers and clear countdowns');

  // Web A should only display the unsupported notice.
  const aPage = await context.newPage();
  const aErrors = [];
  aPage.on('pageerror', error => aErrors.push(String(error)));
  await aPage.route('https://web.telegram.org/a/', route => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: HARNESS
  }));
  await aPage.goto('https://web.telegram.org/a/');
  if (!EXTENSION) await aPage.addScriptTag({ path: SCRIPT });
  await aPage.waitForFunction(() => {
    const host = document.getElementById('wipegram-unsupported');
    return !!host?.shadowRoot?.textContent?.includes('Web A is not supported');
  }, { timeout: 5_000 });
  const aBooted = await aPage.evaluate(() => !!window.__wipegram);
  assert(aBooted === false, 'Wipegram must not boot on Web A');

  assert(pageErrors.length === 0, `Page errors: ${pageErrors.join(' | ')}`);
  assert(aErrors.length === 0, `Web A page errors: ${aErrors.join(' | ')}`);

  console.log(`${EXTENSION ? 'Chromium extension' : 'Userscript'} UI test passed (simulated Telegram).`);
  console.log(`Screenshot: ${SCREENSHOT}`);
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
