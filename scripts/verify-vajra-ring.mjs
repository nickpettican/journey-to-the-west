import { chromium } from 'playwright';

const BASE = 'http://localhost:8741/journey-to-the-west';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// Map centred on Nalanda at end of timeline — panel open, ring visible
await page.goto(`${BASE}/map/?year=695&place=nalanda`, { waitUntil: 'networkidle' });
await page.waitForTimeout(4000);
await page.screenshot({ path: 'verify-shots/vajra-ring-nalanda.png' });

// Udyana
await page.goto(`${BASE}/map/?year=695&place=udyana`, { waitUntil: 'networkidle' });
await page.waitForTimeout(4000);
await page.screenshot({ path: 'verify-shots/vajra-ring-udyana.png' });

// About page full
await page.goto(`${BASE}/about/`, { waitUntil: 'networkidle' });
await page.screenshot({ path: 'verify-shots/vajra-about-triyana.png', fullPage: true });

await browser.close();
console.log('DONE');
