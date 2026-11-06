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
      if (method === 'messages.search') {
        if (params?.filter?._ === 'inputMessagesFilterPinned') {
          return { _: 'messages.messages', messages: [], count: 0 };
        }

        const sorted = [...window.__messages].sort((a, b) => b.id - a.id);
        const offsetId = params?.offset_id || 0;
        const remaining = offsetId ? sorted.filter(item => item.id < offsetId) : sorted;
        return {
          _: 'messages.messages',
          messages: remaining.slice(0, params?.limit || 100),
          count: sorted.length
        };
      }

      if (method === 'messages.deleteMessages') {
        window.__deleted.push(...(params?.id || []));
        return { _: 'messages.affectedMessages', pts: 1, pts_count: params?.id?.length || 0 };
      }

      if (method === 'channels.deleteMessages') {
        window.__deleted.push(...(params?.id || []));
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
    window.apiManagerProxy = { getPeer: () => ({ ...peer, access_hash: '1' }) };
    window.appImManager = { chat };
  }, [message(100), message(101), message(102)]);

  if (!EXTENSION) await page.addScriptTag({ path: SCRIPT });
  await page.waitForSelector('#wipegram-launcher', { timeout: 5_000 });
  assert(await page.evaluate(() => window.__deleted.length === 0), 'Startup must not delete messages');
  // Userscript and extension share one runtime even when both are installed.
  await page.addScriptTag({ path: SCRIPT });
  assert(await page.locator('#wipegram-ui').count() === 1, 'Duplicate runtime mounted');

  await page.click('#wipegram-launcher');
  await waitForShadow(page, '!root.getElementById("panel").hidden');
  await waitForShadow(page, 'root.getElementById("scan-btn").disabled === false');

  const targetName = await page.evaluate(() => {
    const root = document.getElementById('wipegram-ui').shadowRoot;
    return root.getElementById('target-name').textContent;
  });
  assert(targetName === 'Test Chat', `Unexpected target name: ${targetName}`);

  // Keyboard shortcut toggles the panel.
  await page.keyboard.press('Alt+Shift+W');
  await waitForShadow(page, 'root.getElementById("panel").hidden === true');
  await page.keyboard.press('Alt+Shift+W');
  await waitForShadow(page, 'root.getElementById("panel").hidden === false');
  await waitForShadow(page, 'root.getElementById("scan-btn").disabled === false');

  if (process.env.WIPEGRAM_UI_SCREENSHOT !== '0') {
    await page.waitForTimeout(250);
    await page.screenshot({ path: SCREENSHOT });
  }

  await page.click('#scan-btn');
  await waitForShadow(page, 'root.getElementById("delete-btn").disabled === false', 10_000);

  const afterScan = await page.evaluate(() => {
    const root = document.getElementById('wipegram-ui').shadowRoot;
    return {
      status: root.getElementById('status-text').textContent,
      found: root.getElementById('metric-found').textContent,
      results: root.querySelectorAll('.wg-result').length,
      deleteLabel: root.getElementById('delete-label').textContent
    };
  });
  assert(afterScan.found === '3', `Expected 3 found messages, got ${afterScan.found}`);
  assert(afterScan.results === 3, `Expected 3 result rows, got ${afterScan.results}`);
  assert(/ready to delete/i.test(afterScan.status), `Unexpected scan status: ${afterScan.status}`);
  assert(/Delete 3 messages/.test(afterScan.deleteLabel), `Unexpected delete label: ${afterScan.deleteLabel}`);

  await page.click('#privacy-btn');
  const privacyClass = await page.evaluate(() => document.getElementById('wipegram-ui').classList.contains('wg-private'));
  assert(privacyClass === true, 'Privacy mode did not apply');

  await page.click('#delete-btn');
  await waitForShadow(page, '!root.getElementById("modal").hidden');
  const modalTitle = await page.evaluate(() => {
    const root = document.getElementById('wipegram-ui').shadowRoot;
    return root.getElementById('modal-title').textContent;
  });
  assert(/Delete 3 messages/.test(modalTitle), `Unexpected modal title: ${modalTitle}`);

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

  // The >100 messages confirmation gate.
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

  await page.fill('#confirm-input', 'DELETE');
  const confirmEnabled = await page.evaluate(() => {
    const root = document.getElementById('wipegram-ui').shadowRoot;
    return root.getElementById('confirm-delete').disabled === false;
  });
  assert(confirmEnabled, 'Confirm button did not enable after typing DELETE');
  await page.click('#confirm-cancel');

  // Long result lists must scroll inside the panel instead of pushing the
  // footer past the viewport.
  const layout = await page.evaluate(() => {
    const root = document.getElementById('wipegram-ui').shadowRoot;
    const panel = root.getElementById('panel');
    const body = root.querySelector('.wg-body');
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
    const body = document.getElementById('wipegram-ui').shadowRoot.querySelector('.wg-body');
    body.scrollTop = body.scrollHeight;
  });
  const footerAfterScroll = await page.evaluate(() => {
    const root = document.getElementById('wipegram-ui').shadowRoot;
    const panelRect = root.getElementById('panel').getBoundingClientRect();
    const headerRect = root.querySelector('.wg-header').getBoundingClientRect();
    const body = root.querySelector('.wg-body');
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

  // Changing accounts in the same chat must invalidate an accepted preview,
  // including the interval before the UI's polling timer catches the change.
  await page.click('#delete-btn');
  await waitForShadow(page, '!root.getElementById("modal").hidden');
  await page.fill('#confirm-input', 'DELETE');
  await page.evaluate(() => { window.rootScope.myId = 1000; });
  await page.click('#confirm-delete');
  await waitForShadow(page, 'root.getElementById("delete-btn").disabled === true');
  assert(await page.evaluate(() => window.__deleted.length === 0), 'Account switch reused another account\'s preview');

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
