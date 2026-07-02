// One-off: screenshot landscape views of both tours to check the rice fields.
import { chromium } from 'playwright';

const BASE = 'http://localhost:8741/journey-to-the-west';
const shots = [
	{ route: 'bodh-gaya', station: 0, name: 'rice-bg-approach' },
	{ route: 'bodh-gaya', station: 22, name: 'rice-bg-overview' },
	{ route: 'nalanda', station: 17, name: 'rice-nl-tanks' },
	{ route: 'nalanda', station: 0, name: 'rice-nl-approach' }
];

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const s of shots) {
	await page.goto(`${BASE}/${s.route}/`, { waitUntil: 'networkidle' });
	await page.waitForTimeout(4000); // models
	await page.evaluate((i) => {
		const el = document.querySelectorAll('.station')[i];
		el.scrollIntoView({ block: 'center' });
	}, s.station);
	await page.waitForTimeout(2500);
	await page.screenshot({ path: `verify-shots/${s.name}.png` });
	console.log(s.name, 'done');
}
await browser.close();
