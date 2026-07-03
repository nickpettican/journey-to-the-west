import * as THREE from 'three';

export interface FieldBlock {
	x: number;
	z: number;
	w: number;
	d: number;
	rot?: number;
	/** open farmland (few bund trees) — for fields between monuments */
	sparse?: boolean;
}

export interface ForestPatch {
	x: number;
	z: number;
	r: number;
	n: number;
}

export type TreeSpot = [number, number, number, number]; // x, z, height, yaw

/**
 * The rice country both sites sit in, drawn as the paddy patchwork the monks'
 * robes copy: each block is an irregular grid of paddies (one instanced plane
 * in a few pastel shades) separated by grass bunds — the ground colour shows
 * through as the bund. Tree spots are strung along the bunds, never on the
 * cultivated squares; forest patches have no paddies and are thick with trees.
 * Returns the spots for scatterSpecies (bund and forest kept apart so wide
 * cluster models can be kept off the bunds) plus an onFields() test so random
 * scatter elsewhere stays off the paddies.
 */
export function buildRiceLand(
	scene: THREE.Scene,
	opts: {
		blocks: FieldBlock[];
		forests: ForestPatch[];
		shades: number[];
		treeHeight: number;
		seed?: number;
	}
) {
	let seed = opts.seed ?? 7;
	const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
	const paddies: { x: number; z: number; w: number; d: number; rot: number; c: number }[] = [];
	const bundSpots: TreeSpot[] = [];
	const forestSpots: TreeSpot[] = [];
	const spot = (arr: TreeSpot[], x: number, z: number) =>
		arr.push([x, z, opts.treeHeight * (0.75 + rnd() * 0.55), rnd() * Math.PI * 2]);

	for (const b of opts.blocks) {
		const rot = b.rot ?? 0;
		const cos = Math.cos(rot);
		const sin = Math.sin(rot);
		const world = (lx: number, lz: number): [number, number] => [
			b.x + lx * cos - lz * sin,
			b.z + lx * sin + lz * cos
		];
		// irregular grid cuts across each axis
		const cuts = (len: number) => {
			const cs = [-len / 2];
			let p = -len / 2;
			for (;;) {
				p += 17 + rnd() * 21;
				if (p > len / 2 - 14) break;
				cs.push(p);
			}
			cs.push(len / 2);
			return cs;
		};
		const cx = cuts(b.w);
		const cz = cuts(b.d);
		const gap = 3; // the bund
		for (let i = 0; i < cx.length - 1; i++)
			for (let j = 0; j < cz.length - 1; j++) {
				const [px, pz] = world((cx[i] + cx[i + 1]) / 2, (cz[j] + cz[j + 1]) / 2);
				paddies.push({
					x: px,
					z: pz,
					w: cx[i + 1] - cx[i] - gap,
					d: cz[j + 1] - cz[j] - gap,
					rot,
					c: opts.shades[Math.floor(rnd() * opts.shades.length)]
				});
			}
		// trees strung along the bund lines (perimeter included)
		// ponytail: densities halved from 0.08/0.3 & 0.05/0.2 for mobile GPU load
		const pAlong = b.sparse ? 0.04 : 0.15;
		const pAcross = b.sparse ? 0.025 : 0.1;
		for (const lx of cx)
			for (let lz = -b.d / 2; lz < b.d / 2; lz += 14 + rnd() * 12)
				if (rnd() < pAlong) spot(bundSpots, ...world(lx, lz));
		for (const lz of cz)
			for (let lx = -b.w / 2; lx < b.w / 2; lx += 14 + rnd() * 12)
				if (rnd() < pAcross) spot(bundSpots, ...world(lx, lz));
	}

	for (const f of opts.forests)
		for (let i = 0; i < f.n / 2; i++) {
			// ponytail: forest density halved for mobile GPU load (n stays truthful)
			const a = rnd() * Math.PI * 2;
			const r = f.r * Math.sqrt(rnd());
			spot(forestSpots, f.x + Math.cos(a) * r, f.z + Math.sin(a) * r);
		}

	const im = new THREE.InstancedMesh(
		new THREE.PlaneGeometry(1, 1),
		new THREE.MeshLambertMaterial(),
		paddies.length
	);
	const up = new THREE.Vector3(0, 1, 0);
	const flat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
	const q = new THREE.Quaternion();
	const m = new THREE.Matrix4();
	const col = new THREE.Color();
	paddies.forEach((p, i) => {
		q.setFromAxisAngle(up, p.rot).multiply(flat);
		m.compose(new THREE.Vector3(p.x, 0.07, p.z), q, new THREE.Vector3(p.w, p.d, 1));
		im.setMatrixAt(i, m);
		im.setColorAt(i, col.setHex(p.c));
	});
	im.receiveShadow = true;
	scene.add(im);

	const onFields = (x: number, z: number) =>
		opts.blocks.some((b) => {
			const rot = b.rot ?? 0;
			const dx = x - b.x;
			const dz = z - b.z;
			const lx = dx * Math.cos(rot) + dz * Math.sin(rot);
			const lz = -dx * Math.sin(rot) + dz * Math.cos(rot);
			return Math.abs(lx) < b.w / 2 + 6 && Math.abs(lz) < b.d / 2 + 6;
		});

	return { bundSpots, forestSpots, onFields };
}
