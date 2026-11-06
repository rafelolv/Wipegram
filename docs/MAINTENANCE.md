# Maintenance

Wipegram is maintained on `main` at https://github.com/rafelolv/Wipegram. Its agent workflow was adapted from [Wipecord's maintenance rules](https://github.com/rafelolv/Wipecord/blob/2ccc709074e4800a967b1feb4556defce1c83df6/AGENTS.md), with Telegram-specific safety and the existing Wipegram version history retained.

## Development

Node.js 20 or newer is supported by `package.json`; CI uses Node.js 24. Install locked dependencies with `npm ci` and run `npm run check` after changes. The check runs unit tests, builds the userscript and both extensions, and verifies metadata, syntax, runtime parity, ZIP contents and checksums. CI also rejects a root userscript that differs from the committed artifact. It does not run browser tests or Mozilla's add-on validator.

Edit runtime modules in `src/`. HTML templates are `src/panel.html` and `src/notice.html`; extension popup assets live in `src/extension/`. `build/templates.mjs` compiles trusted HTML into DOM descriptors. `parse5` is a build dependency only. Use DOM/text APIs for user or API data, preserving redaction and avoiding runtime HTML parsing.

Keep Telegram integration in `src/telegram.js`, scan/delete policies in `src/engine.js`, and confirmation/report presentation in `src/ui.js`. Read [Telegram limits](TELEGRAM-LIMITS.md) before changing MTProto assumptions. Reports intentionally contain target data and message previews; a Wipecord-style anonymous report would be a separate product change.

## Browser validation

Run `npm run test:ui` after UI changes and `npm run test:extensions:browser` after extension integration changes. Both use Chromium and simulated Telegram responses. The latter loads the actual unpacked extension into a temporary profile. Use `WIPEGRAM_CHROME=/path/to/chrome` when the test's default browser path is unavailable. Set `WIPEGRAM_UI_SCREENSHOT=0` to skip screenshots.

Record browser/version, tested scenarios and failures. Current automated checks do not authenticate to Telegram, verify current Web K internals, test Firefox runtime or delete real messages. Do not describe simulated deletions as live validation. For real checks, obtain specific authorization, use a disposable chat and a small selection, and disable other deletion scripts. Never reuse a signed-in browser profile for automated tests.

Keep [extension validation and limits](EXTENSION.md#verification-and-limits) accurate. A previously recorded add-on validation result is historical evidence; do not report it as a fresh check unless rerun. Local build and CI commands do not submit to stores.

## Versions and artifacts

Keep the existing `0.1.0` and `0.2.0` history. Increment patch for compatible fixes and minor for compatible features. Discuss breaking pre-1.0 changes or a 1.0 milestone explicitly. Use `npm version <version> --no-git-tag-version` to align package and lockfile versions, then run `npm run check`. This project has no automatic npm version lifecycle build hook.

Any published userscript or extension change needs a new version, including metadata and popup changes. Documentation/workflow-only changes do not. `package.json`, lockfile, userscript metadata, runtime version and both extension manifests must agree. Rebuild before committing source changes and include `wipegram.user.js`; leave `dist/` untracked. ZIPs use sorted entries and fixed timestamps; compare builds with the same toolchain when checking reproducibility.

Use English change bullets in `CHANGELOG.md` and release notes; keep validation separate and preserve historical entries. Before a release, move relevant `Unreleased` items into its dated section and prepare `docs/releases/v<version>.md` from the [template](RELEASE-TEMPLATE.md).

## Git and publication

Preserve unrelated working-tree changes. Commit, push and publish when requested. For commits use repository-local `Rafael <82127878+rafelolv@users.noreply.github.com>`; do not change global configuration or rewrite history.

CI runs on main pushes and pull requests. Release automation runs only when a `v*` tag is pushed; it validates version, notes, changelog and generated artifacts, then publishes fixed downloads and checksums. Adding workflow files does not publish anything. A requested GitHub release does not authorize Firefox AMO or other store publication. Follow [RELEASING.md](RELEASING.md) and verify the published files before reporting success.
