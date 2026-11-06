import { chromium } from 'playwright-core';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

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
