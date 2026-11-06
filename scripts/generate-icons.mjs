import { chromium } from 'playwright-core';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';

const root = fileURLToPath(new URL('../', import.meta.url));
const browser = await chromium.launch({
  executablePath: process.env.WIPEGRAM_CHROME || chromium.executablePath(),
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
});
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.join(root, 'images/icon.svg')).href);
  for (const size of [48, 64, 128]) {
    await page.setViewportSize({ width: size, height: size });
    await page.locator('svg').evaluate((svg, pixels) => {
      svg.setAttribute('width', String(pixels));
      svg.setAttribute('height', String(pixels));
    }, size);
    await page.screenshot({ path: path.join(root, `images/icon-${size}.png`), omitBackground: true });
    console.log(`Generated images/icon-${size}.png`);
  }
} finally {
  await browser.close();
}

// Keep the README mark identical to the canonical icon, without remote assets.
const icon = await readFile(path.join(root, 'images/icon.svg'), 'utf8');
const artwork = icon.replace(/^[\s\S]*?<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<title\b[^>]*>[\s\S]*?<\/title>/, '').trim();
const bannerFile = path.join(root, 'docs/readme-banner.svg');
const banner = await readFile(bannerFile, 'utf8');
await writeFile(bannerFile, banner.replace(/<!-- BRAND_MARK_START -->[\s\S]*?<!-- BRAND_MARK_END -->/, `<!-- BRAND_MARK_START -->\n  <svg x="56" y="64" width="104" height="104" viewBox="0 0 128 128" aria-hidden="true">${artwork}</svg>\n  <!-- BRAND_MARK_END -->`));
console.log('Updated docs/readme-banner.svg from images/icon.svg');
