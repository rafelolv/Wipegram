# Wipegram

Wipegram is a userscript for **Telegram Web K** that finds and bulk-deletes **your own messages** in the chat you have open. It follows the same idea as [Wipecord](https://github.com/rafelolv/Wipecord): scan first, review what matched, then delete in controlled batches. Local Chromium and Firefox extensions use the identical userscript runtime.

Everything happens inside your logged-in Telegram Web tab. Wipegram does not extract session keys, does not send your data to a server, and does not require a bot token.

> **Wipegram is unofficial.** It is not affiliated with Telegram. Deletions are permanent and Telegram cannot undo them.

New to Wipegram? Read the [user guide](docs/USER-GUIDE.md). For release history, see the [changelog](CHANGELOG.md).

<p align="center">
  <img src="docs/preview-light.png" alt="Wipegram panel in light theme" width="420">
  <img src="docs/preview-dark.png" alt="Wipegram panel in dark theme after a scan" width="420">
</p>

## Features

- **Your messages only.** Every candidate is checked against your account before it is shown or deleted.
- **Scan before delete.** Filters, message previews, metrics, and a JSON report let you verify the result first.
- **Controlled batching.** Deletes in batches of up to 100 IDs, a conservative application limit.
- **Two scan strategies.** Fast sender search by default, with an automatic full-history fallback when a chat does not support search-by-sender.
- **Pinned-message protection.** Pinned messages are skipped by default; if their IDs cannot be loaded, the scan stops instead of risking them.
- **Rate-limit handling.** `FLOOD_WAIT` / `SLOWMODE_WAIT` pauses are respected and reported. Waits longer than 15 minutes stop the operation.
- **Safe cancellation.** Stop at any time and keep partial statistics. Switching chats aborts the operation.
- **Account isolation.** Account changes invalidate previews; each API request verifies the original account. Anonymous messages and posts sent as a channel are excluded.
- **Forum/topic aware.** Scope a scan to the current topic or to the whole forum.
- **Privacy mode.** Blur chat names and message previews when someone is looking over your shoulder.
- **Local report.** Download a JSON file with filters, statistics, message IDs, dates, and previews.
- **Light/dark theme, mobile layout, keyboard shortcut.** `Alt+Shift+W` opens the panel.

## Requirements

- A desktop browser with a userscript manager:
  - [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Edge, Firefox, Safari, Opera)
  - [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Edge, Firefox)
- **Telegram Web K**: <https://web.telegram.org/k/>
- An account logged in to Web K.

Web A (`https://web.telegram.org/a/`) is intentionally not supported. It does not expose the same in-page API bridge, so Wipegram only shows a notice there.

## Install

### From the built userscript

1. Install Tampermonkey or Violentmonkey.
2. [Install wipegram.user.js from main](https://raw.githubusercontent.com/rafelolv/Wipegram/main/wipegram.user.js), or download a fixed version from [GitHub releases](https://github.com/rafelolv/Wipegram/releases).
3. Confirm the installation in your userscript manager.
4. Open <https://web.telegram.org/k/>, log in, and open any chat.

A small **W** button appears in the chat topbar (or as a floating button in layouts without a topbar). Click it, or press `Alt+Shift+W`.

### From source

```bash
npm ci
npm run build
```

Then install the generated `wipegram.user.js` from the project root in Tampermonkey/Violentmonkey. Re-run `npm run build` after changing anything in `src/`.

### Browser extension alternative

Run `npm run build:extensions`. For Chrome, Brave or Edge, open the browser's extensions page, enable **Developer mode**, choose **Load unpacked**, and select `dist/chromium`.

For Firefox 142+, open `about:debugging#/runtime/this-firefox`, choose **Load Temporary Add-on**, and select `dist/firefox/manifest.json`. Temporary installation ends when Firefox restarts. The generated Firefox ZIP is unsigned; normal permanent installation requires Mozilla signing.

Reload Telegram after installing. The extension popup explains how to open the same **W** panel; deletion still requires review and confirmation inside the chat. Enable only one Wipegram installation at a time. See [extension installation and validation](docs/EXTENSION.md).

## Quick start

1. Open the chat, group, forum topic, or Saved Messages view you want to clean.
2. Click the **W** button in the topbar.
3. Choose filters (message type, text, regex, dates, pin handling).
4. Press **Scan messages**.
5. Review **Found messages**, the counts, and the activity log. Use **Report** if you want a JSON copy.
6. Press **Delete N messages**, review the confirmation, and confirm.
7. For more than 100 messages, type `DELETE` to enable the final button.
8. Press **Stop** if you change your mind. Messages already deleted cannot be restored.

## What is supported

| Target | Support |
| --- | --- |
| Private chats | ✅ |
| Basic groups | ✅ |
| Supergroups | ✅ |
| Forum topic (current topic) | ✅ |
| Forum (all topics) | ✅ |
| Saved Messages (main view) | ✅ |
| Saved sub-conversations | ❌ Blocked |
| Broadcast channels | ❌ Blocked: personal authorship of channel posts cannot be verified |
| Direct messages to a channel (monoforum) | ❌ Blocked |
| Telegram Web A | ❌ Notice only |
| Secret chats | Not available in Web K |

Broadcast posts appear under the channel identity, including posts published by an administrator. Wipegram does not infer personal authorship from that identity. Open the channel's linked discussion group to remove your personally authored comments. Saved sub-conversations are blocked because they require a different history scope. If a chat is not fully loaded yet, close and reopen it in Telegram, then try again.

## Filters

| Filter | Behavior |
| --- | --- |
| **Message type** | All, text, photos, videos, files, links, music, voice, or GIFs. Sender-search mode uses Telegram's server-side media filter; history mode classifies locally. |
| **Text contains** | Telegram search query in sender-search mode; local case-insensitive substring in history mode. |
| **Regex pattern** | JavaScript regular expression, case-insensitive, always checked locally. Example: `^hello\|invoice`. Invalid patterns are rejected before scanning. |
| **Newer than / Older than** | Local date and time bounds. Both ends are inclusive to the second. |
| **Skip pinned messages** | On by default. Pinned IDs are loaded before scanning. If they cannot be loaded, the scan aborts with `PINNED_UNAVAILABLE` rather than risk deleting a pinned message. |
| **Current topic only** | Visible in forum topics. When off, Wipegram scans the whole forum. |
| **Max messages** | Stops scanning after N matches. `0` or empty means unlimited. |
| **Scan method** | `Auto` (sender search, then history fallback), `Telegram sender search`, or `Full history walk`. |
| **Pause between batches / pages** | Optional extra delays in milliseconds, on top of Telegram's own rate limits. |

## How it works

Wipegram talks to the Telegram Web K instance that is already open in your tab:

1. It reads the current chat from `window.appImManager.chat` and checks that the chat type is safe.
2. It reads the synchronous `window.apiManagerProxy.getPeer` mirror and builds an input peer using the loaded peer ID and access hash. Web K's worker-backed managers are asynchronous and cannot be used for synchronous target detection.
3. It scans with `messages.search` (sender = yourself) or `messages.getHistory` / `messages.getReplies`.
4. It filters the results locally for ownership, dates, pins, text, and regex.
5. It deletes with `messages.deleteMessages { revoke: true }` for private chats and basic groups, or `channels.deleteMessages` for supergroups and channels.
6. It waits and retries when Telegram returns flood or transient network errors.

No tokens or session strings are copied out of Telegram. The script runs in the page context and calls the same `apiManager.invokeApi` bridge that Telegram Web K uses itself.

## Safety model

Wipegram is deliberately conservative:

- **Only your own messages** are candidates. Messages from other people are never shown for deletion.
- **Delete for everyone where Telegram permits it.** For private chats and groups, `revoke: true` removes the message from both sides when Telegram allows it. For channels/supergroups, `channels.deleteMessages` revokes the messages.
- **Pinned messages are protected** by default. Pinned IDs are reloaded before deletion, and message-level pinned flags are also checked. Incomplete pagination or lookup failure stops the operation. Unchecking the option is the explicit opt-out. Pins added after the final check can still race with deletion.
- **Chat/account changes abort the operation.** Account identity is part of every preview key and is verified before every API call. A request already submitted can still finish after Stop or a chat change.
- **Chat previews and unsupported chats are blocked.** A chat preview is not the real conversation, and Saved sub-conversations are not supported yet.
- **More than 100 messages require typing `DELETE`.** Smaller batches only need the normal confirmation dialog.
- **Long flood waits stop the operation.** Wipegram will not silently park your tab for more than 15 minutes.
- **No undo.** Telegram does not provide an undo for these deletions.

### Deletion limits per chat type

Telegram decides whether a message can be revoked. Depending on the chat type, message age, your role, and the message itself, Telegram may:

- delete the message for everyone,
- delete it only for you,
- refuse with `MESSAGE_DELETE_FORBIDDEN` or `CHAT_ADMIN_REQUIRED` (reported as skipped/failed),
- report that the message is already gone.

Wipegram retries a rejected batch one message at a time so a single problematic message does not block the rest, then reports exactly what happened.

## Rate limits and retries

- Scan pages request at most 100 messages at a time.
- Delete requests contain at most 100 message IDs.
- `FLOOD_WAIT_X`, `FLOOD_PREMIUM_WAIT_X`, and `SLOWMODE_WAIT_X` are parsed and waited out automatically.
- Waits longer than **15 minutes** stop the operation with `FLOOD_TOO_LONG`.
- Up to **8 flood pauses per request** are tolerated; after that the operation stops rather than looping forever.
- Transient network/5xx errors are retried with exponential backoff (up to 3 attempts per request).

Telegram does not document a universal deletion requests-per-second quota. These batch sizes and retry caps are Wipegram policies, not guarantees against rate limits. The Bot API's deletion restrictions are not a specification for this logged-in user MTProto client. See [verified limits and technical sources](docs/TELEGRAM-LIMITS.md).

The activity log shows every wait and retry. The JSON report includes flood-wait counts and seconds.

## Report format

The **Report** button downloads a local JSON file containing:

- app version and export time,
- target title, kind, username, peer ID, Saved/channel flags, topic scope,
- active filters,
- scan and delete statistics,
- failed/skipped message IDs with error details,
- every matched message's ID, ISO date, media type, and preview.

The report can contain chat names and message previews. Treat it as private data. It is generated in your browser and never uploaded by Wipegram.

## Privacy

- No analytics, telemetry, or remote logging.
- No external network requests from the userscript.
- No bot token, API ID/hash, or session string is requested or stored.
- Privacy mode is persisted in `localStorage` as a single flag.
- The JSON report is created with a local Blob URL and downloaded directly.
- The script uses your existing Telegram Web K session only while the page is open.

## Troubleshooting

| Problem | What to try |
| --- | --- |
| No **W** button | Confirm the userscript is enabled, that you are on `/k/` (not `/a/`), then reload the page. A floating W appears when the topbar has no `.chat-utils`. |
| “Chat unavailable” / “Telegram has not loaded this chat yet” | Close and reopen the chat, wait for messages to load, then press the refresh button in the panel. |
| “No messages matched these filters” | Broaden the date range, clear text/regex, choose a different message type, or switch to **Full history walk**. |
| “Pinned messages could not be loaded” | Leave the option on and reload the chat to try again. Only uncheck **Skip pinned messages** if you accept the risk. |
| “Telegram asked Wipegram to pause…” | Wait for the reported time, then retry. Telegram rate limits are shared by the whole account/session. |
| Some messages were skipped or failed | Telegram refused those messages, or they no longer exist. The activity log and JSON report show the reasons. |
| Panel is too tall on mobile | The panel body scrolls independently; close and reopen it if the Telegram layout changes. |
| Web A notice | Use Telegram Web K: <https://web.telegram.org/k/>. |

Telegram Web K is maintained by Telegram and its internals can change. If a scan suddenly fails after a Telegram update, check for a Wipegram update or open an issue with the activity-log errors.

## Development

Requirements: Node.js 20 or newer.

```bash
npm install
npm test          # unit tests (filters, errors, engine, Telegram adapter)
npm run build     # builds wipegram.user.js from src/
npm run build:extensions # same userscript bundled into Chromium/Firefox ZIPs
npm run test:ui   # Playwright UI smoke test (requires Chromium)
npm run test:extensions:browser # installed Chromium extension, simulated Telegram
npm run check     # tests + all builds + userscript/extension artifact validation
```

The UI test uses `playwright-core`. If Chromium is not in the default Playwright cache, set `WIPEGRAM_CHROME` to the browser executable:

```bash
WIPEGRAM_CHROME=/path/to/chrome npm run test:ui
```

Set `WIPEGRAM_UI_SCREENSHOT=0` to skip screenshots. The test writes them to `$TMPDIR/wipegram-ui-test.png` and `$TMPDIR/wipegram-ui-test-night.png`.

### Source layout

| Path | Purpose |
| --- | --- |
| `src/index.js` | Entry point, Web K/Web A routing, boot and debug handle |
| `src/telegram.js` | Web K adapter, target detection, MTProto calls |
| `src/engine.js` | Scan/delete orchestration, batching, retries, flood handling |
| `src/filters.js` | Filter normalization, media classification, local matching |
| `src/errors.js` | Error codes, classification, readable messages |
| `src/ui.js` | Panel, confirmation flow, progress, report |
| `src/panel.html`, `src/notice.html`, `src/dom.js` | Trusted templates compiled into DOM descriptors; no runtime HTML parsing |
| `src/styles.css` | Panel styling, themes, responsive layout |
| `src/launcher.js` | Topbar button, floating fallback, shortcut |
| `src/unsupported.js` | Web A notice |
| `src/extension/` | Read-only extension popup |
| `build/extensions.mjs` | Manifest V3 packages, deterministic ZIPs and SHA-256 checksums |
| `build/templates.mjs` | Build-time HTML parsing with parse5; no parser shipped in the runtime |
| `test/` | Unit tests and Playwright UI test |
| `scripts/check-artifact.mjs` | Validates the built userscript metadata and bundle |
| `scripts/check-extensions.mjs` | Validates manifests, runtime parity, ZIP contents and checksums |

`window.__wipegram` exposes the UI, engine, adapter, and a `destroy()` method for debugging in the browser console.

## Contributing

Read [contributor guidance](CONTRIBUTING.md), [agent rules](AGENTS.md), [maintenance](docs/MAINTENANCE.md) and [release preparation](docs/RELEASING.md). CI checks tests and generated artifacts; pushing a release tag publishes validated downloads. Versioning keeps Wipegram's existing `0.x` history.

Issues and pull requests are welcome. Please include:

- Telegram Web K version or the date you tested,
- chat type (private, group, supergroup, forum topic, Saved Messages),
- the exact error text/code from the activity log,
- screenshots with private data removed.

Do not paste session tokens, phone numbers, or private chat contents into issues.

## License

MIT. See [LICENSE](LICENSE).

Telegram is a trademark of Telegram Messenger LLP. Wipegram is an independent project and is not endorsed by or affiliated with Telegram.
