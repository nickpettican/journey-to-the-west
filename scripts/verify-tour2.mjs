// Screenshot every station of the rebuilt /nalanda tour.
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'http://localhost:8741/journey-to-the-west';
fs.mkdirSync('verify-shots', { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${BASE}/nalanda/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

const n = await page.locator('.station').count();
console.log('stations:', n);
for (let i = 0; i < n; i++) {
	await page.evaluate((idx) => {
		const el = document.querySelectorAll('.station')[idx];
		const r = el.getBoundingClientRect();
		window.scrollBy(0, r.top + r.height / 2 - window.innerHeight / 2);
	}, i);
	await page.waitForTimeout(2400); // let the damped scrub settle
	await page.screenshot({ path: `verify-shots/tour2-${String(i).padStart(2, '0')}.png` });
	console.log('shot', i);
}
await browser.close();
