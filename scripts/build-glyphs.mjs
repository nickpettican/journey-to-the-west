/**
 * One-time glyph fetch: downloads the SDF glyph PBF ranges MapLibre needs for
 * map labels into static/glyphs/ (COMMITTED — fully self-hosted, no runtime
 * dependency on external font servers).
 *
 * Ranges cover Basic Latin, Latin-1, Latin Extended-A/B and Latin Extended
 * Additional — i.e. the IAST diacritics (Ś ā ī ṃ ḍ ṣ …) used in place names.
 *
 * Run manually with: npm run build:glyphs
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'static', 'glyphs');

const BASE = 'https://openmaptiles.github.io/fonts';
const stacks = ['Noto Sans Regular', 'Noto Sans Italic'];
const ranges = ['0-255', '256-511', '512-767', '7680-7935'];

for (const stack of stacks) {
	const dir = join(OUT, stack);
	mkdirSync(dir, { recursive: true });
	for (const range of ranges) {
		const url = `${BASE}/${encodeURIComponent(stack)}/${range}.pbf`;
		console.log(`fetching ${stack}/${range}.pbf`);
		execFileSync('curl', ['-fsSL', '-o', join(dir, `${range}.pbf`), url], { stdio: 'inherit' });
	}
}
console.log('glyphs done.');
