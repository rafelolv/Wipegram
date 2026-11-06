# Browser extensions

The userscript is the primary distribution. Both extensions ship the generated `wipegram.user.js` byte for byte: the same panel, filtering, confirmation and deletion engine. No separate login, bot, background process, extra API permission or remote executable code is used.

## Build

```sh
npm ci
npm run check
```

Outputs for version 0.2.2:

- `wipegram.user.js`: install in Tampermonkey or Violentmonkey.
- `dist/chromium/`: load as an unpacked Chromium extension.
- `dist/firefox/`: load as a temporary Firefox extension.
- `dist/wipegram-chromium-0.2.2.zip` and `dist/wipegram-firefox-0.2.2.zip`: unsigned local packages.
- `dist/SHA256SUMS`: checksums of both ZIPs.

ZIPs have sorted entries and fixed timestamps. Rebuilding unchanged sources with the same toolchain produces identical archives. Outputs in `dist/` are ignored by Git; edit sources and regenerate.

## Chrome, Brave and Edge

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**, then select `dist/chromium`.
4. Reload Telegram Web K, open a chat, then click **W** or press `Alt+Shift+W`.

Requires Chromium 111 or newer. If using a ZIP, extract it first and load the extracted folder. To update, rebuild or replace the folder, click **Reload** on the extension card, then reload Telegram.

## Firefox

1. Use Firefox 142 or newer.
2. Open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on** and select `dist/firefox/manifest.json`.
4. Reload Telegram Web K and open the **W** panel.

Temporary add-ons disappear after a browser restart. ZIPs are unsigned and are not permanent production add-ons; permanent installation in standard Firefox requires Mozilla signing. No store submission, signing or publication is performed by these build commands.

## Runtime scope

Content scripts match only `https://web.telegram.org/k` and `/a`, including their subpaths, in the top frame. Web A displays only an unsupported-client notice. Code runs in `MAIN` world to reach Telegram's existing page bridge; the popup has no scripts, deletion buttons or access to account data.

Do not enable a userscript and extension simultaneously. Duplicate injection in one page is guarded, but separate tabs can still run independently and share Telegram account rate limits. Keep one cleanup running at a time.

## Verification and limits

- `npm run check`: unit tests, production build, both manifests, exact runtime equality, ZIP entries and checksums.
- `npm run test:ui`: real Chromium, userscript injected into a simulated Telegram page.
- `npm run test:extensions:browser`: real Chromium with the unpacked extension installed in a temporary profile, simulated Telegram globals and API responses.
- Browser checks cover startup, duplicate injection, account switches before confirmation, scanning, preview, confirmation, deletion, typed confirmation for more than 100 messages, report availability, light/dark themes, mobile bounds and the Web A notice.
- Firefox packaging is statically checked. Firefox runtime behavior and store acceptance are not established by Chromium tests.
- Firefox package also passed `addons-linter` 10.14.0 with `--warnings-as-errors`: zero errors, notices and warnings. Templates are parsed at build time and rendered through DOM creation APIs.
- Automated tests do not authenticate to Telegram and do not delete real messages. Live compatibility and server-side revocation remain to be validated manually with a small disposable conversation.

Technical references: [Chrome content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts) and [Firefox content script manifests](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_scripts).
