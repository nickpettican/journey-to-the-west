/**
 * Smoke-test the built site in a real browser against the GitHub Pages
 * subpath simulation (run scripts/serve first; see package.json verify note).
 * Usage: node scripts/verify-site.mjs [baseUrl]
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:8741/journey-to-the-west';
const shots = 'verify-shots';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (msg) => {
	if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
});

async function visit(path, name, waitMs = 2500) {
	await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
	await page.waitForTimeout(waitMs);
	await page.screenshot({ path: `${shots}/${name}.png` });
	console.log(`✓ ${path} → ${shots}/${name}.png`);
}

await visit('/', 'landing');
await visit('/map/', 'map-explorer', 4500);

// open Nālandā from the URL param (shareable state)
await visit('/map/?year=695&place=nalanda', 'map-nalanda-panel', 4500);
const witnessTab = await page.getByRole('button', { name: /three witnesses/i }).count();
console.log(`witness tab present: ${witnessTab > 0}`);

// scrolly: scroll a few cards in
await page.goto(`${BASE}/journeys/xuanzang/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);
await page.screenshot({ path: `${shots}/scrolly-top.png` });
await page.mouse.wheel(0, 6000);
await page.waitForTimeout(2500);
await page.screenshot({ path: `${shots}/scrolly-mid.png` });
console.log('✓ /journeys/xuanzang/ scrolled');

await visit('/places/bodh-gaya/', 'place-page', 1500);
await visit('/bodh-gaya/', 'bodh-gaya-placeholder', 1500);

// timeline interaction: drag the year back and confirm fewer places
await page.goto(`${BASE}/map/?year=405`, { waitUntil: 'networkidle' });
await page.waitForTimeout(4000);
await page.screenshot({ path: `${shots}/map-405.png` });

const ignorable = /terrain|elevation-tiles|favicon|s3\.amazonaws/i;
const real = errors.filter((e) => !ignorable.test(e));
console.log(real.length ? `\nERRORS:\n${real.join('\n')}` : '\nno page errors');
await browser.close();
process.exit(real.length ? 1 : 0);
