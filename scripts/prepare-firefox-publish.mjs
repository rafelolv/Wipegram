import assert from 'node:assert/strict';
import { createHash, createHmac, randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const GUID = 'wipegram@rafelolv.github.io';
const API = 'https://addons.mozilla.org/api/v5/';
const VERSION = /^(?:0|[1-9]\d{0,8})\.(?:0|[1-9]\d{0,8})\.(?:0|[1-9]\d{0,8})$/;
const hash = data => createHash('sha256').update(data).digest('hex');

// Mozilla listing limits: addons-server/src/olympia/addons/models.py.
// Count Unicode characters as AMO does; reject oversized text rather than truncating it.
export function validateAMOMetadata(metadata) {
  for (const [field, limit] of [['name', 50], ['summary', 250], ['description', 15000]]) {
    const translations = metadata[field];
    assert(translations && typeof translations === 'object', `Missing Firefox ${field}`);
    for (const text of Object.values(translations)) {
      assert(typeof text === 'string' && text.trim(), `Empty Firefox ${field}`);
      assert(Array.from(text).length <= limit, `Firefox ${field} exceeds ${limit} characters`);
    }
  }
}

export function releaseSummary(notes) {
  const changes = notes.split(/^## Changes[ \t]*\r?\n/m)[1]?.split(/^## /m)[0].trim();
  assert(changes && /^- \S/m.test(changes), 'English Changes bullets are required');
  assert(!/<[^>\n]+>|\b(?:TODO|TBD)\b/.test(changes), 'Replace release-note placeholders');
  assert(Array.from(changes).length <= 3000, 'Firefox Changes summary exceeds 3000 characters');
  return changes;
}

export function prepareFirefoxPublish({ root, tag, releaseDir, output }) {
  assert(tag?.startsWith('v') && VERSION.test(tag.slice(1)), 'Expected vMAJOR.MINOR.PATCH without leading zeros');
  const version = tag.slice(1);
  const read = name => readFileSync(path.join(root, name));
  const pkg = JSON.parse(read('package.json'));
  const manifest = JSON.parse(read('dist/firefox/manifest.json'));
  const info = JSON.parse(read('dist/firefox/build-info.json'));
  const core = read('wipegram.user.js');
  const publicVersion = core.toString().match(/^\/\/ @version\s+(\S+)/m)?.[1];
  for (const actual of [pkg.version, manifest.version, info.version, publicVersion]) {
    assert.equal(actual, version, 'Tag, package, userscript and Firefox versions must match');
  }
  assert.equal(manifest.browser_specific_settings?.gecko?.id, GUID, 'Unexpected Firefox add-on identity');
  assert.equal(info.browser, 'firefox', 'Expected Firefox build information');
  assert(read('dist/firefox/wipegram.user.js').equals(core), 'Packaged runtime differs from userscript');
  assert.equal(info.userscriptSHA256, hash(core), 'Packaged runtime hash mismatch');
  const license = read('LICENSE');
  assert(read('dist/firefox/LICENSE').equals(license), 'Packaged license differs from source');
  const filename = `wipegram-firefox-${version}.zip`;
  const archive = readFileSync(path.join(releaseDir, filename));
  assert(archive.length > 0 && archive.length <= 200 * 1024 * 1024, 'Firefox ZIP must be nonempty and at most 200 MiB');
  assert(archive.equals(read(`dist/${filename}`)), 'Published Firefox ZIP differs from rebuilt release');
  const sums = readFileSync(path.join(releaseDir, 'SHA256SUMS'), 'utf8').split(/\r?\n/);
  assert(sums.includes(`${hash(archive)}  ${filename}`), 'Published checksum does not match Firefox ZIP');
  const notes = read(`docs/releases/${tag}.md`).toString();
  assert(notes.includes(`# Wipegram ${tag}\n`), 'Release notes identify another version');
  const summary = releaseSummary(notes);
  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  assert.equal(git(['rev-parse', 'HEAD']), git(['rev-parse', `refs/tags/${tag}^{commit}`]), 'Checkout must match the exact release tag');
  assert.equal(git(['diff', '--name-only', 'HEAD', '--', 'src', 'build', 'scripts', 'test', 'images', 'docs',
    'package.json', 'package-lock.json', 'build.mjs', 'LICENSE', 'README.md', 'AGENTS.md', 'wipegram.user.js']),
  '', 'Tracked release inputs differ from the tagged commit');
  // Reviewer sources come only from tracked build inputs at the release commit.
  const sourcePaths = execFileSync('git', ['ls-tree', '-r', '--name-only', '-z', 'HEAD', '--',
    'src', 'build', 'scripts', 'test', 'images', 'docs', 'package.json',
    'package-lock.json', 'build.mjs', 'LICENSE', 'README.md', 'AGENTS.md'],
  { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
  assert(sourcePaths.length, 'Tracked reviewer source is missing');
  const source = execFileSync('git', ['archive', '--format=zip', 'HEAD', '--', ...sourcePaths],
    { cwd: root, maxBuffer: 50 * 1024 * 1024 });
  const versionMetadata = {
    release_notes: { 'en-US': summary },
    compatibility: ['firefox'],
    approval_notes: 'Build from the attached tagged source with Node.js 24, npm ci and npm run build:extensions. The generated userscript is included byte-for-byte in the extension. Icons are pre-generated and tracked; no browser is needed to rebuild. No remote executable code, telemetry or background deletion. Tests use simulated Telegram data. Manual deletion is irreversible: use only your own disposable Telegram Web K chat and explicitly confirm a small selection.'
  };
  if (pkg.license === 'MIT') versionMetadata.license = 'MIT';
  else {
    assert.equal(pkg.license, 'SEE LICENSE IN LICENSE', 'Review the new license before store publication');
    assert.equal(pkg.userscriptLicense, 'LicenseRef-Wipegram-Proprietary', 'Unknown proprietary license');
    versionMetadata.custom_license = {
      name: { 'en-US': license.toString().split(/\r?\n/)[0] },
      text: { 'en-US': license.toString() }
    };
  }
  // Full listing fields support first submission; web-ext uses version metadata
  // for updates, so an old MIT store license is never silently inherited.
  const metadata = {
    name: { 'en-US': 'Wipegram' },
    summary: { 'en-US': pkg.description },
    categories: { firefox: ['privacy-security'] },
    default_locale: 'en-US',
    description: { 'en-US': 'Clean up your messages in Telegram Web K groups, forum topics and channel discussion groups. Scan, review matches and confirm deletion. Supports text, date and media filters, pinned-message protection, Stop and local reports. By default, only your own messages are selected. Including everyone’s messages requires explicit admin mode and verified deletion rights in a group or channel. Telegram Web A is unsupported. Created by Rafael (rafaelolv). Deletions cannot be undone.' },
    homepage: { 'en-US': 'https://github.com/rafelolv/Wipegram' },
    support_url: { 'en-US': 'https://github.com/rafelolv/Wipegram/issues' },
    version: versionMetadata
  };
  validateAMOMetadata(metadata);
  mkdirSync(output, { recursive: true });
  writeFileSync(path.join(output, 'amo-metadata.json'), JSON.stringify(metadata, null, 2) + '\n');
  writeFileSync(path.join(output, 'source.zip'), source);
  writeFileSync(path.join(output, 'publication.json'), JSON.stringify({ version, guid: GUID, archiveSHA256: hash(archive) }) + '\n');
  return { version, guid: GUID };
}

export function jwt(issuer, secret) {
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const iat = Math.floor(Date.now() / 1000);
  const body = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ iss: issuer, jti: randomUUID(), iat, exp: iat + 60 })}`;
  return `${body}.${createHmac('sha256', secret).update(body).digest('base64url')}`;
}

export function metadataForListing(metadata, exists) {
  return exists ? { version: metadata.version } : metadata;
}

export async function preflightAMO({ version, issuer, secret, fetchAPI = fetch }) {
  assert(VERSION.test(version), 'Invalid Firefox version');
  assert(issuer && secret, 'Configure AMO_JWT_ISSUER and AMO_JWT_SECRET as Actions secrets');
  async function get(relative, allowMissing = false) {
    let response;
    try {
      response = await fetchAPI(API + relative, {
        headers: { Authorization: `JWT ${jwt(issuer, secret)}` },
        redirect: 'error', signal: AbortSignal.timeout(30000)
      });
    } catch { throw new Error('AMO preflight failed or timed out; inspect Developer Hub before retrying'); }
    if (allowMissing && response.status === 404) return null;
    if (!response.ok) throw new Error(`AMO preflight returned HTTP ${response.status}; inspect Developer Hub before retrying`);
    try {
      const data = await response.json();
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid shape');
      return data;
    } catch { throw new Error('AMO preflight returned unreadable data'); }
  }
  const listing = `addons/addon/${encodeURIComponent(GUID)}/`;
  const addon = await get(listing, true);
  if (!addon) return 'First listed submission';
  assert.equal(addon.guid, GUID, 'AMO listing identity mismatch');
  assert.equal(await get(`${listing}versions/${version}/`, true), null, 'Version already exists on AMO; never resubmit or replace it');
  // Check every existing version, including pending/unlisted versions.
  for (let page = 1; page <= 100; page++) {
    const versions = await get(`${listing}versions/?filter=all_with_unlisted&page_size=50&page=${page}`);
    assert(Array.isArray(versions.results), 'Invalid AMO version history');
    for (const item of versions.results) {
      assert(/^\d+(?:\.\d+){0,3}$/.test(item.version), 'Unrecognized existing AMO version; inspect Developer Hub');
      const existing = item.version.split('.').map(Number);
      const requested = version.split('.').map(Number);
      let comparison = 0;
      for (let index = 0; index < 4 && !comparison; index++) comparison = (requested[index] || 0) - (existing[index] || 0);
      assert(comparison > 0, 'Version must be newer than every existing AMO version');
    }
    if (!versions.next) return 'Existing listing update';
  }
  throw new Error('AMO version history exceeds preflight limit; inspect Developer Hub');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv[2] === '--preflight') {
      assert(process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_REPOSITORY === 'rafelolv/Wipegram', 'Preflight is restricted to official GitHub Actions');
      const { version, guid } = JSON.parse(readFileSync(path.join(process.argv[3], 'publication.json')));
      assert.equal(guid, GUID, 'Publication identity mismatch');
      const result = await preflightAMO({ version, issuer: process.env.AMO_JWT_ISSUER, secret: process.env.AMO_JWT_SECRET });
      const filename = path.join(process.argv[3], 'amo-metadata.json');
      const metadata = JSON.parse(readFileSync(filename));
      writeFileSync(filename, JSON.stringify(metadataForListing(metadata, result === 'Existing listing update'), null, 2) + '\n');
      console.log(result);
    } else {
      const [tag, releaseDir, output] = process.argv.slice(2);
      assert(releaseDir && output, 'Usage: prepare-firefox-publish.mjs <tag> <release-dir> <output-dir>');
      const result = prepareFirefoxPublish({ root: process.cwd(), tag, releaseDir, output });
      console.log(`Verified Firefox ${result.version} for ${result.guid}`);
    }
  } catch (error) {
    // Assertion text is controlled; never log raw API/transport/process payloads.
    console.error(error?.code === 'ERR_ASSERTION' ? error.message.split('\n')[0]
      : error?.message?.startsWith('AMO ') ? error.message
        : 'Firefox publication preparation failed; inspect tag, build and release inputs');
    process.exitCode = 1;
  }
}
