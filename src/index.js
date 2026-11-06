import { WipegramEngine } from './engine.js';
import { createWipegramLauncher } from './launcher.js';
import { TelegramApi, waitForTelegram } from './telegram.js';
import { WipegramUI } from './ui.js';
import { showUnsupportedNotice } from './unsupported.js';

const VERSION = typeof __VERSION__ === 'undefined' ? 'dev' : __VERSION__;

function isWebK() {
  return /^\/k(?:\/|$)/.test(location.pathname);
}

function isWebA() {
  return /^\/a(?:\/|$)/.test(location.pathname);
}

async function boot() {
  if (window.__wipegram?.ui) return;

  try {
    await waitForTelegram(60_000);
  } catch (error) {
    console.warn('[Wipegram] Telegram Web K did not finish loading.', error);
    return;
  }

  if (window.__wipegram?.ui) return;

  const api = new TelegramApi();
  const engine = new WipegramEngine({ api });
  const ui = new WipegramUI({ api, engine });
  const launcher = createWipegramLauncher({ onOpen: () => ui.toggle() });

  ui.setLauncher(launcher.button, launcher.fab);
  ui.mount();

  const beforeUnload = () => {
    ui.destroy();
    launcher.destroy();
  };
  window.addEventListener('beforeunload', beforeUnload, { once: true });
  window.addEventListener('pagehide', beforeUnload, { once: true });

  window.__wipegram = {
    version: VERSION,
    api,
    engine,
    ui,
    launcher,
    destroy() {
      window.removeEventListener('beforeunload', beforeUnload);
      window.removeEventListener('pagehide', beforeUnload);
      ui.destroy();
      launcher.destroy();
      delete window.__wipegram;
    }
  };

  console.info(`[Wipegram] v${VERSION} ready. Press Alt+Shift+W or use the W button in the chat topbar.`);
}

if (isWebA()) {
  showUnsupportedNotice();
} else if (isWebK()) {
  boot();
}
