import { chromium } from 'playwright';
const B = 'http://localhost:8741/journey-to-the-west';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
// about page (edited prose)
await page.goto(`${B}/about/`, { waitUntil: 'networkidle' });
await page.screenshot({ path: 'verify-shots/hum-about.png', fullPage: false });
// bodh-gaya approach card
await page.goto(`${B}/bodh-gaya/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
await page.screenshot({ path: 'verify-shots/hum-bg-approach.png' });
await browser.close(); console.log('done');
