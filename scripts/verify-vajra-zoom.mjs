import { chromium } from 'playwright';

const BASE = 'http://localhost:8741/journey-to-the-west';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });

await page.goto(`${BASE}/map/?year=695`, { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);
await page.mouse.move(660, 350);
for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, -400); await page.waitForTimeout(600); }
await page.mouse.move(1050, 490);
for (let i = 0; i < 5; i++) { await page.mouse.wheel(0, -400); await page.waitForTimeout(600); }
await page.mouse.move(934, 540);
for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, -400); await page.waitForTimeout(600); }
await page.waitForTimeout(1500);
await page.screenshot({ path: 'verify-shots/vajra-ring-closeup.png', clip: { x: 790, y: 440, width: 260, height: 220 } });
await browser.close();
console.log('DONE');
