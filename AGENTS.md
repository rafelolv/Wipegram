# Wipegram

Maintained by rafelolv. Follow [docs/MAINTENANCE.md](docs/MAINTENANCE.md).

- Creator display name is `Rafael (rafaelolv)`; official repository URLs remain `rafelolv/Wipegram`. Preserve attribution and the proprietary terms from 0.2.2 onward. Earlier MIT grants and third-party rights remain unchanged; see [docs/LICENSING.md](docs/LICENSING.md).
- `images/icon.svg` is the canonical distribution icon. Generate its PNGs and the README banner mark with `npm run build:icons`, then rebuild packages. Userscript metadata embeds the local 64 px PNG; browser manifests use the local 48/128 px PNGs. Do not add remote icon requests to the runtime.

## Development and behavior

- Use English for documentation, comments, user-facing text, metadata and commit messages. Follow the user's language in conversation.
- Keep changes focused. Preserve unrelated working-tree changes; do not stage, commit, push, tag or publish unless requested. Finish authorized work and report actual checks and limitations.
- Maintain `main`. Installation and support URLs must use `rafelolv/Wipegram`, its `main` branch or its issues.
- Edit runtime code in `src/`, trusted templates in `src/panel.html`, `src/notice.html` and `src/extension/`, and build logic in `build/` or `build.mjs`. Never hand-edit `wipegram.user.js` or `dist/`; regenerate outputs. Include the root userscript with shared source changes when committing.
- Keep runtime code readable, locally packaged and free of external dependencies, remote executable code, telemetry and remote configuration. Build/test dependencies are permitted. Never store, print or commit session credentials or private Telegram data.
- Compile trusted HTML templates to DOM descriptors at build time. Render runtime content with DOM/text APIs; do not introduce `innerHTML`, `outerHTML`, `insertAdjacentHTML` or `DOMParser`.
- Preserve Wipegram's Telegram identity, launcher, themes, keyboard access, responsive layout and privacy behavior. Wipecord is a workflow reference, not a source of Discord-specific code or unrelated features.

## Deletion safeguards

- Default to verifiably own messages in Telegram Web K. Admin mode is an explicit, non-persisted opt-in for a verified group/channel owner or an administrator with delete-messages permission. Reset it on close, account/chat changes or verification failure. Keep scope in preview keys and reports; changing it invalidates the preview. Preserve account/topic validation and Web A/unsupported-chat blocks.
- Include other authors or broadcast-channel posts only in verified admin mode. Recheck permission, account and target before every admin API request, including retries. A server permission denial stops the run. Require typed DELETE for every admin deletion, even one message. Preserve own-author guards in normal mode; never infer opt-in from admin rights alone.
- Count unique own messages as checked in normal mode, separately from the raw history rows inspected for recovery. History reads can include other authors because Telegram getHistory has no sender filter; those rows must never become own-mode candidates.
- Preserve preview invalidation on target/account/filter changes, explicit confirmation, typed `DELETE` above 100 messages, cancellation and Stop. Dismissing confirmation must never authorize deletion. A submitted request may still finish after Stop.
- Skip pinned messages starts unchecked, as explicitly requested by the maintainer. When enabled, incomplete or failed pinned pagination must stop the operation; refresh protection before deletion. Preserve ownership checks immediately before deletion.
- Reject invalid regex and reversed/equal date bounds before API access. Preserve pagination guards, batches capped at 100, flood-wait caps, backoff and per-message fallback after rejected batches. Do not borrow Discord or Bot API limits for this MTProto client.
- Privacy mode starts off when no saved preference exists. Preserve the explicit local preference. Reports currently include chat identifiers and message previews: keep them local, document their sensitivity and never attach them to public issues or release assets.
- Do not broaden deletion scope or remove guards during branding, packaging or maintenance changes. Add focused regressions when changing deletion behavior.

## Validation and distributions

- Run `npm run check` after changes. For UI changes run `npm run test:ui`; for extension integration run `npm run test:extensions:browser`. See maintenance docs for the browser executable override.
- Tests use simulated Telegram data. Report actual browsers and unperformed checks separately; automated success does not prove live Telegram compatibility or successful real deletion. Never delete real messages without specific authorization.
- The userscript is the primary distribution. Chromium and Firefox packages must ship the generated production `wipegram.user.js` byte for byte, with the same version and engine. Keep the popup read-only; no background deletion, extra API permissions or installation actions.
- `dist/` is ignored, reproducible output. Rebuild both packages for shared runtime or extension changes. Preserve scoped Telegram matches and duplicate-injection protection. Separate tabs currently run independently; do not claim an origin-wide lock exists.
- Document unsigned local packages, manual updates, Firefox signing and store review separately. Chromium tests do not establish Firefox runtime behavior. Requested future Wipegram releases authorize Firefox submission through the dependent Release/Publish Firefox workflow; preparation alone does not submit. Other stores still require explicit authorization.
- Follow [Firefox publication](docs/FIREFOX-PUBLISHING.md). Use only repository secrets `AMO_JWT_ISSUER` and `AMO_JWT_SECRET`, preserve the Firefox GUID and current tagged license, verify released files and provide tracked reviewer source. Ordinary pushes, pull requests and local builds must not publish. Inspect AMO before retrying ambiguous failures; never resubmit an existing version to repair metadata.

## Versioning, Git and releases

- Keep Wipegram's existing `0.x` history. Use three-part semantic versions: patch for compatible fixes, minor for compatible features; discuss breaking pre-1.0 changes and a future 1.0 milestone explicitly. Never copy Wipecord's version or reset Wipegram to 1.0.0 automatically.
- `package.json` is the version source. Align the lockfile with `npm version <version> --no-git-tag-version`, then rebuild the userscript and both extensions. Any published executable or package change, including metadata, needs a new unused version. Documentation/workflow-only changes need no runtime bump.
- Write changelog and release Changes sections as concise English bullets, one user-visible change per item. Keep validation and limitations separate. Add ongoing work under `Unreleased`; preserve historical entries.
- When committing, use repository-local identity `Rafael <82127878+rafelolv@users.noreply.github.com>`. Preserve history; never rewrite it or add co-authors automatically. Do not alter global Git identity.
- Follow [docs/RELEASING.md](docs/RELEASING.md) and [docs/RELEASE-TEMPLATE.md](docs/RELEASE-TEMPLATE.md). Prepare artifacts, changelog and notes before tagging. When publication is requested, publish and verify the release and attached hashes; a tag alone is insufficient. Never reuse a published tag or replace release files silently.
