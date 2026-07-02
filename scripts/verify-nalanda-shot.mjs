/** Scroll the Nālandā tour and screenshot every station (śikhara check). */
import { chromium } from 'playwright';

const BASE = 'http://localhost:8741/journey-to-the-west';
const shots = 'verify-shots';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
	if (m.type() === 'error') errors.push(`console: ${m.text()}`);
});

await page.goto(`${BASE}/nalanda/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
await page.screenshot({ path: `${shots}/nl-00-hero.png` });

const stations = await page.locator('.station').count();
console.log('stations:', stations);

for (let i = 0; i < stations; i++) {
	await page.evaluate((k) => {
		const el = document.querySelectorAll('.station')[k];
		const r = el.getBoundingClientRect();
		window.scrollBy(0, r.top + r.height / 2 - window.innerHeight / 2);
	}, i);
	await page.waitForTimeout(3400);
	await page.screenshot({ path: `${shots}/nl-${String(i + 1).padStart(2, '0')}.png` });
	console.log('shot station', i + 1);
}

console.log(errors.length ? `ERRORS:\n  ${errors.join('\n  ')}` : 'no page errors');
await browser.close();
