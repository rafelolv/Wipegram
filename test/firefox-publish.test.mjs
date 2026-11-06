import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { GUID, jwt, metadataForListing, preflightAMO, prepareFirefoxPublish, releaseSummary, validateAMOMetadata } from '../scripts/prepare-firefox-publish.mjs';

const notes = '# Wipegram v0.2.2\n\n## Changes\n\n- Fix synthetic behavior.\n\n## Downloads\n\nFiles.\n';
const sha = value => createHash('sha256').update(value).digest('hex');
function fixture(t, license = 'SEE LICENSE IN LICENSE') {
  const root = mkdtempSync(path.join(os.tmpdir(), 'wipegram-amo-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const core = '// @version      0.2.2\nsynthetic runtime';
  const archive = 'synthetic Firefox ZIP';
  const files = {
    'package.json': JSON.stringify({ version: '0.2.2', description: 'Synthetic fixture', license, userscriptLicense: 'LicenseRef-Wipegram-Proprietary' }),
    'LICENSE': 'Wipegram Proprietary License 1.0\nSynthetic license text.\n',
    'wipegram.user.js': core,
    'src/index.js': '/* synthetic source */',
    'build.mjs': '/* synthetic build */',
    'docs/releases/v0.2.2.md': notes,
    'dist/firefox/wipegram.user.js': core,
    'dist/firefox/LICENSE': 'Wipegram Proprietary License 1.0\nSynthetic license text.\n',
    'dist/firefox/manifest.json': JSON.stringify({ version: '0.2.2', browser_specific_settings: { gecko: { id: GUID } } }),
    'dist/firefox/build-info.json': JSON.stringify({ version: '0.2.2', browser: 'firefox', userscriptSHA256: sha(core) }),
    'dist/wipegram-firefox-0.2.2.zip': archive,
    'released/wipegram-firefox-0.2.2.zip': archive,
    'released/SHA256SUMS': `${sha(archive)}  wipegram-firefox-0.2.2.zip\n`,
    '.env': 'synthetic credential must not enter reviewer ZIP'
  };
  for (const [name, value] of Object.entries(files)) {
    const filename = path.join(root, name);
    mkdirSync(path.dirname(filename), { recursive: true });
    writeFileSync(filename, value);
  }
  const git = args => execFileSync('git', args, { cwd: root, stdio: 'pipe' });
  git(['init', '-q']);
  git(['add', '.']);
  git(['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'Synthetic fixture']);
  git(['tag', 'v0.2.2']);
  return { root, tag: 'v0.2.2', releaseDir: path.join(root, 'released'), output: path.join(root, 'output') };
}

test('publication preparation verifies release and produces custom license, notes and tracked source', t => {
  const input = fixture(t);
  assert.deepEqual(prepareFirefoxPublish(input), { version: '0.2.2', guid: GUID });
  const metadata = JSON.parse(readFileSync(path.join(input.output, 'amo-metadata.json')));
  assert.equal(metadata.version.license, undefined);
  assert.equal(metadata.version.custom_license.text['en-US'], readFileSync(path.join(input.root, 'LICENSE'), 'utf8'));
  assert.equal(metadata.version.release_notes['en-US'], '- Fix synthetic behavior.');
  assert.deepEqual(metadata.version.compatibility, ['firefox']);
  assert(metadata.categories.firefox.length);
  const source = readFileSync(path.join(input.output, 'source.zip'));
  assert(source.includes(Buffer.from('src/index.js')));
  assert(source.includes(Buffer.from('build.mjs')));
  assert(!source.includes(Buffer.from('.env')));
  assert(!source.includes(Buffer.from('dist/firefox/')));
});

for (const [name, value] of [
  ['package.json', '{"version":"0.2.1"}'],
  ['dist/firefox/manifest.json', JSON.stringify({ version: '0.2.2', browser_specific_settings: { gecko: { id: 'other@invalid' } } })],
  ['dist/firefox/wipegram.user.js', 'changed runtime'],
  ['dist/firefox/LICENSE', 'different license'],
  ['released/wipegram-firefox-0.2.2.zip', 'different package'],
  ['released/SHA256SUMS', `${'0'.repeat(64)}  wipegram-firefox-0.2.2.zip\n`],
  ['src/index.js', 'modified tracked source'],
  ['docs/releases/v0.2.2.md', '# Wipegram v0.2.2\n## Changes\n- <placeholder>\n']
]) {
  test(`publication rejects mismatched release input: ${name}`, t => {
    const input = fixture(t);
    writeFileSync(path.join(input.root, name), value);
    assert.throws(() => prepareFirefoxPublish(input));
  });
}

test('publication refuses path-like tags, leading zeros and untagged commits', t => {
  const input = fixture(t);
  for (const tag of ['../../escape', 'v00.2.2', 'v0.2.2-beta', 'v0.2']) assert.throws(() => prepareFirefoxPublish({ ...input, tag }));
  execFileSync('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--allow-empty', '-qm', 'Another commit'], { cwd: input.root });
  assert.throws(() => prepareFirefoxPublish(input), /exact release tag/);
});

test('older MIT tags keep MIT metadata instead of acquiring proprietary terms', t => {
  const input = fixture(t, 'MIT');
  prepareFirefoxPublish(input);
  const metadata = JSON.parse(readFileSync(path.join(input.output, 'amo-metadata.json')));
  assert.equal(metadata.version.license, 'MIT');
  assert.equal(metadata.version.custom_license, undefined);
});

test('release summary is bounded and never includes installation sections', () => {
  assert.equal(releaseSummary(notes), '- Fix synthetic behavior.');
  assert.throws(() => releaseSummary('## Changes\n- ' + 'x'.repeat(3000)), /3000/);
  assert.throws(() => releaseSummary('## Downloads\nFiles.'), /Changes/);
});

test('updates preserve existing listing fields while sending current license and version notes', () => {
  const metadata = { name: { 'en-US': 'Wipegram' }, summary: { 'en-US': 'First listing' }, version: { custom_license: { name: 'Current license' }, release_notes: { 'en-US': 'Current changes' } } };
  assert.deepEqual(metadataForListing(metadata, false), metadata);
  assert.deepEqual(metadataForListing(metadata, true), { version: metadata.version });
});

test('JWT is signed with HS256, short lived and unique', () => {
  const first = jwt('synthetic issuer', 'synthetic secret');
  const [header, body, signature] = first.split('.');
  assert.equal(JSON.parse(Buffer.from(header, 'base64url')).alg, 'HS256');
  const claims = JSON.parse(Buffer.from(body, 'base64url'));
  assert.equal(claims.iss, 'synthetic issuer');
  assert.equal(claims.exp - claims.iat, 60);
  assert.equal(signature, createHmac('sha256', 'synthetic secret').update(`${header}.${body}`).digest('base64url'));
  assert.notEqual(first, jwt('synthetic issuer', 'synthetic secret'));
});

const credentials = { version: '0.2.2', issuer: 'synthetic issuer', secret: 'synthetic secret' };
const response = (value, status = 200) => ({ status, ok: status >= 200 && status < 300, json: async () => value });
test('preflight supports first submission and sends credentials only to Mozilla without redirects', async () => {
  const result = await preflightAMO({ ...credentials, fetchAPI: async (url, options) => {
    assert(url.startsWith('https://addons.mozilla.org/api/v5/'));
    assert.equal(options.redirect, 'error');
    assert(options.headers.Authorization.startsWith('JWT '));
    return response({}, 404);
  } });
  assert.equal(result, 'First listed submission');
});

test('preflight checks pending versions across pagination before allowing update', async () => {
  const replies = [response({ guid: GUID }), response({}, 404), response({ results: [{ version: '0.2.1' }], next: 'yes' }), response({ results: [], next: null })];
  assert.equal(await preflightAMO({ ...credentials, fetchAPI: async () => replies.shift() }), 'Existing listing update');
  assert.equal(replies.length, 0);
});

for (const failure of ['duplicate', 'older', 'identity', 'unauthorized', 'timeout', 'unreadable']) {
  test(`preflight rejects ${failure} without leaking response content`, async () => {
    let calls = 0;
    const fetchAPI = async () => {
      calls++;
      if (failure === 'timeout') throw new Error('synthetic secret');
      if (failure === 'unreadable') return response(null);
      if (failure === 'unauthorized') return response({ message: 'synthetic secret' }, 403);
      if (calls === 1) return response({ guid: failure === 'identity' ? 'other@invalid' : GUID });
      if (calls === 2) return response({}, failure === 'duplicate' ? 200 : 404);
      return response({ results: [{ version: '0.3.0' }], next: null });
    };
    await assert.rejects(preflightAMO({ ...credentials, fetchAPI }), error => !error.message.includes('synthetic secret'));
  });
}

for (const [field, limit] of [['name', 50], ['summary', 250], ['description', 15000]]) {
  test(`Firefox ${field} accepts its character limit and refuses overflow`, () => {
    const metadata = { name: { 'en-US': 'Wipegram' }, summary: { 'en-US': 'Clean your messages' }, description: { 'en-US': 'Scan and review before deleting.' } };
    metadata[field]['en-US'] = 'x'.repeat(limit);
    assert.doesNotThrow(() => validateAMOMetadata(metadata));
    metadata[field]['en-US'] += 'x';
    assert.throws(() => validateAMOMetadata(metadata), new RegExp(`${limit} characters`));
    metadata[field]['en-US'] = '🟢'.repeat(limit);
    assert.doesNotThrow(() => validateAMOMetadata(metadata));
    metadata[field]['en-US'] = ' ';
    assert.throws(() => validateAMOMetadata(metadata), /Empty Firefox/);
  });
}
