import { chromium } from 'playwright';

const BASE = 'http://localhost:8741/journey-to-the-west';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// 1. Udyana — compare view should show derived chip in Xuanzang's column only
await page.goto(`${BASE}/places/udyana/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
console.log('udyana compare chips:', JSON.stringify(await page.locator('.chip').allTextContents()));
await page.screenshot({ path: 'verify-shots/vajra-udyana-compare.png', fullPage: true });

// Xuanzang tab → VisitDetail with derived chip + tooltip
await page.locator('.tabs button', { hasText: 'Xuanzang' }).click();
await page.waitForTimeout(400);
const xuChips = await page.locator('.chip').allTextContents();
const derivedTitle = await page.locator('.chip', { hasText: '(derived)' }).getAttribute('title');
console.log('udyana xuanzang-tab chips:', JSON.stringify(xuChips));
console.log('derived chip tooltip:', derivedTitle);
await page.screenshot({ path: 'verify-shots/vajra-udyana-xuanzang.png', fullPage: true });

// 2. Nalanda — Yijing tab → altar supplementary quote present
await page.goto(`${BASE}/places/nalanda/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
console.log('nalanda compare chips:', JSON.stringify(await page.locator('.chip').allTextContents()));
await page.locator('.tabs button', { hasText: 'Yijing' }).click();
await page.waitForTimeout(400);
console.log('nalanda yijing-tab chips:', JSON.stringify(await page.locator('.chip').allTextContents()));
const supp = await page.locator('blockquote.supp').allTextContents();
console.log('supp quotes:', supp.length, '| altar quote present:', supp.some(q => q.includes('regularly went to the altar')));
await page.screenshot({ path: 'verify-shots/vajra-nalanda-yijing.png', fullPage: true });

// 3. Faxian udyana tab must NOT have a derived chip
await page.goto(`${BASE}/places/udyana/`, { waitUntil: 'networkidle' });
await page.locator('.tabs button', { hasText: 'Faxian' }).click();
await page.waitForTimeout(400);
const fxChips = await page.locator('.chip').allTextContents();
console.log('udyana faxian-tab chips:', JSON.stringify(fxChips), '| derived present:', fxChips.some(c => c.includes('derived')));

await browser.close();
console.log('DONE');
