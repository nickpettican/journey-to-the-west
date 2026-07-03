/** Screenshot landscape-heavy stations of both tours; report model 404s. */
import { chromium } from 'playwright';

const BASE = 'http://localhost:8741/journey-to-the-west';
const shots = 'verify-shots';
const browser = await chromium.launch({ channel: 'chrome', headless: true });

async function tour(path, tag, stations) {
	const page = await browser.newPage({ viewport: { width: 1400, height: 820 } });
	const problems = [];
	page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
	page.on('response', (r) => {
		if (r.url().includes('/models/') && r.status() >= 400)
			problems.push(`${r.status()} ${r.url().split('/').pop()}`);
	});
	await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
	await page.waitForTimeout(2500);
	for (const i of stations) {
		await page.evaluate((k) => {
			const el = document.querySelectorAll('.station')[k];
			const r = el.getBoundingClientRect();
			window.scrollBy(0, r.top + r.height / 2 - window.innerHeight / 2);
		}, i);
		await page.waitForTimeout(3200);
		await page.screenshot({ path: `${shots}/${tag}-st${i}.png` });
		console.log(`${tag} station ${i} shot`);
	}
	console.log(`${tag}: ${problems.length ? problems.join(' | ') : 'no errors / no model 404s'}`);
	await page.close();
}

await tour('/nalanda/', 'nal', [2, 6, 20]);
await tour('/bodh-gaya/', 'bg', [1, 2, 8]);
await browser.close();
