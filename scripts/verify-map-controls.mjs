import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
// mobile
let page = await browser.newPage({ viewport: { width: 390, height: 780 } });
await page.goto('http://localhost:8741/journey-to-the-west/map/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await page.screenshot({ path: 'verify-shots/map-mobile-closed.png' });
await page.locator('.controls-overlay summary').click();
await page.waitForTimeout(400);
await page.screenshot({ path: 'verify-shots/map-mobile-open.png' });
await page.close();
// desktop
page = await browser.newPage({ viewport: { width: 1280, height: 820 } });
await page.goto('http://localhost:8741/journey-to-the-west/map/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await page.screenshot({ path: 'verify-shots/map-desktop.png' });
await browser.close();
console.log('done');
