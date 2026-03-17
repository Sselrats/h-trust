import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const idx = args.indexOf(name);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
};

const url = getArg('--url', 'http://127.0.0.1:3000/?demo=1');
const outDir = path.resolve(getArg('--framesDir', 'output/frames'));
const totalFrames = Number(getArg('--frames', '180'));

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 864, height: 864 } });
const page = await context.newPage();

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

for (let i = 0; i < totalFrames; i += 1) {
  const file = path.join(outDir, `frame-${String(i).padStart(4, '0')}.png`);
  await page.screenshot({ path: file });
  await page.waitForTimeout(100);
}

await browser.close();
console.log(`Captured ${totalFrames} frames to ${outDir} from ${url}`);
