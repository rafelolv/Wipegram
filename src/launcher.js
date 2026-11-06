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

    .wipegram-launcher-tile {
      display: grid;
      place-items: center;
      width: 24px;
      height: 24px;
      border-radius: 4px;
      background: transparent;
      box-shadow: none;
      color: #3390ec;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 12.5px;
      font-weight: 800;
      line-height: 1;
      transition: transform 0.12s ease, box-shadow 0.12s ease;
    }

    .wipegram-launcher:hover .wipegram-launcher-tile {
      background: rgba(51, 144, 236, 0.1);
    }

    .wipegram-fab {
      position: fixed;
      top: 66px;
      right: 14px;
      z-index: 2147482990;
      display: grid;
      place-items: center;
      width: 42px;
      height: 42px;
      padding: 0;
      border: 1px solid rgba(16, 24, 40, 0.12);
      border-radius: 50%;
      background: #ffffff;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.22);
      cursor: pointer;
      transition: transform 0.12s ease, box-shadow 0.12s ease;
    }

    .wipegram-fab:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 28px rgba(15, 23, 42, 0.28);
    }

    html.night .wipegram-fab,
    html.tinted .wipegram-fab,
    body.night .wipegram-fab,
    body.tinted .wipegram-fab {
      border-color: rgba(255, 255, 255, 0.12);
      background: #212121;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

function makeGlyph() {
  const glyph = document.createElement('span');
  glyph.className = 'wipegram-launcher-tile';
  glyph.setAttribute('aria-hidden', 'true');
  glyph.textContent = 'W';
  return glyph;
}

/**
 * Adds a native-looking W button to the chat topbar. Telegram re-renders the
 * topbar often, so a throttled observer plus a low-frequency interval put the
 * button back when needed. A floating fallback covers layouts without
 * `.chat-utils`.
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
      fab.remove();
      if (!utils.contains(button)) {
        const more = utils.lastElementChild;
        utils.insertBefore(button, more && more !== button ? more : null);
      }
      return;
    }

    button.remove();
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
      fab.remove();
      document.getElementById(STYLE_ID)?.remove();
    }
  };
}
