/** Verify the tweak round: hero/nav/burger, MSV filter, journey arrows, mobile scrolly. */
import { chromium } from 'playwright';

const BASE = 'http://localhost:8741/journey-to-the-west';
const shots = 'verify-shots';
const browser = await chromium.launch({ channel: 'chrome', headless: true });

const errors = [];

// --- desktop pass
const desktop = await browser.newPage({ viewport: { width: 1400, height: 900 } });
desktop.on('pageerror', (e) => errors.push(`desktop pageerror: ${e.message}`));

await desktop.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await desktop.waitForTimeout(2200);
await desktop.screenshot({ path: `${shots}/t-landing.png` });

// MSV filter on the map
await desktop.goto(`${BASE}/map/?year=695&sect=Mulasarvastivada`, { waitUntil: 'networkidle' });
await desktop.waitForTimeout(4500);
await desktop.screenshot({ path: `${shots}/t-map-msv.png` });

// journey arrows: click next 3 times, then ArrowRight
await desktop.goto(`${BASE}/journeys/faxian/`, { waitUntil: 'networkidle' });
await desktop.waitForTimeout(3500);
const next = desktop.getByRole('button', { name: 'Next place' });
console.log('stop-nav present:', (await next.count()) > 0);
await next.click();
await desktop.waitForTimeout(900);
await next.click();
await desktop.waitForTimeout(900);
await desktop.keyboard.press('ArrowRight');
await desktop.waitForTimeout(1800);
await desktop.screenshot({ path: `${shots}/t-journey-arrows.png` });
console.log('counter:', await desktop.locator('.stop-nav .counter').textContent());

// --- mobile pass (iPhone-ish)
const mobile = await browser.newPage({
	viewport: { width: 390, height: 844 },
	isMobile: true,
	hasTouch: true
});
mobile.on('pageerror', (e) => errors.push(`mobile pageerror: ${e.message}`));

await mobile.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await mobile.waitForTimeout(1500);
await mobile.screenshot({ path: `${shots}/t-mobile-landing.png` });

// burger menu
await mobile.getByRole('button', { name: 'Open menu' }).click();
await mobile.waitForTimeout(400);
await mobile.screenshot({ path: `${shots}/t-mobile-menu.png` });

// mobile scrolly
await mobile.goto(`${BASE}/journeys/xuanzang/`, { waitUntil: 'networkidle' });
await mobile.waitForTimeout(3500);
await mobile.screenshot({ path: `${shots}/t-mobile-scrolly-top.png` });
await mobile.mouse.wheel(0, 5200);
await mobile.waitForTimeout(2500);
await mobile.screenshot({ path: `${shots}/t-mobile-scrolly-mid.png` });

const ignorable = /terrain|elevation-tiles|favicon|s3\.amazonaws/i;
const real = errors.filter((e) => !ignorable.test(e));
console.log(real.length ? `ERRORS:\n${real.join('\n')}` : 'no page errors');
await browser.close();
process.exit(real.length ? 1 : 0);
