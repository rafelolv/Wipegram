# Wipegram

Maintained by rafelolv. Follow [docs/MAINTENANCE.md](docs/MAINTENANCE.md).

- Creator display name is `Rafael (rafaelolv)`; official repository URLs remain `rafelolv/Wipegram`. Preserve attribution and the proprietary terms from 0.2.2 onward. Earlier MIT grants and third-party rights remain unchanged; see [docs/LICENSING.md](docs/LICENSING.md).
- `images/icon.svg` is the canonical distribution icon. Generate its PNGs with `npm run build:icons`, then rebuild packages. Userscript metadata embeds the local 64 px PNG; browser manifests use the local 48/128 px PNGs. Do not add remote icon requests to the runtime.

## Development and behavior

- Use English for documentation, comments, user-facing text, metadata and commit messages. Follow the user's language in conversation.
- Keep changes focused. Preserve unrelated working-tree changes; do not stage, commit, push, tag or publish unless requested. Finish authorized work and report actual checks and limitations.
- Maintain `main`. Installation and support URLs must use `rafelolv/Wipegram`, its `main` branch or its issues.
- Edit runtime code in `src/`, trusted templates in `src/panel.html`, `src/notice.html` and `src/extension/`, and build logic in `build/` or `build.mjs`. Never hand-edit `wipegram.user.js` or `dist/`; regenerate outputs. Include the root userscript with shared source changes when committing.
- Keep runtime code readable, locally packaged and free of external dependencies, remote executable code, telemetry and remote configuration. Build/test dependencies are permitted. Never store, print or commit session credentials or private Telegram data.
- Compile trusted HTML templates to DOM descriptors at build time. Render runtime content with DOM/text APIs; do not introduce `innerHTML`, `outerHTML`, `insertAdjacentHTML` or `DOMParser`.
- Preserve Wipegram's Telegram identity, launcher, themes, keyboard access, responsive layout and privacy behavior. Wipecord is a workflow reference, not a source of Discord-specific code or unrelated features.

## Deletion safeguards

- Operate only on verifiably own messages in supported Telegram Web K chats. Preserve sender checks, account identity, target/topic validation and unsupported-chat blocks. Telegram Web A displays only a notice.
- Preserve preview invalidation on target/account/filter changes, explicit confirmation, typed `DELETE` above 100 messages, cancellation and Stop. Dismissing confirmation must never authorize deletion. A submitted request may still finish after Stop.
- Protect pinned messages by default. Incomplete or failed pinned pagination must stop the operation; refresh protection before deletion. Preserve ownership checks immediately before deletion.
- Reject invalid regex and reversed/equal date bounds before API access. Preserve pagination guards, batches capped at 100, flood-wait caps, backoff and per-message fallback after rejected batches. Do not borrow Discord or Bot API limits for this MTProto client.
- Privacy mode starts off when no saved preference exists. Preserve the explicit local preference. Reports currently include chat identifiers and message previews: keep them local, document their sensitivity and never attach them to public issues or release assets.
- Do not broaden deletion scope or remove guards during branding, packaging or maintenance changes. Add focused regressions when changing deletion behavior.

## Validation and distributions

- Run `npm run check` after changes. For UI changes run `npm run test:ui`; for extension integration run `npm run test:extensions:browser`. See maintenance docs for the browser executable override.
- Tests use simulated Telegram data. Report actual browsers and unperformed checks separately; automated success does not prove live Telegram compatibility or successful real deletion. Never delete real messages without specific authorization.
- The userscript is the primary distribution. Chromium and Firefox packages must ship the generated production `wipegram.user.js` byte for byte, with the same version and engine. Keep the popup read-only; no background deletion, extra API permissions or installation actions.
- `dist/` is ignored, reproducible output. Rebuild both packages for shared runtime or extension changes. Preserve scoped Telegram matches and duplicate-injection protection. Separate tabs currently run independently; do not claim an origin-wide lock exists.
- Document unsigned local packages, manual updates, Firefox signing and store review separately. Chromium tests do not establish Firefox runtime behavior. Store submission requires explicit authorization; Wipecord's AMO authorization and credentials do not apply here.

## Versioning, Git and releases

- Keep Wipegram's existing `0.x` history. Use three-part semantic versions: patch for compatible fixes, minor for compatible features; discuss breaking pre-1.0 changes and a future 1.0 milestone explicitly. Never copy Wipecord's version or reset Wipegram to 1.0.0 automatically.
- `package.json` is the version source. Align the lockfile with `npm version <version> --no-git-tag-version`, then rebuild the userscript and both extensions. Any published executable or package change, including metadata, needs a new unused version. Documentation/workflow-only changes need no runtime bump.
- Write changelog and release Changes sections as concise English bullets, one user-visible change per item. Keep validation and limitations separate. Add ongoing work under `Unreleased`; preserve historical entries.
- When committing, use repository-local identity `Rafael <82127878+rafelolv@users.noreply.github.com>`. Preserve history; never rewrite it or add co-authors automatically. Do not alter global Git identity.
- Follow [docs/RELEASING.md](docs/RELEASING.md) and [docs/RELEASE-TEMPLATE.md](docs/RELEASE-TEMPLATE.md). Prepare artifacts, changelog and notes before tagging. When publication is requested, publish and verify the release and attached hashes; a tag alone is insufficient. Never reuse a published tag or replace release files silently.
