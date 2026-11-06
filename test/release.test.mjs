import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { prepareRelease } from '../scripts/check-release.mjs';

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'wipegram-release-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'docs', 'releases'), { recursive: true });
  await mkdir(path.join(root, 'dist'));
  const files = {
    'package.json': JSON.stringify({ version: '0.2.0' }),
    'package-lock.json': JSON.stringify({ version: '0.2.0', packages: { '': { version: '0.2.0' } } }),
    'CHANGELOG.md': '## [0.2.0] - 2026-11-06\n',
    'docs/releases/v0.2.0.md': '# Wipegram v0.2.0\n\n## Changes\n\n- Synthetic fixture release.\n\n## Downloads\n\nAttached files.\n\n## Install or update\n\nUse userscript manager.\n\n## Validation\n\n- Synthetic data only.\n',
    'wipegram.user.js': '// @version      0.2.0\n',
    'dist/wipegram-chromium-0.2.0.zip': 'chromium fixture',
    'dist/wipegram-firefox-0.2.0.zip': 'firefox fixture',
    'LICENSE': 'license fixture'
  };
  for (const [name, content] of Object.entries(files)) await writeFile(path.join(root, name), content);
  return root;
}

test('release checksums cover exact download bytes with flat asset names', async t => {
  const root = await fixture(t);
  const sums = await prepareRelease(root, 'v0.2.0');
  assert.equal(await readFile(path.join(root, 'dist/release/SHA256SUMS'), 'utf8'), sums);
  const rows = sums.trim().split('\n');
  assert.equal(rows.length, 4);
  for (const row of rows) {
    const [hash, name] = row.split('  ');
    const file = path.join(root, name.endsWith('.zip') ? 'dist' : '', name);
    assert.equal(hash, createHash('sha256').update(await readFile(file)).digest('hex'));
  }
});

for (const tag of ['../../escape', 'v01.2.0', 'v0.2', 'v0.2.0-beta', 'v0.3.0']) {
  test(`reject invalid or mismatched tag: ${tag}`, async t => {
    await assert.rejects(prepareRelease(await fixture(t), tag));
  });
}

for (const [name, content] of [
  ['package-lock.json', '{"version":"0.2.0","packages":{"":{"version":"0.1.0"}}}'],
  ['CHANGELOG.md', '## [Unreleased]\n'],
  ['wipegram.user.js', '// @version      0.1.0\n'],
  ['docs/releases/v0.2.0.md', '# Wipegram v0.2.0\n<version>\n'],
  ['docs/releases/v0.2.0.md', '# Wipegram v0.2.0\n## Changes\n## Downloads\nfiles\n## Install or update\nsteps\n## Validation\n- Simulated tests.\n'],
  ['dist/wipegram-firefox-0.2.0.zip', '']
]) {
  test(`reject incomplete release input: ${name}`, async t => {
    const root = await fixture(t);
    await writeFile(path.join(root, name), content);
    await assert.rejects(prepareRelease(root, 'v0.2.0'));
  });
}
