import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8'));
const file = path.join(ROOT, 'wipegram.user.js');

function fail(message) {
  console.error(`check-artifact: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const info = await stat(file).catch(() => null);
assert(!!info, 'wipegram.user.js is missing. Run npm run build first.');
if (!info) process.exit(1);

const source = await readFile(file, 'utf8');
assert(info.size > 40_000, `bundle looks too small (${info.size} bytes); did the build finish?`);
assert(info.size < 400_000, `bundle looks unexpectedly large (${info.size} bytes).`);

const metadata = source.match(/^\/\/ ==UserScript==\r?\n([\s\S]*?)^\/\/ ==\/UserScript==\r?\n/m);
assert(!!metadata, 'userscript metadata block is missing.');

if (metadata) {
  const lines = metadata[1].split(/\r?\n/).map(line => line.trim());
  const has = expected => lines.some(line => line === expected);

  assert(has('// @name         Wipegram'), 'metadata is missing @name Wipegram.');
  assert(has(`// @version      ${pkg.version}`), `metadata version does not match package.json (${pkg.version}).`);
  assert(has(`// @author       ${pkg.author}`), 'metadata @author does not match package.json.');
  assert(has('// @license      MIT'), 'metadata is missing @license MIT.');
  assert(has('// @grant        none'), 'metadata must use @grant none.');
  assert(has('// @noframes'), 'metadata must use @noframes.');
  assert(has('// @match        https://web.telegram.org/k/*'), 'metadata is missing the Web K match.');
  assert(has('// @match        https://web.telegram.org/k'), 'metadata is missing the Web K root match.');
  assert(has('// @match        https://web.telegram.org/a/*'), 'metadata is missing the Web A notice match.');
  assert(has('// @run-at       document-idle'), 'metadata is missing @run-at document-idle.');
  assert(has('// @namespace    https://github.com/rafelolv/Wipegram'), 'metadata namespace is unexpected.');
  assert(has('// @homepageURL  https://github.com/rafelolv/Wipegram'), 'metadata homepage URL is missing.');
  assert(has('// @supportURL   https://github.com/rafelolv/Wipegram/issues'), 'metadata support URL is missing.');
}

assert(source.includes('window.__wipegram'), 'bundle is missing the Wipegram debug handle.');
assert(source.includes('messages.deleteMessages'), 'bundle is missing the MTProto DM/group delete call.');
assert(source.includes('channels.deleteMessages'), 'bundle is missing the MTProto channel delete call.');
assert(source.includes('inputMessagesFilterPinned'), 'bundle is missing pinned-message protection.');
assert(source.includes('PINNED_UNAVAILABLE'), 'bundle is missing the pinned-load safety guard.');
assert(source.includes('Web A is not supported'), 'bundle is missing the Web A unsupported notice.');
assert(source.includes(`"${pkg.version}"`), 'bundle does not expose the package version.');
assert(!/sourceMappingURL=/.test(source), 'bundle must not reference a source map.');
assert(!/\b(?:innerHTML|outerHTML|insertAdjacentHTML|DOMParser)\b/.test(source), 'runtime must create DOM nodes without parsing HTML.');
assert(!/__WIPEGRAM_(?:VERSION|TYPE_OPTIONS)__/.test(source), 'template build placeholder was not replaced.');

try {
  new vm.Script(source, { filename: 'wipegram.user.js' });
} catch (error) {
  fail(`bundle has a syntax error: ${error.message}`);
}

if (!process.exitCode) {
  console.log(`Artifact OK: wipegram.user.js v${pkg.version} (${(info.size / 1024).toFixed(1)} KB).`);
}
