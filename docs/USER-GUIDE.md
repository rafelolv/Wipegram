# Wipegram user guide

This guide walks through a safe Wipegram cleanup, explains each option, and lists the cases Wipegram deliberately refuses.

> **Deletion is permanent.** Telegram cannot undo a deleted message. Start with a small date range or a low **Max messages** value, check the preview, and only then run a larger cleanup.

## 1. Before you start

You need:

- a desktop browser with Tampermonkey or Violentmonkey,
- Wipegram installed in that userscript manager,
- Telegram Web K open at <https://web.telegram.org/k/>,
- the chat you want to clean selected in Telegram.

Open the chat and let its messages load. If Wipegram says the chat is not loaded, close and reopen it in Telegram, then use the refresh button in the Wipegram panel.

### The button does not appear

Wipegram adds a small **W** button to the chat topbar. If the current Telegram layout has no topbar tools, it adds a floating **W** button instead. You can also press `Alt+Shift+W`.

If neither appears:

1. Check that your userscript manager lists Wipegram as enabled.
2. Check that the address starts with `https://web.telegram.org/k/`.
3. Reload Telegram.
4. Open a chat (the launcher may be hidden when no chat is selected).

Web A (`/a/`) only shows an unsupported notice. Wipegram needs Web K's in-page API bridge.

## 2. Open the panel

Click the **W** button or press `Alt+Shift+W`. The panel shows the **current chat** at the top. Confirm that this is the chat you mean to clean.

The target card shows the chat kind (private chat, group, supergroup, Saved Messages), username when available, and a `topic` marker inside a forum topic. The refresh button re-reads the current chat.

If you switch chats in Telegram while the panel is open, Wipegram notices the change. A completed scan for the old chat is invalidated, and a running operation stops.

## 3. Choose filters

All filters are optional. Leaving them at their defaults means “all of my messages in this chat, newest first.”

Message type and text search are visible immediately. Expand **Date & pattern filters** for dates and regex, or **Advanced options** for scan limits and delays. Statistics appear when scanning starts; expand **Activity** to read the log.

### Message type

Choose one of:

- All messages
- Text only
- Photos
- Videos
- Files
- Links
- Music
- Voice messages
- GIFs

In **Telegram sender search** and **Auto** modes, the media type is sent to Telegram as a server-side filter. In **Full history walk** mode, Wipegram classifies media locally. “Text only” always gets an extra local check so captioned media and links are handled sensibly.

### Text contains

In sender-search mode this becomes Telegram's search query. Telegram search may behave like word-based search rather than a raw substring match.

In history mode Wipegram checks for the text locally, case-insensitively. If you need exact matching, use the regex field instead.

### Regex pattern

A JavaScript regular expression, applied locally and case-insensitively. Examples:

- `^hello` — messages whose text starts with “hello”
- `invoice|receipt` — either word
- `^\s*$` — messages with only whitespace (not usually useful, because empty messages are filtered out)
- `https?://` — messages containing a link

Invalid regexes are rejected before scanning. Regex is always local, so it applies to text, poll questions, and webpage titles/descriptions/URLs that Wipegram can read.

### Newer than / Older than

Local date and time bounds. Both ends are inclusive to the second. Leave one side empty for an open-ended range.

A common safe pattern is:

1. Set **Newer than** to a recent date and **Older than** to now.
2. Set **Max messages** to a small number such as `20`.
3. Scan, inspect, then delete.

### Skip pinned messages

This is on by default and is a safety feature. Before scanning, Wipegram loads the chat's pinned message IDs and excludes them. It loads pins again before deletion to protect messages pinned during review. In a forum topic it loads pinned IDs for that topic; with **Current topic only** off, it protects pins across the forum. A pin added after the final check can still race with deletion.

If Telegram refuses to return pinned IDs, Wipegram **stops the scan** with `PINNED_UNAVAILABLE`. It does not guess and risk deleting a pinned message. Reload the chat and try again.

Unchecking this option means “scan even if I cannot identify pinned messages.” Use it only when you understand that a pinned message may be deleted.

### Current topic only

Visible when you are inside a forum topic. When checked, the scan is limited to that topic. When unchecked, Wipegram scans the whole forum across topics. The confirmation dialog repeats the scope and notes “entire chat, all topics” when relevant.

### Advanced options

- **Scan method** — `Auto` (recommended), `Telegram sender search`, or `Full history walk`.
- **Max messages** — stop after this many matches. `0` or empty means unlimited.
- **Pause between batches (ms)** — extra delay between delete batches, useful on accounts that hit limits quickly.
- **Pause between scan pages (ms)** — extra delay between search/history pages.

## 4. Scan

Press **Scan messages**. Wipegram only reads at this stage; nothing is deleted.

### Scan methods

**Auto** is the default. Wipegram first asks Telegram for messages sent by you, using the server-side media filter. When that search ends, it checks the same chat's history from its newest page and applies your filters locally, merging matches without duplicates. An empty search response does not end the scan. This verification can take longer in large chats. A **Max messages** limit stops either pass once enough matches are found. If sender search is unsupported or returns an incomplete response, Auto switches directly to history.

**Telegram sender search** forces the fast path without history verification. If the chat does not support it, the scan fails instead of falling back. If messages are missing from its results, use Auto or Full history walk.

**Full history walk** reads the chat page by page and applies every filter locally. It is slower and checks more messages, but it works in chats where sender search is not available. In a forum topic it uses `messages.getReplies`; outside a topic it uses `messages.getHistory`.

### What the progress shows

- **Checked** — messages read from Telegram during this scan.
- Auto can read the same message in both search and history; **Found** counts matching IDs only once.
- **Found** — matching messages owned by you, after local filters.
- **Deleted** — zero until you start deleting.
- **Failed** — deletions Telegram refused or that failed after retries.

The status line and activity log report the current mode, fallback events, flood waits, network retries, and page progress.

### Reviewing results

**Found messages** shows up to eight rows by default. Press **Show all** to render up to 200 rows; the JSON report always contains every matched message, even if the preview list is truncated.

Each row shows the date, message ID, media badge, and a short preview. Use **Report** to download the full list before deleting if you want an audit trail.

If the preview looks wrong, change the filters and scan again. Pressing **Scan again** replaces the previous result set; it does not delete anything.

## 5. Confirm and delete

Press **Delete N messages**. A confirmation dialog repeats:

- the target chat (and topic scope),
- the active filters,
- the permanent-deletion warning,
- the number of messages.

For **more than 100 messages**, the final button stays disabled until you type `DELETE`. This threshold is deliberately independent of the number of batches: it protects large cleanups from a single accidental click.

The confirmation field receives keyboard focus automatically. Tab stays inside the dialog; Escape or **Cancel** closes it without deleting. Typing `DELETE` only enables the button: you must still explicitly choose **Delete forever**.

Review the dialog and press **Delete forever**. Wipegram then:

1. Sends IDs in batches of at most 100.
2. Retries a rejected batch one message at a time, so one bad message does not block the rest.
3. Honors flood waits and transient retries.
4. Updates the progress bar, metrics, activity log, and final status.
5. Offers the JSON report with the outcome.

You can press **Stop** while a scan or delete is running. Stopping is not an undo: messages already deleted stay deleted. The status shows how many were completed before the stop.

## 6. Understand the result

Final statuses can include:

- **Done. N messages deleted.** — all requested deletions succeeded.
- **Finished with errors. N deleted, M failed.** — at least one message was refused; details are in the log/report.
- **N already gone** — Telegram no longer had the message.
- **N skipped** — Telegram refused deletion (for example, a service message or permission restriction). The report records the error code.
- **Stopped. N of M deleted.** — you pressed Stop, switched chats, or a flood wait exceeded the cap.
- **Telegram asked Wipegram to pause…** — a flood wait longer than the app's safety cap stopped the operation.

Deletion rules vary by chat type and message age. Telegram may delete a message for everyone, only for you, or refuse entirely. Wipegram cannot override Telegram's server-side policy.

## 7. Reports

The **Report** button downloads `wipegram-<chat>-<date>.json` locally. It contains the target, filters, scan/delete statistics, failures, and every matched message ID with date, type, and preview.

Reports may contain private chat names and message text. Store or share them carefully. Wipegram never uploads them.

## Safety checklist

- [ ] The target card shows the chat I expect.
- [ ] I am not in a chat preview or a Saved sub-conversation.
- [ ] **Skip pinned messages** is on, unless I explicitly accept the risk.
- [ ] The date range and message count are as small as needed for a first run.
- [ ] I reviewed the result list and, if needed, downloaded a report.
- [ ] I understand that deletion is permanent and may remove messages for other people too.

## Supported and unsupported chats

| Chat | Behavior |
| --- | --- |
| Private chat | Supported. Deletes your messages, revoking them where Telegram permits. |
| Basic group | Supported. Sender search may fall back to history. |
| Supergroup | Supported. Uses `channels.deleteMessages`. |
| Forum topic | Supported. **Current topic only** is checked by default. |
| Forum, all topics | Supported by unchecking **Current topic only**. |
| Saved Messages | Supported in the main Saved Messages view. |
| Saved sub-conversation | Blocked. Open the main Saved Messages view instead. |
| Broadcast channel | Blocked. Posts use the channel identity; personal authorship cannot be verified. Open the linked discussion group to clean your comments. |
| Direct messages to a channel | Blocked. Open a normal chat instead. |
| Chat preview | Blocked. Open the actual chat. |
| Web A | Unsupported notice only. Use Web K. |

## Troubleshooting

### “Telegram has not loaded this chat yet”

Telegram's peer cache has not populated the input peer. Close the chat, reopen it, wait for messages, and press the panel's refresh button. If it persists, reload Telegram.

### “Pinned messages could not be loaded”

Reload the chat and retry. This usually means Telegram rejected the pinned-message search or the request failed after a retry. Wipegram stops rather than risk a pinned message. Only uncheck the option if you are comfortable proceeding without pin protection.

### “Sender search is unavailable in this chat”

Auto mode falls back to a full history scan. If you forced sender search, switch to Auto or Full history walk. Some basic groups and Saved Messages views do not support all search filters.

### A large cleanup is very slow

Sender search is faster than history walking. Reducing the date range reduces pages. Telegram's own flood waits can dominate; Wipegram reports each wait. Do not close the tab mid-operation.

### The panel is in the wrong place

Drag it by the header on desktop. On mobile it is pinned to the viewport. Use **Reset** to clear results, not to reposition the panel.

### I closed the panel during an operation

Wipegram refuses to close while busy so the operation is not silently abandoned. Press **Stop** first, wait for the partial result, then close.

### Browser console

The userscript logs `[Wipegram]` messages. `window.__wipegram` exposes `version`, `ui`, `engine`, `api`, and `destroy()`. Do not paste tokens or private message contents into a bug report.

## Uninstall

1. Remove Wipegram from Tampermonkey/Violentmonkey.
2. Reload Telegram Web K.

Privacy mode and the dismissed Web A notice use small `localStorage`/`sessionStorage` flags; they are harmless and can be cleared with the site's storage.

## Limits and disclaimers

- Wipegram is unofficial and not affiliated with Telegram.
- Telegram Web K internals can change without notice.
- Deletion is permanent.
- Telegram may rate-limit, restrict, or refuse deletions at any time.
- You are responsible for complying with Telegram's terms and the rules of the chat you are cleaning.

For installation and development details, see the [README](../README.md).
