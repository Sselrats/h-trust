import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('output/frames-flow');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 864, height: 864 } });
const page = await context.newPage();

await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

const scenarioBtn = page.getByRole('button', { name: '보험금 지급 심사' });
const nextBtn = page.getByRole('button', { name: 'Next Step' });
const submitBtn = page.getByRole('button', { name: '자료 제출 버튼' });

const clickIfEnabled = async (locator) => {
  if ((await locator.count()) === 0) return false;
  const el = locator.first();
  if (!(await el.isVisible())) return false;
  if (await el.isDisabled()) return false;
  await el.click();
  await page.waitForTimeout(250);
  return true;
};

let stage = 0;
let step1HoldFrames = 10; // 1s hold at 10fps
const totalFrames = 320; // 32s at capture 10fps

for (let i = 0; i < totalFrames; i += 1) {
  const file = path.join(outDir, `frame-${String(i).padStart(4, '0')}.png`);
  await page.screenshot({ path: file });

  if (stage === 0) {
    if (step1HoldFrames > 0) {
      step1HoldFrames -= 1;
    } else if (await clickIfEnabled(scenarioBtn)) {
      stage = 1;
    }
  } else if (stage === 1) {
    if (await clickIfEnabled(nextBtn)) stage = 2;
  } else if (stage === 2) {
    if (await clickIfEnabled(submitBtn)) stage = 3;
  } else if (stage === 3) {
    if (await clickIfEnabled(nextBtn)) stage = 4;
  } else if (stage === 4) {
    if (await clickIfEnabled(nextBtn)) stage = 5;
  } else if (stage === 5) {
    if (await clickIfEnabled(nextBtn)) stage = 6;
  } else if (stage === 6) {
    if (await clickIfEnabled(nextBtn)) stage = 7;
  }

  await page.waitForTimeout(100);
}

await browser.close();
console.log(`Captured ${totalFrames} frames to ${outDir}`);
