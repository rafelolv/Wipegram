import { build, context } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { templatesPlugin } from './build/templates.mjs';

const pkg = JSON.parse(await readFile(new URL('./package.json', import.meta.url), 'utf8'));
const watch = process.argv.includes('--watch');

const metadata = `// ==UserScript==
// @name         Wipegram
// @namespace    https://github.com/rafelolv/Wipegram
// @version      ${pkg.version}
// @description  Bulk-delete your own messages in Telegram Web K chats
// @author       ${pkg.author}
// @homepageURL  https://github.com/rafelolv/Wipegram
// @supportURL   https://github.com/rafelolv/Wipegram/issues
// @license      MIT
// @match        https://web.telegram.org/k/*
// @match        https://web.telegram.org/k
// @match        https://web.telegram.org/a/*
// @match        https://web.telegram.org/a
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==
`;

const options = {
  entryPoints: ['src/index.js'],
  outfile: 'wipegram.user.js',
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['chrome100', 'firefox100'],
  charset: 'utf8',
  legalComments: 'none',
  sourcemap: false,
  minify: false,
  banner: { js: metadata },
  define: {
    __VERSION__: JSON.stringify(pkg.version)
  },
  loader: {
    '.css': 'text'
  },
  plugins: [templatesPlugin(pkg.version)]
};

if (watch) {
  const ctx = await context(options);
  await ctx.watch();
  console.log('Watching src/ for changes…');
} else {
  await build(options);
  console.log(`Built wipegram.user.js v${pkg.version}`);
}
