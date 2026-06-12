/**
 * One-time basemap build: downloads Natural Earth physical data, simplifies it
 * with mapshaper and writes GeoJSON to static/basemap/ (COMMITTED — CI never
 * touches Natural Earth servers).
 *
 * Run manually with: npm run build:basemap
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const TMP = join(root, '.ne-cache');
const OUT = join(root, 'static', 'basemap');
mkdirSync(TMP, { recursive: true });
mkdirSync(OUT, { recursive: true });

const CDN = 'https://naciscdn.org/naturalearth';
const datasets = [
	{ name: 'ne_10m_land', path: '10m/physical/ne_10m_land.zip', out: 'land.json', simplify: '8%' },
	{
		name: 'ne_10m_lakes',
		path: '10m/physical/ne_10m_lakes.zip',
		out: 'lakes.json',
		simplify: '15%',
		filter: 'scalerank <= 3'
	},
	{
		name: 'ne_10m_rivers_lake_centerlines',
		path: '10m/physical/ne_10m_rivers_lake_centerlines.zip',
		out: 'rivers.json',
		simplify: '15%',
		filter: 'scalerank <= 6'
	}
];

for (const ds of datasets) {
	const zip = join(TMP, ds.path.split('/').pop());
	if (!existsSync(zip)) {
		console.log(`downloading ${ds.path}…`);
		execFileSync('curl', ['-fsSL', '-o', zip, `${CDN}/${ds.path}`], { stdio: 'inherit' });
	}
	// The zips can contain more than one layer — unzip and target the main .shp.
	execFileSync('unzip', ['-o', '-q', zip, '-d', TMP]);
	const shp = join(TMP, `${ds.name}.shp`);
	const args = [shp, '-simplify', 'visvalingam', ds.simplify, 'keep-shapes'];
	if (ds.filter) args.push('-filter', ds.filter);
	args.push(
		'-filter-fields',
		'',
		'-clean',
		'-o',
		'precision=0.001',
		'format=geojson',
		join(OUT, ds.out)
	);
	execFileSync(join(root, 'node_modules', '.bin', 'mapshaper'), args, { stdio: 'inherit' });
	console.log(`${ds.out}: ${(statSync(join(OUT, ds.out)).size / 1024).toFixed(0)} KB`);
}
