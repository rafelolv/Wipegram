import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { inflateRawSync } from 'node:zlib';

const root = new URL('../', import.meta.url);
const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
const artifact = await readFile(new URL('wipegram.user.js', root));
const hash = value => createHash('sha256').update(value).digest('hex');
const sums = await readFile(new URL('dist/SHA256SUMS', root), 'utf8');

for (const browser of ['chromium', 'firefox']) {
  const folder = new URL(`dist/${browser}/`, root);
  const manifest = JSON.parse(await readFile(new URL('manifest.json', folder), 'utf8'));
  assert.equal(manifest.version, pkg.version);
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.permissions, undefined, 'No extra API permissions needed');
  assert.equal(manifest.host_permissions, undefined);
  assert.equal(manifest.background, undefined, 'No background deletion');
  assert.equal(manifest.web_accessible_resources, undefined);
  assert.equal(manifest.content_scripts.length, 1);
  const script = manifest.content_scripts[0];
  assert.equal(script.world, 'MAIN', 'Telegram bridge needs the page world');
  assert.equal(script.all_frames, false);
  assert.equal(script.run_at, 'document_idle');
  assert.deepEqual(script.js, ['wipegram.user.js']);
  assert.deepEqual(script.matches, [
    'https://web.telegram.org/k/*', 'https://web.telegram.org/k',
    'https://web.telegram.org/a/*', 'https://web.telegram.org/a'
  ]);
  if (browser === 'firefox') {
    assert.equal(manifest.browser_specific_settings.gecko.strict_min_version, '142.0');
    assert.deepEqual(manifest.browser_specific_settings.gecko.data_collection_permissions.required, ['none']);
  }
  assert.deepEqual(await readFile(new URL('wipegram.user.js', folder)), artifact);
  const info = JSON.parse(await readFile(new URL('build-info.json', folder), 'utf8'));
  assert.equal(info.userscriptSHA256, hash(artifact));
  const popup = await readFile(new URL(manifest.action.default_popup, folder), 'utf8');
  assert(!/<(?:script|button|input|form)\b/i.test(popup), 'Popup must not execute deletion');
  assert(!/\bon\w+\s*=/i.test(popup));

  const filename = `wipegram-${browser}-${pkg.version}.zip`;
  const archive = await readFile(new URL(`dist/${filename}`, root));
  assert(sums.includes(`${hash(archive)}  ${filename}\n`));
  const names = [];
  let offset = 0;
  while (archive.readUInt32LE(offset) === 0x04034b50) {
    const size = archive.readUInt32LE(offset + 18);
    const nameLength = archive.readUInt16LE(offset + 26);
    const extraLength = archive.readUInt16LE(offset + 28);
    const name = archive.subarray(offset + 30, offset + 30 + nameLength).toString();
    const start = offset + 30 + nameLength + extraLength;
    const data = inflateRawSync(archive.subarray(start, start + size));
    assert(!name.includes('..') && !name.startsWith('/'));
    assert.deepEqual(data, await readFile(new URL(name, folder)), `ZIP entry differs: ${name}`);
    names.push(name);
    offset = start + size;
  }
  assert.deepEqual(names.sort(), ['LICENSE', 'build-info.json', 'manifest.json', 'popup.css', 'popup.html', 'wipegram.user.js'].sort());
  assert.equal(archive.readUInt32LE(archive.length - 22), 0x06054b50);
  assert.equal(archive.readUInt16LE(archive.length - 12), names.length);
  console.log(`Extension OK: ${browser} v${pkg.version}, identical runtime, verified ZIP and checksum.`);
}
