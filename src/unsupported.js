import noticeTemplate from './notice.html?dom';
import { createNodes } from './dom.js';

const DISMISS_KEY = 'wipegram.unsupported.dismissed';
const HOST_ID = 'wipegram-unsupported';

const STYLES = `
  :host {
    all: initial;
    position: fixed;
    right: 16px;
    bottom: 16px;
    z-index: 2147483000;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color-scheme: light;
  }

  * { box-sizing: border-box; }

  .card {
    display: flex;
    gap: 12px;
    width: min(370px, calc(100vw - 32px));
    padding: 15px;
    border: 1px solid rgba(16, 24, 40, 0.1);
    border-radius: 14px;
    background: #ffffff;
    color: #16181c;
    box-shadow: 0 18px 60px rgba(15, 23, 42, 0.24), 0 2px 10px rgba(15, 23, 42, 0.08);
    animation: in 0.18s ease-out;
  }

  .logo {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    flex: 0 0 auto;
    border-radius: 12px;
    background: linear-gradient(135deg, #3390ec, #7b5cf0);
    color: #ffffff;
    font-size: 19px;
    font-weight: 800;
  }

  .content { min-width: 0; flex: 1; }

  .title {
    margin: 1px 0 4px;
    font-size: 14px;
    font-weight: 700;
    line-height: 1.3;
  }

  .text {
    margin: 0;
    color: #707579;
    font-size: 12px;
    line-height: 1.5;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
  }

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 30px;
    padding: 0 11px;
    border: 0;
    border-radius: 8px;
    background: #3390ec;
    color: #ffffff;
    font: inherit;
    font-size: 12px;
    font-weight: 650;
    text-decoration: none;
    cursor: pointer;
  }

  .button:hover { background: #2b7fce; }

  .dismiss {
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: #8a8f94;
    font: inherit;
    font-size: 11.5px;
    cursor: pointer;
    padding: 3px 5px;
  }

  .dismiss:hover { background: rgba(16, 24, 40, 0.06); color: #16181c; }

  .close {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 26px;
    height: 26px;
    border: 0;
    border-radius: 7px;
    background: transparent;
    color: #8a8f94;
    font: inherit;
    font-size: 17px;
    line-height: 1;
    cursor: pointer;
  }

  .close:hover { background: rgba(16, 24, 40, 0.06); color: #16181c; }

  @media (prefers-color-scheme: dark) {
    .card { border-color: rgba(255, 255, 255, 0.1); background: #212121; color: #f2f2f2; }
    .text { color: #a2a2a2; }
    .dismiss { color: #8b8b8b; }
    .dismiss:hover, .close:hover { background: rgba(255, 255, 255, 0.08); color: #f2f2f2; }
  }

  html.night .card, :host(.night) .card {
    border-color: rgba(255, 255, 255, 0.1);
    background: #212121;
    color: #f2f2f2;
  }

  @keyframes in {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .card { animation: none; }
  }
`;

export function showUnsupportedNotice() {
  try {
    if (sessionStorage.getItem(DISMISS_KEY) === '1') return;
  } catch {
    /* storage can be unavailable */
  }
  if (document.getElementById(HOST_ID)) return;

  const host = document.createElement('div');
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = STYLES;
  shadow.append(style, createNodes(noticeTemplate));

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
    host.remove();
  };

  shadow.querySelector('.dismiss').addEventListener('click', dismiss);
  shadow.querySelector('.close').addEventListener('click', dismiss);
  (document.body || document.documentElement).appendChild(host);

  const isNight = () => document.documentElement.classList.contains('night')
    || document.body?.classList.contains('night');
  const update = () => host.classList.toggle('night', isNight());
  update();
  const observer = new MutationObserver(update);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  if (document.body) {
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }
}
