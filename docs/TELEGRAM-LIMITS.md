# Telegram behavior and implementation limits

Reviewed on 2026-11-06 against Telegram's MTProto documentation and Web K source. Wipegram uses the user's existing Web K session. It does not use the HTTP Bot API.

## Discovery and ownership

[`messages.search`](https://core.telegram.org/method/messages.search) accepts a peer, `from_id`, filters, dates and ID-based pagination. Wipegram uses `inputPeerSelf` for sender search and additionally checks each returned message's sender locally. Unsupported sender search falls back to paginated [`messages.getHistory`](https://core.telegram.org/method/messages.getHistory), or [`messages.getReplies`](https://core.telegram.org/method/messages.getReplies) within a topic.

An explicit sender from another user or a channel is rejected even if the outgoing flag is set. Broadcast posts and anonymous/send-as messages are not treated as personally authored content. This is a deliberate scope restriction, not a claim that channel administrators cannot delete posts. Personally authored comments in the linked discussion group are supported.

Web K's [`appPeersManager`](https://github.com/morethanwords/tweb/blob/master/src/lib/appManagers/appPeersManager.ts) methods execute behind worker proxies in the tab. The synchronous peer mirror is exposed by [`apiManagerProxy.getPeer`](https://github.com/morethanwords/tweb/blob/master/src/lib/apiManagerProxy.ts); Wipegram derives input peers from that mirror. Missing access hashes, incomplete peers and unavailable account identity block target selection. This internal bridge is not a stable public API and can change with Web K updates.

## Deletion and permissions

- [`messages.deleteMessages`](https://core.telegram.org/method/messages.deleteMessages) takes message IDs and the `revoke` flag. Wipegram requests revocation for private chats and basic groups.
- [`channels.deleteMessages`](https://core.telegram.org/method/channels.deleteMessages) takes an input channel and message IDs for supergroups/channels. Wipegram currently permits supergroups and blocks broadcast channels.
- Telegram decides whether each operation is permitted. `MESSAGE_DELETE_FORBIDDEN`, `CHAT_ADMIN_REQUIRED`, session errors, frozen-account restrictions and lost membership are handled explicitly.
- Successful requests are counted as API-accepted deletion, not proof that remote copies, exports, screenshots or forwarded messages were removed. Telegram's response does not provide a per-recipient revocation receipt.
- The Bot API's commonly cited 48-hour deletion rule must not be applied as a universal restriction for these logged-in user MTProto methods. Wipegram does not promise deletion at any particular age; server responses decide.

## Rate limits

Telegram's [RPC error documentation](https://core.telegram.org/api/errors) defines wait errors. `FLOOD_WAIT_X` means wait X seconds before repeating the operation. There is no universal deletion throughput quota documented on these method pages. Limits can depend on the operation and account activity.

Wipegram's own policies:

- Up to 100 messages per scan page and deletion batch.
- Configurable pauses between pages/batches, in addition to server-directed waits.
- Honor `FLOOD_WAIT_X`, `FLOOD_PREMIUM_WAIT_X` and `SLOWMODE_WAIT_X`.
- Stop if a requested wait exceeds 15 minutes or more than eight flood waits occur for one request.
- Up to three transient network/server retries with exponential backoff.
- Stop scanning after 50,000 pages rather than loop indefinitely.

Batch size 100 is a conservative application policy. It is not a promise that 100 deletions per request or a particular request frequency will avoid rate limits.

## Pinned messages and cancellation

With pinned protection enabled, Wipegram loads pins before scanning and again before deleting. Message-level pinned flags also exclude candidates. Pagination must reach an empty page within ten pages; missing responses, repeating cursors or reaching the cap stop the operation. Large pin histories can require a narrower topic or explicit opt-out.

Pins added after the last check can race with deletion. Stop/chat changes cancel subsequent work; requests already submitted may finish. Account identity forms part of the preview key and is checked again before every API request, including retries.

## Remaining validation

Tests simulate Telegram data and RPC responses. They establish local behavior, not live server compatibility, deletion permissions or a guarantee against rate limiting. Test a few disposable messages manually before larger cleanups. Firefox has a packaged extension but needs its own runtime verification and signing before distribution as a permanent add-on.
