import { createNodes } from './dom.js';
import logoTemplate from './logo.html?dom';

const STYLE_ID = 'wipegram-launcher-styles';

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .wipegram-launcher {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .wipegram-launcher-tile { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 8px; background: #101211; border: 1px solid #4ade80; }
    .wipegram-launcher-mark { display: block; width: 28px; height: 28px; }
    .wipegram-launcher:hover .wipegram-launcher-tile { box-shadow: 0 0 0 3px #4ade8026; }
    .wipegram-fab { position: fixed; bottom: calc(88px + env(safe-area-inset-bottom, 0px)); right: 18px; z-index: 2147482990; display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 14px 0 7px; border: 1px solid #4ade80; border-radius: 12px; background: #101211; color: #e8ebe9; box-shadow: 0 4px 18px #0004; font: 600 13px/1 system-ui, sans-serif; cursor: pointer; transition: transform 0.12s ease; }
    .wipegram-fab .wipegram-launcher-tile { border: 0; }
    .wipegram-fab:hover { transform: translateY(-2px); background: #1b1e1c; }
    .wipegram-fab:focus-visible, .wipegram-launcher:focus-visible { outline: 3px solid #4ade80; outline-offset: 3px; }
    @media (max-width: 680px) { .wipegram-fab { right: 12px; width: 44px; padding: 0; justify-content: center; } .wipegram-fab-label { display: none; } }
    @media (prefers-reduced-motion: reduce) { .wipegram-fab { transition: none; } }
  `;
  (document.head || document.documentElement).appendChild(style);
}

function makeGlyph() {
  const glyph = document.createElement('span');
  glyph.className = 'wipegram-launcher-tile';
  glyph.setAttribute('aria-hidden', 'true');
  glyph.appendChild(createNodes(logoTemplate));
  return glyph;
}

/**
 * Adds a native-looking W button to the chat topbar. Telegram re-renders the
 * topbar often, so a throttled observer plus a low-frequency interval put the
 * button back when needed. A second floating button stays available whenever
 * a chat is open, including layouts without `.chat-utils`.
 */
export function createWipegramLauncher({ onOpen }) {
  injectStyles();

  const button = document.createElement('button');
  button.type = 'button';
  button.id = 'wipegram-launcher';
  button.className = 'btn-icon wipegram-launcher';
  button.title = 'Wipegram — delete your own messages (Alt+Shift+W)';
  button.setAttribute('aria-label', 'Open Wipegram');
  button.appendChild(makeGlyph());

  const fab = document.createElement('button');
  fab.type = 'button';
  fab.id = 'wipegram-fab';
  fab.className = 'wipegram-fab';
  fab.title = 'Open Wipegram (Alt+Shift+W)';
  fab.setAttribute('aria-label', 'Open Wipegram');
  fab.appendChild(makeGlyph());
  const label = document.createElement('span');
  label.className = 'wipegram-fab-label';
  label.textContent = 'Wipegram';
  fab.appendChild(label);

  const open = event => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    onOpen(button);
  };

  button.addEventListener('click', open);
  fab.addEventListener('click', open);

  let destroyed = false;
  let scheduled = false;
  let observer = null;
  let timer = null;

  const sync = () => {
    if (destroyed || !document.body) return;
    const utils = document.querySelector('.chat-utils');

    if (utils) {
      if (!utils.contains(button)) {
        const more = utils.lastElementChild;
        utils.insertBefore(button, more && more !== button ? more : null);
      }
    } else {
      button.remove();
    }
    const chatOpen = !!window.appImManager?.chat?.peerId;
    if (chatOpen && !fab.isConnected) {
      document.body.appendChild(fab);
    } else if (!chatOpen && fab.isConnected) {
      fab.remove();
    }
  };

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      sync();
    });
  };

  observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true });
  timer = setInterval(sync, 1_500);

  const onKeydown = event => {
    if (!event.altKey || !event.shiftKey || event.ctrlKey || event.metaKey) return;
    if (event.code !== 'KeyW' && event.key.toLowerCase() !== 'w') return;

    const path = event.composedPath?.() || [];
    const target = path[0] || event.target;
    if (target instanceof HTMLElement) {
      if (target.isContentEditable) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
    }

    event.preventDefault();
    event.stopPropagation();
    onOpen(button);
  };

  window.addEventListener('keydown', onKeydown, true);
  sync();

  return {
    button,
    fab,
    sync,
    destroy() {
      destroyed = true;
      observer?.disconnect();
      if (timer) clearInterval(timer);
      window.removeEventListener('keydown', onKeydown, true);
      button.remove();
      document.getElementById(STYLE_ID)?.remove();
    }
  };
}
