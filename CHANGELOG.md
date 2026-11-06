# Changelog

All notable changes to Wipegram are documented here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.2.1] - 2026-11-06

### Fixed

- Generate identical userscripts across checkout locations by keeping template identifiers relative to the repository, allowing CI artifact verification and release publication.

### Validation

- Add a regression that builds in two distinct checkout directories and compares the generated userscripts byte for byte.

## [0.2.0] - 2026-11-06

### Added

- Agent and contributor guidance adapted from Wipecord for Telegram safeguards, maintenance, versioning and release preparation.
- CI artifact checks and tag-triggered GitHub releases with validated notes, matching versions and download checksums.
- Local Chromium and Firefox Manifest V3 extensions with the identical userscript runtime and a read-only popup.
- Reproducible ZIP packages, SHA-256 checksums and extension artifact verification.
- Installed Chromium extension tests using simulated Telegram responses.
- Installation instructions and documented MTProto limits with primary sources.

### Fixed

- Resolve current peers from Web K's synchronous mirror instead of treating asynchronous worker managers as synchronous values.
- Invalidate previews on account changes and verify account identity before every API request.
- Reject messages with another explicit sender or a channel sender even when marked outgoing; recheck ownership before deletion.
- Stop on incomplete pinned-message pagination and refresh pinned protection before deletion.
- Explain broadcast-channel restrictions in terms of verifiable personal authorship.
- Compile trusted HTML templates into DOM descriptors and remove runtime HTML parsing.

### Validation

- Automated unit and Chromium browser tests use simulated Telegram data; live deletion remains unverified.
- Firefox packages receive static checks; Firefox runtime behavior, signing and store review remain unverified.
- Firefox add-on validation passes with zero errors, notices or warnings.

## [0.1.0] - 2026-11-06

### Added

- Initial release of Wipegram, a Telegram Web K counterpart to Wipecord.
- Native-looking **W** launcher in the Telegram chat topbar, plus a floating fallback and `Alt+Shift+W`.
- Shadow-DOM panel with light/dark themes, responsive mobile layout, keyboard focus handling, and optional dragging.
- Target detection for private chats, basic groups, supergroups, forum topics, and the main Saved Messages view.
- Safety blocks for broadcast channels, Saved sub-conversations, direct messages to channels, chat previews, and Telegram Web A.
- Filters for message type, text query, regex, date range, pinned messages, topic scope, and maximum match count.
- Auto, sender-search, and full-history scan modes, including automatic fallback when sender search is unsupported.
- Pinned-message protection that aborts the scan if pinned IDs cannot be loaded.
- Delete batches capped at 100 IDs, with per-message retry after a rejected batch.
- Flood-wait handling (`FLOOD_WAIT`, `FLOOD_PREMIUM_WAIT`, `SLOWMODE_WAIT`) with a 15-minute cap and up to 8 pauses per request.
- Transient network/5xx retries with exponential backoff.
- Progress, checked/found/deleted/failed metrics, activity log, stop support, and partial statistics.
- Typed `DELETE` confirmation for operations over 100 messages.
- Privacy blur and local JSON report with target, filters, statistics, failures, and message metadata.
- Unit tests for filters, errors, utilities, the engine, and the Telegram adapter.
- Playwright UI smoke test with mocked Web K globals, long-list layout checks, dark theme, mobile bounds, and Web A notice verification.
- Build artifact validation for userscript metadata, version, required MTProto calls, syntax, and safety strings.
- README, user guide, changelog, MIT license, and UI preview images.
