# Contributing

Read [AGENTS.md](AGENTS.md) and [maintenance](docs/MAINTENANCE.md). Use English for repository content and keep changes focused. Edit `src/` and rebuild `wipegram.user.js`; never edit generated output manually.

Run `npm ci` and `npm run check`. Add focused regression coverage for deletion changes and run relevant browser checks. Preserve ownership, target/account checks, pinned protection, confirmation, cancellation, rate limits and privacy defaults. Do not add runtime dependencies, telemetry or remote scripts.

Include what changed, why, checks performed and scenarios not tested. Use synthetic Telegram fixtures. Remove session credentials, phone numbers, message contents and identifying screenshots from issues and tests; exported reports contain private data.

Both extensions use the exact userscript runtime. Rebuild both packages for shared changes. See [extension installation and limits](docs/EXTENSION.md) and [release preparation](docs/RELEASING.md).
