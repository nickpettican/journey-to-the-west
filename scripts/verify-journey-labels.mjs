/** Verify Option A: place-name labels on the journeys scrollytelling map —
 *  the current-stop label (pilgrim-coloured) and the cumulative trail. */
import { chromium } from 'playwright';

const BASE = 'http://localhost:8741/journey-to-the-west';
const shots = 'verify-shots';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];

const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

await page.goto(`${BASE}/journeys/xuanzang/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);
await page.screenshot({ path: `${shots}/jl-start.png` });

// helper: read which label layers exist + how many trail features are shown
const labelState = () =>
	page.evaluate(() => {
		const m = window.__mlMap || null;
		// find the maplibre instance via the canvas' stored map if exposed; else null
		return m ? Object.keys(m.style._layers || {}) : 'no-handle';
	});

const next = page.getByRole('button', { name: 'Next place' });
// advance several stops so a trail accumulates
for (let i = 0; i < 6; i++) {
	await next.click();
	await page.waitForTimeout(700);
}
await page.waitForTimeout(1500);
await page.screenshot({ path: `${shots}/jl-after-6.png` });
console.log('counter:', await page.locator('.stop-nav .counter').textContent());

const ignorable = /terrain|elevation-tiles|favicon|s3\.amazonaws/i;
const real = errors.filter((e) => !ignorable.test(e));
console.log(real.length ? `ERRORS:\n${real.join('\n')}` : 'no page errors');
await browser.close();
process.exit(real.length ? 1 : 0);
