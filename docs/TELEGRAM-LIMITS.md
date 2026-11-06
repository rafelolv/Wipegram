# Telegram behavior and implementation limits

Reviewed on 2026-11-06 against Telegram's MTProto documentation and Web K source. Wipegram uses the user's existing Web K session. It does not use the HTTP Bot API.

## Discovery and ownership

[`messages.search`](https://core.telegram.org/method/messages.search) accepts a peer, `from_id`, filters, dates and ID-based pagination. Wipegram uses `inputPeerSelf` for sender search and additionally checks each returned message's sender locally. In Auto mode, completed sender search is supplemented by **one recent page**, up to 100 rows, from [`messages.getHistory`](https://core.telegram.org/method/messages.getHistory) or [`messages.getReplies`](https://core.telegram.org/method/messages.getReplies) in the current topic. This bounded probe recovers recent unindexed messages without walking an entire busy group's history. It preserves ownership, filters and pins and deduplicates IDs. It is not a complete independent history audit; use Full history walk for older missing messages. Unsupported or incomplete sender-search responses still fall back to paginated history. A configured message cap stops either pass once reached.

Following Telegram's [ID-based pagination](https://core.telegram.org/api/offsets), cursors use all positive IDs returned by a page, including deleted-message placeholders that are excluded from deletion candidates. An incomplete or repeating history page stops the scan with an error; it is not reported as successful completion. Each scan starts with a fresh cursor and candidate set.

In default own-message mode, an explicit sender from another user or a channel is rejected even if the outgoing flag is set. Broadcast posts and anonymous/send-as messages are not treated as personally authored content. Explicit admin mode is separate: it requires verified ownership or [`delete_messages` admin rights](https://core.telegram.org/constructor/chatAdminRights), reads the selected group/channel history and can include other authors. Account, chat and permission are rechecked before every admin API call. Unknown permissions or permission denials stop the operation; admin status alone never enables this mode.

Normal-mode `scanned` counts unique own messages, while `inspected` counts raw returned rows across both passes. History responses can contain all authors because [`messages.getHistory`](https://core.telegram.org/method/messages.getHistory) has no sender parameter. Reading those rows does not authorize their deletion. The admin mode must be enabled and its new preview explicitly confirmed; every admin deletion requires typed `DELETE`.

Web K's [`appPeersManager`](https://github.com/morethanwords/tweb/blob/master/src/lib/appManagers/appPeersManager.ts) methods execute behind worker proxies in the tab. The synchronous peer mirror is exposed by [`apiManagerProxy.getPeer`](https://github.com/morethanwords/tweb/blob/master/src/lib/apiManagerProxy.ts); Wipegram derives input peers from that mirror. Missing access hashes, incomplete peers and unavailable account identity block target selection. This internal bridge is not a stable public API and can change with Web K updates.

## Deletion and permissions

- [`messages.deleteMessages`](https://core.telegram.org/method/messages.deleteMessages) takes message IDs and the `revoke` flag. Wipegram requests revocation for private chats and basic groups.
- [`channels.deleteMessages`](https://core.telegram.org/method/channels.deleteMessages) takes an input channel and message IDs for supergroups/channels. Own-message mode blocks broadcast posts; explicit admin mode permits them only with verified owner/delete-messages rights.
- Telegram decides whether each operation is permitted. `MESSAGE_DELETE_FORBIDDEN`, `CHAT_ADMIN_REQUIRED`, session errors, frozen-account restrictions and lost membership are handled explicitly.
- Successful requests are counted as API-accepted deletion, not proof that remote copies, exports, screenshots or forwarded messages were removed. Telegram's response does not provide a per-recipient revocation receipt.
- The Bot API's commonly cited 48-hour deletion rule must not be applied as a universal restriction for these logged-in user MTProto methods. Wipegram does not promise deletion at any particular age; server responses decide.

## Rate limits

Telegram's [RPC error documentation](https://core.telegram.org/api/errors) defines wait errors. `FLOOD_WAIT_X` means wait X seconds before repeating the operation. There is no universal deletion throughput quota documented on these method pages. Limits can depend on the operation and account activity.

Wipegram's own policies:

- Up to 100 messages per scan page and deletion batch.
- Scan pages are spaced by at least 350 ms; a configured longer pause is honored. Batch pauses remain configurable. These are application policies, not documented server quotas.
- Server cooldowns survive Stop/rescan for the same request family within the current engine instance. Pins and sender search share a cooldown because both call messages.search. Reloading the tab or another tab does not share this state.
- Disable [Web K’s hidden server-error retries](https://github.com/morethanwords/tweb/blob/master/src/lib/appManagers/apiManager.ts) with noRetry so the engine’s bounded retry policy controls these requests. No timeout race resubmits an unresolved deletion.
- Honor `FLOOD_WAIT_X`, `FLOOD_PREMIUM_WAIT_X` and `SLOWMODE_WAIT_X`.
- Stop if a requested wait exceeds 15 minutes or more than eight flood waits occur for one request.
- Up to three transient network/server retries with exponential backoff. Exhaustion during deletion stops the run; it never triggers per-message fan-out. Individual fallback remains for Telegram batch rejections, and stops if its own transient retries are exhausted.
- Stop scanning after 50,000 pages rather than loop indefinitely.

Batch size 100 is a conservative application policy. It is not a promise that 100 deletions per request or a particular request frequency will avoid rate limits.

## Pinned messages and cancellation

With pinned protection enabled, Wipegram loads pins before scanning and again before deleting. Message-level pinned flags also exclude candidates. Pagination must reach an empty page within ten pages; missing responses, repeating cursors or reaching the cap stop the operation. Large pin histories can require a narrower topic or explicit opt-out.

Pins added after the last check can race with deletion. Stop/chat changes cancel subsequent work; requests already submitted may finish. Account identity forms part of the preview key and is checked again before every API request, including retries.

## Remaining validation

Tests simulate Telegram data and RPC responses. They establish local behavior, not live server compatibility, deletion permissions or a guarantee against rate limiting. Test a few disposable messages manually before larger cleanups. Firefox has a packaged extension but needs its own runtime verification and signing before distribution as a permanent add-on.
