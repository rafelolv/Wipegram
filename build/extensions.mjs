import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { zip } from './zip.mjs';

const root = new URL('../', import.meta.url);
const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
const artifact = await readFile(new URL('wipegram.user.js', root));
if (!artifact.toString().includes(`// @version      ${pkg.version}\n`)) {
  throw new Error('Build the current userscript before packaging extensions.');
}
const json = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const hash = value => createHash('sha256').update(value).digest('hex');
const common = {
  'wipegram.user.js': artifact,
  LICENSE: await readFile(new URL('LICENSE', root)),
  'popup.html': await readFile(new URL('src/extension/popup.html', root)),
  'popup.css': await readFile(new URL('src/extension/popup.css', root))
};
await mkdir(new URL('dist/', root), { recursive: true });
const sums = [];
for (const browser of ['chromium', 'firefox']) {
  const manifest = {
    manifest_version: 3,
    name: 'Wipegram',
    version: pkg.version,
    description: pkg.description,
    author: pkg.author,
    homepage_url: 'https://github.com/rafelolv/Wipegram',
    action: { default_title: 'Wipegram', default_popup: 'popup.html' },
    content_scripts: [{
      matches: ['https://web.telegram.org/k/*', 'https://web.telegram.org/k', 'https://web.telegram.org/a/*', 'https://web.telegram.org/a'],
      js: ['wipegram.user.js'],
      world: 'MAIN',
      run_at: 'document_idle',
      all_frames: false
    }],
    content_security_policy: { extension_pages: "script-src 'self'; object-src 'none'" }
  };
  if (browser === 'firefox') {
    manifest.browser_specific_settings = {
      gecko: {
        id: 'wipegram@rafelolv.github.io',
        strict_min_version: '142.0',
        data_collection_permissions: { required: ['none'] }
      }
    };
  } else manifest.minimum_chrome_version = '111';

  const files = {
    ...common,
    'manifest.json': json(manifest),
    'build-info.json': json({ browser, version: pkg.version, userscriptSHA256: hash(artifact) })
  };
  const folder = new URL(`dist/${browser}/`, root);
  await rm(folder, { recursive: true, force: true });
  await mkdir(folder, { recursive: true });
  for (const [name, data] of Object.entries(files)) await writeFile(new URL(name, folder), data);
  const filename = `wipegram-${browser}-${pkg.version}.zip`;
  const archive = zip(files);
  await writeFile(new URL(`dist/${filename}`, root), archive);
  sums.push(`${hash(archive)}  ${filename}`);
  console.log(`Built dist/${browser} and dist/${filename}`);
}
await writeFile(new URL('dist/SHA256SUMS', root), sums.join('\n') + '\n');
