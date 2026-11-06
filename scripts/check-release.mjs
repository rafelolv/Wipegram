import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function prepareRelease(root, tag) {
  // Validate before using a tag in a filesystem path.
  assert.match(tag || '', /^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/, 'Expected vMAJOR.MINOR.PATCH');
  const version = tag.slice(1);
  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  const lock = JSON.parse(await readFile(path.join(root, 'package-lock.json'), 'utf8'));
  assert.equal(pkg.version, version, 'Release tag must match package.json');
  assert.equal(lock.version, version, 'Lockfile version must match release');
  assert.equal(lock.packages?.['']?.version, version, 'Lockfile root version must match release');

  const changelog = await readFile(path.join(root, 'CHANGELOG.md'), 'utf8');
  const escapedVersion = version.replaceAll('.', '\\.');
  assert.match(changelog, new RegExp(`^## \\[${escapedVersion}\\] - \\d{4}-\\d{2}-\\d{2}$`, 'm'), 'Missing dated changelog section');
  const notes = await readFile(path.join(root, 'docs', 'releases', `${tag}.md`), 'utf8');
  assert(notes.includes(`# Wipegram ${tag}\n`), 'Notes must identify the release');
  assert(!/<[^>\n]+>|\b(?:TODO|TBD)\b/.test(notes), 'Replace release-note placeholders');
  for (const heading of ['Changes', 'Downloads', 'Install or update', 'Validation']) {
    const section = notes.match(new RegExp(`^## ${heading}\\r?\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, 'm'));
    assert(section?.[1].trim(), `Missing or empty ${heading} section`);
    if (heading === 'Changes' || heading === 'Validation') {
      assert.match(section[1], /^- \S.+/m, `${heading} requires bullet points`);
    }
  }

  const userscript = await readFile(path.join(root, 'wipegram.user.js'));
  assert.match(userscript.toString(), new RegExp(`^// @version +${escapedVersion}\\r?$`, 'm'), 'Rebuild userscript for the release version');
  const assets = [
    ['wipegram.user.js', userscript],
    [`wipegram-chromium-${version}.zip`, await readFile(path.join(root, 'dist', `wipegram-chromium-${version}.zip`))],
    [`wipegram-firefox-${version}.zip`, await readFile(path.join(root, 'dist', `wipegram-firefox-${version}.zip`))],
    ['LICENSE', await readFile(path.join(root, 'LICENSE'))]
  ];
  for (const [name, data] of assets) assert(data.length, `Empty release asset: ${name}`);
  const sums = assets.map(([name, data]) => `${createHash('sha256').update(data).digest('hex')}  ${name}\n`).join('');
  const output = path.join(root, 'dist', 'release');
  await mkdir(output, { recursive: true });
  await writeFile(path.join(output, 'SHA256SUMS'), sums);
  return sums;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  try {
    await prepareRelease(root, process.argv[2]);
    console.log(`Release inputs OK: ${process.argv[2]}; checksums in dist/release/SHA256SUMS.`);
  } catch (error) {
    console.error(`check-release: ${error.message}`);
    process.exitCode = 1;
  }
}
