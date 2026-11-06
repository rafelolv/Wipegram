# Automatic Firefox submission

The Release workflow calls **Publish Firefox** after the GitHub release succeeds, following the reusable-workflow pattern in [AdBonk](https://github.com/rafelolv/AdBonk/blob/main/.github/workflows/publish-firefox.yml). Mozilla's official `web-ext` is pinned to **10.8.0**. The workflow supports both the first listed submission and later updates for `wipegram@rafelolv.github.io`.

Preparing these files does not submit an add-on. A successful submission is distinct from Mozilla signing, review and public availability. GitHub ZIPs remain unsigned local packages.

## One-time setup

1. Obtain Mozilla API credentials from [API key management](https://addons.mozilla.org/developers/addon/api/key/). Use the Mozilla account that will own Wipegram, or one authorized to update its existing listing.
2. Open [Wipegram Actions secrets](https://github.com/rafelolv/Wipegram/settings/secrets/actions).
3. Add two **repository secrets**, with these exact names:

| Secret | Value |
| --- | --- |
| `AMO_JWT_ISSUER` | Mozilla JWT issuer |
| `AMO_JWT_SECRET` | Mozilla JWT secret |

Secrets are repository-scoped: having them in AdBonk does not configure Wipegram. Do not use plain Actions variables or put credentials in chat, local files, source code, command arguments or artifacts. The workflow exposes them only to credential checking, authenticated preflight and submission. It passes them to web-ext through `WEB_EXT_API_KEY` and `WEB_EXT_API_SECRET`, with no verbose/configuration dumps.

The first submission supplies the name, English summary/description, desktop Firefox category and license. Mozilla may still require Developer Hub actions such as account agreements, listing details, screenshots or review responses. Do not advertise store availability before it is confirmed. Public API lookup returned no public listing for this GUID during preparation; an authenticated preflight checks the actual account-visible state.

## Triggers

- **Future release:** an authorized `vMAJOR.MINOR.PATCH` tag triggers the Release workflow. Only after GitHub publication succeeds does its dependent Firefox job run.
- **Existing release or first submission:** after this automation is committed and pushed to `main`, open **Actions → Publish Firefox → Run workflow**, choose `main`, and enter an existing published tag such as `v0.2.2`.
- Ordinary pushes, pull requests and local builds do not submit to AMO. Missing secrets fail only the Firefox job; an already-published GitHub release remains available.

The separate manual workflow is useful for automation-only fixes and existing release tags without the new publisher. It retains the verifier from the automation checkout, then checks out the requested release tag. It never recreates a GitHub release, moves a tag or replaces its assets. Do not rely on a separate `release: published` trigger: releases created with `GITHUB_TOKEN` do not normally trigger a second workflow that way.

## Submission checks

Before using Mozilla credentials, the job installs locked project dependencies, runs `npm run check`, downloads the published stable Firefox ZIP and `SHA256SUMS`, and verifies:

- Tag, package, userscript, manifest and build-info versions agree, with no leading zeros and at most nine digits per component.
- The Firefox GUID remains `wipegram@rafelolv.github.io`.
- The runtime and license match the tagged source; the downloaded ZIP is byte-identical to the rebuilt ZIP and its published checksum.
- The checkout is the exact tagged commit and tracked release inputs remain unchanged.
- Listing name (50 characters), summary (250) and description (15,000) are checked before submission, counting Unicode characters. Oversized text is rejected rather than truncated.
- English Changes bullets exist, contain no placeholders and fit within AMO's 3,000-character notes limit. Full download and validation details stay on GitHub.
- Reviewer sources are archived only from tracked build inputs in that tag, excluding `.git`, `node_modules`, `dist` and unrelated root files. Untracked local files are never archived.

The job runs `web-ext lint --warnings-as-errors` before authenticated requests. Preflight then checks GUID, existing versions and pending/unlisted version history. Existing or older versions are refused. Network failures, unreadable replies and unexpected authentication statuses stop submission with sanitized errors and no blind retries.

The official tool submits with `--channel listed`, `--approval-timeout 0`, `--upload-source-code` and generated AMO metadata. **web-ext repackages the validated Firefox folder**; its upload can have different ZIP container bytes from the GitHub archive, while using the same validated files. GitHub assets are not modified. This is not a custom API uploader of the original ZIP bytes.

## License and review source

For proprietary releases, the metadata sends the exact tagged `LICENSE` as `version.custom_license`, rather than inheriting an older MIT license from the store. Earlier tags declaring MIT keep MIT metadata. A changed or unknown license type requires reviewing the publisher before submission. Existing listing fields are not rewritten during version updates; version metadata carries current license, notes and reviewer guidance.

Reviewer rebuild instructions: use Node.js 24, run `npm ci`, then `npm run build:extensions`. The source archive includes `build.mjs`, `build/`, `src/`, package/lock files and the pre-generated icon PNGs. Rebuilding packages does not require Chromium. The userscript is shipped byte-for-byte inside both browser packages. Runtime code is local; there is no background deletion or remote executable configuration.

The test suite uses simulated Telegram data. Manual checks must use a disposable chat on an account you control, preview a small selection, explicitly confirm, and respect permanent deletion. Do not put Telegram credentials, private messages or reviewer test-account credentials in public notes or source archives. Provide any required private reviewer information directly through Developer Hub.

## Failures and retries

Inspect [Developer Hub](https://addons.mozilla.org/developers/addons) before retrying a timeout or failed submission: the upload, package creation, source attachment or metadata update may already have succeeded. Do not resubmit an existing version to repair source or notes; inspect and repair the existing submission in Developer Hub. Never delete a pending version or overwrite release assets as a shortcut.

If only automation changes, fix it on `main` and manually run Publish Firefox with the existing tag, provided that version is not already submitted. Package changes require a new shared version and GitHub release. A successful job means submitted, not approved or available in the store.

## Local validation

`npm run check` includes publication guard tests with synthetic files, temporary Git repositories and mocked Mozilla responses. No real credentials or API writes are used. The preparation CLI can also run offline against a clean tagged checkout:

```sh
node /path/to/automation/scripts/prepare-firefox-publish.mjs v0.2.2 /tmp/downloaded-release /tmp/amo-input
```

The download directory must contain the release's Firefox ZIP and `SHA256SUMS`. The output contains public AMO metadata, a reviewer source ZIP and a small publication descriptor, never credentials. Authenticated preflight is restricted to the official repository's Actions environment; installing the code does not execute it.

References, checked 2026-11-06: [Mozilla submission guide](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/), [web-ext commands](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/), [AMO metadata and custom licenses](https://mozilla.github.io/addons-server/topics/api/addons), [GitHub workflow triggering](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow#triggering-a-workflow-from-a-workflow).
