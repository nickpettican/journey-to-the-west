/**
 * Procedural, stylised 3D reconstruction of Nālandā Mahāvihāra for the scroll
 * tour. The layout follows the excavated plan PLUS the satellite/field surveys
 * of the full extent (Rajani 2014, "A satellite's view of Nalanda's past";
 * Das/Rajani 2016/19 — see raw/extra/nalanda-to-scale.svg):
 *
 *   SOLID — excavated and standing: Temple 3 with Monasteries 18 and 1A at its
 *   side; Monasteries 1, 4, 6–11 in a line, entrances west; Temple 2 and the
 *   Sarai temple east of the row; Temples 12 (domed), 13 and 14 on the west
 *   axis; the Brass Temple, willow tree, well, copper colossus and Tārā temple.
 *
 *   TRANSLUCENT — buried structures read from crop-marks, mounds and the DEM,
 *   not yet excavated: the southern monastery extension (F5) with one more
 *   temple (F4) and the circular field-mounds (F7, F8); two northern temples
 *   on the axis (F1, F2 — F2 drawn as Bālāditya's unlocated great temple) with
 *   the Baragaon brick-mound stupa (F3) and a conjectured northern monastery
 *   row; and, at the far north, the great four-pointed Begumpur quadrangle
 *   (F9), drawn in the manner of Somāpura: a square of monks' quarters around
 *   a cruciform temple. The ring of tanks — believed dug for brick-earth —
 *   surrounds it all.
 *
 *   GHOST OUTLINE — the nine-storeyed library of later Tibetan tradition,
 *   placed (location unrecorded) in the northern mound cluster.
 *
 * Dimensions follow the pilgrims where they speak: three-storeyed courts with
 * nine cells to a row (Yijing), an 80-ft copper Buddha (Xuanzang).
 * Scene units are metres-ish. +x = east, −z = north (the main gate is south).
 */
import * as THREE from 'three';

/* --------------------------------------------------------------- palette --- */
const C = {
	fog: 0xdfe2d0, // horizon haze between the cream sky and green land
	ground: 0xb6c39c, // pastel green
	fieldA: 0xaebd92,
	fieldB: 0xc2cda6,
	road: 0xe6d8b0,
	brick: 0xa05236,
	brickDark: 0x8a4027,
	sandstone: 0xd9b98a,
	plaster: 0xe8d9b4,
	door: 0x3c2a1e,
	water: 0xa9c4bd,
	leaf: 0x7e9a62,
	trunk: 0x6e573b,
	bronze: 0x9c7a40,
	saffron: 0xe08214,
	gold: 0xc2a14d
};

const mat = (color: number, opts: THREE.MeshLambertMaterialParameters = {}) =>
	new THREE.MeshLambertMaterial({ color, ...opts });

const N_STATIONS = 15;

/* ---------------------------------------------------------- glowing path --- */
/** Ground route, in story order: in from the villages by the south gate, past
 *  the well, around the buried southern temple and Temple 3 into Monastery 1's
 *  court, then north the length of the site to the threshold of the Begumpur
 *  quadrangle. Indices are referenced by camera keys so the glow stays in
 *  step with the narration instead of racing ahead. */
const PATH_POINTS: [number, number][] = [
	[20, 650], // 0 far south, among the villages
	[20, 480], // 1
	[20, 421], // 2 through the south gate
	[32, 400], // 3 the well
	[4, 382], // 4
	[-18, 366], // 5 the buried temple's east side
	[-50, 388], // 6 rounding it to the south…
	[-82, 350], // 7 …and the west
	[-50, 314], // 8 round to its north face
	[-72, 264], // 9 up the axis toward Temple 3
	[-74, 228], // 10 Temple 3's west side
	[-47, 178], // 11 rounding its north face
	[-12, 170], // 12 toward Monastery 1
	[30, 160], // 13 in by the west entrance
	[58, 160], // 14 the court of Monastery 1
	[72, 150], // 15 a turn around the court
	[58, 138], // 16
	[42, 150], // 17
	[30, 160], // 18 out again
	[20, 144], // 19 the road begins here
	[20, 116], // 20
	[-4, 98], // 21 the willow tree
	[-18, 70], // 22 the relic stupa
	[-20, 44], // 23 Temple 12
	[-2, 16], // 24
	[20, -8], // 25 the road
	[20, -60], // 26
	[-24, -130], // 27 Temple 13
	[-18, -168], // 28
	[40, -150], // 29
	[100, -110], // 30 Temple 2
	[180, -86], // 31
	[252, -84], // 32 the Sarai temple
	[296, -160], // 33
	[322, -280], // 34 out by the east gate
	[414, -248], // 35 the copper colossus
	[432, -304], // 36
	[434, -364], // 37 the Tārā temple
	[416, -396], // 38
	[352, -368], // 39 the bank of Pansokar Pokhar
	[330, -322], // 40
	[322, -282], // 41 in again by the east gate
	[200, -250], // 42
	[80, -232], // 43
	[20, -250], // 44 the road, northward
	[-24, -292], // 45 Temple 14
	[-20, -330], // 46
	[0, -356], // 47
	[-20, -390], // 48 the first buried temple (F1)
	[0, -432], // 49
	[20, -472], // 50
	[-10, -520], // 51
	[-16, -548], // 52 the great buried temple (F2) — Bālāditya's?
	[-30, -610], // 53
	[-34, -655], // 54 the Baragaon stupa mound (F3)
	[0, -700], // 55
	[20, -742], // 56 the road through the fields
	[-16, -800], // 57
	[-28, -876], // 58 the three library halls
	[0, -940], // 59
	[20, -1000], // 60
	[20, -1058] // 61 the road's end, at the quadrangle's threshold
];

/* ------------------------------------------------------- camera keyframes --- */
/** Keys are anchored to STATION numbers (0–14), not raw scroll fractions:
 *  the component measures where each story card actually sits in the scroll
 *  and calls calibrate(), so camera, glow path and cards stay in lockstep.
 *  Fractional `s` values are fill keys that steer between stations. */
interface CamKey {
	s: number;
	pos: [number, number, number];
	look: [number, number, number];
	/** index into PATH_POINTS the glowing path has reached at this moment */
	idx: number;
}

const CAM_KEYS: CamKey[] = [
	{ s: -0.5, pos: [-200, 280, 1040], look: [20, 25, -120], idx: 0 },
	{ s: 0, pos: [-150, 210, 900], look: [20, 25, -120], idx: 1 }, // 1 approach
	{ s: 1, pos: [20, 9, 484], look: [20, 10, 420], idx: 2 }, // 2 the gate
	{ s: 2, pos: [60, 12, 413], look: [34, 3, 396], idx: 3 }, // 3 the well
	{ s: 3, pos: [115, 70, 225], look: [-40, 5, 425], idx: 8 }, // 4 the buried south
	{ s: 4, pos: [140, 75, 330], look: [-30, 8, 80], idx: 11 }, // 5 six kings
	{ s: 4.5, pos: [80, 18, 210], look: [40, 6, 165], idx: 13 },
	{ s: 5, pos: [58, 12, 176], look: [58, 4, 140], idx: 14 }, // 6 inside a court
	{ s: 6, pos: [58, 36, 172], look: [58, 4, 156], idx: 18 }, // 7 daily life
	{ s: 6.5, pos: [14, 18, 122], look: [-24, 8, 92], idx: 21 },
	{ s: 7, pos: [4, 20, -4], look: [-47, 14, 100], idx: 23 }, // 8 traces: T12 + brass, facing SW
	{ s: 7.5, pos: [150, 55, -60], look: [322, 16, -280], idx: 32 },
	{ s: 8, pos: [381, 112, -176], look: [422, 8, -268], idx: 35 }, // 9 colossus, looking down into its court (Tārā beyond)
	{ s: 8.5, pos: [240, 70, -330], look: [40, 10, -260], idx: 41 },
	{ s: 9, pos: [190, 150, -30], look: [10, 10, -210], idx: 43 }, // 10 scholars
	{ s: 9.5, pos: [-150, 60, -230], look: [-47, 28, -330], idx: 47 },
	{ s: 10, pos: [-175, 95, -400], look: [-47, 52, -545], idx: 52 }, // 11 Bālāditya (F2)
	{ s: 11, pos: [20, 620, -200], look: [20, 0, -900], idx: 56 }, // 12 the tanks, flanking the site from on high
	{ s: 12, pos: [64, 42, -756], look: [-46, 28, -878], idx: 58 }, // 13 the library halls
	{ s: 13, pos: [185, 105, -985], look: [0, 24, -1180], idx: 61 }, // 14 Begumpur
	{ s: 14, pos: [-660, 440, 660], look: [60, 0, -460], idx: 61 }, // 15 legacy
	{ s: 14.5, pos: [-740, 490, 740], look: [60, 20, -460], idx: 61 }
];

const smooth = (t: number) => t * t * (3 - 2 * t);

/* ----------------------------------------------------------- scene build --- */

function addBox(
	parent: THREE.Object3D,
	w: number,
	h: number,
	d: number,
	x: number,
	y: number,
	z: number,
	material: THREE.Material
) {
	const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
	m.position.set(x, y, z);
	m.castShadow = true;
	m.receiveShadow = true;
	parent.add(m);
	return m;
}

/** Turn an already-built group translucent and sand-pale: an archaeological
 *  guess, not a measured ruin. The colour is washed toward the schematic's
 *  "buried structure" tone so the inference is unmistakable even where the
 *  building overlaps itself. Depth-write stays on for self-occlusion. */
function ghostify(g: THREE.Group, opacity = 0.38): THREE.Group {
	const buried = new THREE.Color(0xdcc391);
	g.traverse((o) => {
		const m = o as THREE.Mesh;
		if (!m.isMesh && !(o as THREE.LineSegments).isLineSegments) return;
		m.castShadow = false;
		m.receiveShadow = false;
		if (m.material) {
			const cloned = (m.material as THREE.Material).clone() as THREE.MeshLambertMaterial;
			cloned.transparent = true;
			cloned.opacity = opacity;
			if (cloned.color) cloned.color.lerp(buried, 0.55);
			if (cloned.emissive) cloned.emissive.setHex(0x000000);
			m.material = cloned;
		}
	});
	return g;
}

type Facing = 'west' | 'north';

/** A monastery court: three-storeyed brick ranges around an open courtyard. */
function buildCourt(
	cx: number,
	cz: number,
	S: number,
	facing: Facing,
	brick: THREE.Material,
	trim: THREE.Material
): THREE.Group {
	const g = new THREE.Group();
	const H = 12; // three storeys (Yijing)
	const T = 7;
	const entranceSide = facing; // gap in this range
	// the four ranges
	const ranges: { w: number; d: number; x: number; z: number; side: string }[] = [
		{ w: S, d: T, x: cx, z: cz - S / 2 + T / 2, side: 'north' },
		{ w: S, d: T, x: cx, z: cz + S / 2 - T / 2, side: 'south' },
		{ w: T, d: S - 2 * T, x: cx + S / 2 - T / 2, z: cz, side: 'east' },
		{ w: T, d: S - 2 * T, x: cx - S / 2 + T / 2, z: cz, side: 'west' }
	];
	for (const r of ranges) {
		if (r.side === entranceSide) {
			// split this range for the entrance
			if (r.side === 'west') {
				const seg = (S - 2 * T - 6) / 2;
				addBox(g, T, H, seg, r.x, H / 2, cz - 3 - seg / 2, brick);
				addBox(g, T, H, seg, r.x, H / 2, cz + 3 + seg / 2, brick);
				addBox(g, T + 2, 1.4, 8, r.x, H * 0.62, cz, trim);
			} else {
				// north entrance (Monasteries 18 and 1A)
				const seg = (S - 6) / 2;
				addBox(g, seg, H, T, cx - 3 - seg / 2, H / 2, r.z, brick);
				addBox(g, seg, H, T, cx + 3 + seg / 2, H / 2, r.z, brick);
				addBox(g, 8, 1.4, T + 2, cx, H * 0.62, r.z, trim);
			}
		} else {
			addBox(g, r.w, H, r.d, r.x, H / 2, r.z, brick);
		}
	}
	// storey string-courses so the three floors read from outside
	for (const y of [4, 8]) {
		addBox(g, S + 0.6, 0.5, 0.7, cx, y, cz - S / 2, trim).castShadow = false;
		addBox(g, S + 0.6, 0.5, 0.7, cx, y, cz + S / 2, trim).castShadow = false;
		addBox(g, 0.7, 0.5, S + 0.6, cx - S / 2, y, cz, trim).castShadow = false;
		addBox(g, 0.7, 0.5, S + 0.6, cx + S / 2, y, cz, trim).castShadow = false;
	}
	// parapet rims, courtyard open to the sky
	addBox(g, S + 1, 0.9, 1.4, cx, H + 0.45, cz - S / 2 + 0.5, trim).castShadow = false;
	addBox(g, S + 1, 0.9, 1.4, cx, H + 0.45, cz + S / 2 - 0.5, trim).castShadow = false;
	addBox(g, 1.4, 0.9, S + 1, cx - S / 2 + 0.5, H + 0.45, cz, trim).castShadow = false;
	addBox(g, 1.4, 0.9, S + 1, cx + S / 2 - 0.5, H + 0.45, cz, trim).castShadow = false;
	const ih = S / 2 - T;
	addBox(g, 2 * ih, 0.7, 0.9, cx, H + 0.35, cz - ih, trim).castShadow = false;
	addBox(g, 2 * ih, 0.7, 0.9, cx, H + 0.35, cz + ih, trim).castShadow = false;
	addBox(g, 0.9, 0.7, 2 * ih, cx - ih, H + 0.35, cz, trim).castShadow = false;
	addBox(g, 0.9, 0.7, 2 * ih, cx + ih, H + 0.35, cz, trim).castShadow = false;
	// inner string-courses, matching the outer ones
	for (const y of [4, 8]) {
		addBox(g, 2 * ih + 0.6, 0.5, 0.7, cx, y, cz - ih, trim).castShadow = false;
		addBox(g, 2 * ih + 0.6, 0.5, 0.7, cx, y, cz + ih, trim).castShadow = false;
		addBox(g, 0.7, 0.5, 2 * ih + 0.6, cx - ih, y, cz, trim).castShadow = false;
		addBox(g, 0.7, 0.5, 2 * ih + 0.6, cx + ih, y, cz, trim).castShadow = false;
	}
	// courtyard floor
	addBox(g, 2 * ih, 0.5, 2 * ih, cx, 0.25, cz, mat(C.plaster)).castShadow = false;
	return g;
}

/** Stepped pyramid temple in the Mahābodhi manner (Temples 13 and 14). */
function buildTemple(
	x: number,
	z: number,
	height: number,
	corners: boolean,
	brick: THREE.Material,
	stone: THREE.Material
): THREE.Group {
	const g = new THREE.Group();
	const base = height * 0.36;
	const baseW = height * 0.6;
	// each course is brick with a thin stone cap of the same footprint
	const course = (w: number, h: number, y0: number) => {
		addBox(g, w, h - 0.6, w, x, y0 + (h - 0.6) / 2, z, brick);
		addBox(g, w, 0.6, w, x, y0 + h - 0.3, z, stone).castShadow = false;
	};
	let y = 0;
	for (let i = 0; i < 3; i++) {
		const w = baseW * (1 - i * 0.18);
		const h = base / 3;
		course(w, h, y);
		y += h;
	}
	const towerH = height - base;
	const steps = 7;
	for (let s = 0; s < steps; s++) {
		const f = 1 - s / steps;
		const w = baseW * 0.52 * (0.3 + 0.7 * f);
		course(w, towerH / steps, y + (s * towerH) / steps);
	}
	// pointed gilt spire, as on the domed temple
	const fin = new THREE.Mesh(
		new THREE.ConeGeometry(height * 0.03, height * 0.12, 8),
		mat(C.gold, { emissive: C.gold, emissiveIntensity: 0.25 })
	);
	fin.position.set(x, height + height * 0.05, z);
	fin.castShadow = true;
	g.add(fin);
	if (corners) {
		const off = baseW * 0.5;
		for (const [dx, dz] of [
			[-off, -off],
			[off, -off],
			[-off, off],
			[off, off]
		]) {
			g.add(buildTemple(x + dx, z + dz, height * 0.3, false, brick, stone));
		}
	}
	return g;
}

/** Domed temple after Percy Brown's restoration (Temple 12): tiered platform,
 *  great central dome, four domed corner turrets. */
function buildDomedTemple(
	x: number,
	z: number,
	brick: THREE.Material,
	stone: THREE.Material
): THREE.Group {
	const g = new THREE.Group();
	const tiers: [number, number][] = [
		[44, 5],
		[36, 4.5],
		[28, 4.5]
	];
	let y = 0;
	for (const [w, h] of tiers) {
		addBox(g, w, h, w, x, y + h / 2, z, brick);
		addBox(g, w + 0.8, 0.7, w + 0.8, x, y + h, z, stone).castShadow = false;
		y += h;
	}
	// central drum + dome
	const drum = new THREE.Mesh(new THREE.CylinderGeometry(10.5, 11.5, 4, 20), stone);
	drum.position.set(x, y + 2, z);
	drum.castShadow = drum.receiveShadow = true;
	g.add(drum);
	const dome = new THREE.Mesh(
		new THREE.SphereGeometry(10.5, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
		mat(C.plaster)
	);
	dome.position.set(x, y + 4, z);
	dome.castShadow = true;
	g.add(dome);
	const fin = new THREE.Mesh(
		new THREE.ConeGeometry(1.1, 4.5, 8),
		mat(C.gold, { emissive: C.gold, emissiveIntensity: 0.25 })
	);
	fin.position.set(x, y + 16.4, z);
	g.add(fin);
	// four domed corner turrets, rising from the ground at the platform corners
	const off = tiers[0][0] / 2 - 3;
	for (const [dx, dz] of [
		[-off, -off],
		[off, -off],
		[-off, off],
		[off, off]
	]) {
		addBox(g, 7, y + 3, 7, x + dx, (y + 3) / 2, z + dz, brick);
		addBox(g, 7.6, 0.7, 7.6, x + dx, y + 3, z + dz, stone).castShadow = false;
		const td = new THREE.Mesh(
			new THREE.SphereGeometry(3.4, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
			mat(C.plaster)
		);
		td.position.set(x + dx, y + 3.3, z + dz);
		td.castShadow = true;
		g.add(td);
	}
	return g;
}

/** Dome stupa: drum, dome, harmikā and spire. */
function buildStupa(x: number, z: number, height: number, brick: THREE.Material): THREE.Group {
	const g = new THREE.Group();
	const r = height * 0.42;
	const drumH = height * 0.3;
	const drum = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.15, drumH, 18), brick);
	drum.position.set(x, drumH / 2, z);
	drum.castShadow = drum.receiveShadow = true;
	g.add(drum);
	const dome = new THREE.Mesh(
		new THREE.SphereGeometry(r, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2),
		mat(C.plaster)
	);
	dome.position.set(x, drumH, z);
	dome.castShadow = true;
	g.add(dome);
	addBox(g, r * 0.5, r * 0.22, r * 0.5, x, drumH + r + r * 0.1, z, mat(C.sandstone));
	const spire = new THREE.Mesh(
		new THREE.ConeGeometry(r * 0.16, height * 0.32, 8),
		mat(C.gold, { emissive: C.gold, emissiveIntensity: 0.2 })
	);
	spire.position.set(x, drumH + r + height * 0.26, z);
	g.add(spire);
	return g;
}

/** A simple square shrine with a pyramidal stone finial and a golden image
 *  within (Temple 2 and its twin, the Sarai temple). */
function buildShrine(x: number, z: number, brick: THREE.Material, stone: THREE.Material) {
	const g = new THREE.Group();
	addBox(g, 18, 2.6, 18, x, 1.3, z, brick);
	addBox(g, 11, 8, 2, x, 6.6, z + 5, brick); // front wall w/ opening implied
	addBox(g, 2, 8, 11, x - 4.5, 6.6, z, brick);
	addBox(g, 2, 8, 11, x + 4.5, 6.6, z, brick);
	addBox(g, 11, 8, 2, x, 6.6, z - 5, brick);
	addBox(g, 12.4, 1.2, 12.4, x, 11.2, z, stone);
	const fin = new THREE.Mesh(new THREE.ConeGeometry(2.4, 5, 4), stone);
	fin.rotation.y = Math.PI / 4;
	fin.position.set(x, 14.2, z);
	fin.castShadow = true;
	g.add(fin);
	const gold = mat(C.gold, { emissive: C.gold, emissiveIntensity: 0.35 });
	const seat = new THREE.Mesh(new THREE.CapsuleGeometry(1.5, 1.6, 4, 10), gold);
	seat.position.set(x, 4.4, z);
	g.add(seat);
	const head = new THREE.Mesh(new THREE.SphereGeometry(0.9, 10, 8), gold);
	head.position.set(x, 6.8, z);
	g.add(head);
	return g;
}

/** The Begumpur quadrangle (F9), drawn in the manner of Somāpura: a vast,
 *  closed square of three-storeyed monks' quarters — windowed inside and out
 *  — around a central cruciform temple with four cardinal wings. */
function buildQuadrangle(
	cx: number,
	cz: number,
	side: number,
	brick: THREE.Material,
	stone: THREE.Material
): THREE.Group {
	const g = new THREE.Group();
	const T = 18; // the perimeter ranges ARE the monks' quarters
	const H = 13.5; // three storeys
	const half = side / 2;
	// four closed ranges — the pavilion has no opening
	addBox(g, side, H, T, cx, H / 2, cz - half + T / 2, brick);
	addBox(g, side, H, T, cx, H / 2, cz + half - T / 2, brick);
	addBox(g, T, H, side - 2 * T, cx - half + T / 2, H / 2, cz, brick);
	addBox(g, T, H, side - 2 * T, cx + half - T / 2, H / 2, cz, brick);
	// string-courses and parapets so the three storeys read
	for (const y of [4.5, 9, H + 0.3]) {
		const t = y > H ? 1 : 0.5;
		addBox(g, side + 0.6, t, 0.8, cx, y, cz - half, stone).castShadow = false;
		addBox(g, side + 0.6, t, 0.8, cx, y, cz + half, stone).castShadow = false;
		addBox(g, 0.8, t, side + 0.6, cx - half, y, cz, stone).castShadow = false;
		addBox(g, 0.8, t, side + 0.6, cx + half, y, cz, stone).castShadow = false;
		// inner courtyard faces
		const ih = half - T;
		addBox(g, 2 * ih + 0.6, t, 0.8, cx, y, cz - ih, stone).castShadow = false;
		addBox(g, 2 * ih + 0.6, t, 0.8, cx, y, cz + ih, stone).castShadow = false;
		addBox(g, 0.8, t, 2 * ih + 0.6, cx - ih, y, cz, stone).castShadow = false;
		addBox(g, 0.8, t, 2 * ih + 0.6, cx + ih, y, cz, stone).castShadow = false;
	}
	// windows on all three storeys, outer and inner faces (one instanced mesh)
	const qWins = new THREE.InstancedMesh(
		new THREE.BoxGeometry(1.4, 2, 0.5),
		mat(C.door),
		540
	);
	const d = new THREE.Object3D();
	let qi = 0;
	const n = 22;
	const inner = half - T;
	for (const y of [2.2, 6.7, 11.2]) {
		for (let k = 0; k < n; k++) {
			const tOut = ((k + 0.5) / n - 0.5) * 2 * (half - 6);
			const tIn = ((k + 0.5) / n - 0.5) * 2 * (inner - 4);
			d.rotation.set(0, 0, 0);
			for (const [t, zf] of [
				[tOut, cz - half - 0.05],
				[tIn, cz - half + T + 0.05],
				[tIn, cz + half - T - 0.05],
				[tOut, cz + half + 0.05]
			]) {
				d.position.set(cx + t, y, zf);
				d.updateMatrix();
				qWins.setMatrixAt(qi++, d.matrix);
			}
			d.rotation.set(0, Math.PI / 2, 0);
			for (const [t, xf] of [
				[tOut, cx - half - 0.05],
				[tIn, cx - half + T + 0.05],
				[tIn, cx + half - T - 0.05],
				[tOut, cx + half + 0.05]
			]) {
				d.position.set(xf, y, cz + t);
				d.updateMatrix();
				qWins.setMatrixAt(qi++, d.matrix);
			}
		}
	}
	qWins.count = qi;
	g.add(qWins);
	// the central cruciform temple, its cardinal wings two-thirds its height
	g.add(buildTemple(cx, cz, 48, false, brick, stone));
	const wing = 48 * 0.65;
	const off = 48 * 0.3 + wing * 0.3 - 2.5;
	for (const [dx, dz] of [
		[-off, 0],
		[off, 0],
		[0, -off],
		[0, off]
	]) {
		g.add(buildTemple(cx + dx, cz + dz, wing, false, brick, stone));
	}
	return g;
}

export interface NalandaTour {
	setProgress(p: number): void;
	setStation(i: number): void;
	/** Measured scroll fractions of the story cards' centres (0–1). */
	calibrate(stationPs: number[]): void;
	resize(): void;
	dispose(): void;
}

export function createNalandaTour(canvas: HTMLCanvasElement): NalandaTour {
	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	// the scene is static — render the shadow map once, not every frame
	renderer.shadowMap.autoUpdate = false;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;

	const scene = new THREE.Scene();
	// sky is a CSS gradient behind the transparent canvas; fog meets it at the horizon
	scene.fog = new THREE.Fog(C.fog, 420, 2600);

	const camera = new THREE.PerspectiveCamera(46, 1, 0.5, 4200);

	/* lights */
	scene.add(new THREE.HemisphereLight(0xdce9ef, 0xb3bf99, 0.95));
	const sun = new THREE.DirectionalLight(0xffe8c0, 1.5);
	sun.position.set(-380, 460, 260);
	sun.castShadow = true;
	sun.shadow.mapSize.set(4096, 4096);
	const sc = sun.shadow.camera;
	sc.left = -1000;
	sc.right = 1000;
	sc.top = 1200;
	sc.bottom = -1200;
	sc.far = 2600;
	scene.add(sun);

	const brick = mat(C.brick);
	const brickDark = mat(C.brickDark);
	const stone = mat(C.sandstone);

	/* ground + fields + road */
	const ground = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5600), mat(C.ground));
	ground.rotation.x = -Math.PI / 2;
	ground.position.z = -400;
	ground.receiveShadow = true;
	scene.add(ground);
	const fieldGeo = new THREE.PlaneGeometry(90, 60);
	for (let i = 0; i < 26; i++) {
		const f = new THREE.Mesh(fieldGeo, mat(i % 2 ? C.fieldA : C.fieldB));
		f.rotation.x = -Math.PI / 2;
		f.position.set(
			-650 + (i % 7) * 210 + ((i * 37) % 60),
			0.1,
			470 + Math.floor(i / 7) * 90 + ((i * 53) % 40)
		);
		f.receiveShadow = true;
		scene.add(f);
	}
	// farmland between the Baragaon row and Begumpur, as the surveys describe
	for (let i = 0; i < 12; i++) {
		const f = new THREE.Mesh(fieldGeo, mat(i % 2 ? C.fieldA : C.fieldB));
		f.rotation.x = -Math.PI / 2;
		const east = i % 2 ? 1 : -1;
		f.position.set(
			east * (170 + ((i * 67) % 180)),
			0.1,
			-680 - (i % 4) * 105 - ((i * 31) % 50)
		);
		f.receiveShadow = true;
		scene.add(f);
	}
	// the road runs from Monastery 1 north to the threshold of the Begumpur
	// quadrangle — it neither cuts through Monastery 1A in the south nor into
	// the closed quadrangle in the north
	const road = new THREE.Mesh(new THREE.PlaneGeometry(14, 1230), mat(C.road));
	road.rotation.x = -Math.PI / 2;
	road.position.set(20, 0.15, -445);
	road.receiveShadow = true;
	scene.add(road);

	/* enclosure wall — taken right out to the surveyed extent of the site */
	const wallH = 7;
	const wallT = 2.4;
	const W = { x0: -180, x1: 310, z0: -1350, z1: 420 };
	const gateW = 10;
	function wallRun(axis: 'x' | 'z', fixed: number, from: number, to: number, gapAt: number | null) {
		const segs: [number, number][] = gapAt === null
			? [[from, to]]
			: [
					[from, gapAt - gateW / 2],
					[gapAt + gateW / 2, to]
				];
		for (const [a, b] of segs) {
			const len = b - a;
			if (len <= 0) continue;
			if (axis === 'x') addBox(scene, len, wallH, wallT, (a + b) / 2, wallH / 2, fixed, brick);
			else addBox(scene, wallT, wallH, len, fixed, wallH / 2, (a + b) / 2, brick);
		}
	}
	// south (the gate of the texts), north, east, west — four gates (later tradition)
	wallRun('x', W.z1, W.x0, W.x1, 20);
	wallRun('x', W.z0, W.x0, W.x1, 20);
	wallRun('z', W.x1, W.z0, W.z1, -280); // east and west gates at the wall's
	wallRun('z', W.x0, W.z0, W.z1, -280); // midpoint, level with Temple 14
	function gatehouse(x: number, z: number, axis: 'x' | 'z', main: boolean) {
		const h = main ? 12 : 9.5;
		const [dx, dz] = axis === 'x' ? [8, 0] : [0, 8];
		addBox(scene, axis === 'x' ? 7 : 8, h, axis === 'x' ? 8 : 7, x - dx, h / 2, z - dz, brickDark);
		addBox(scene, axis === 'x' ? 7 : 8, h, axis === 'x' ? 8 : 7, x + dx, h / 2, z + dz, brickDark);
		if (axis === 'x') addBox(scene, 24, 3, 9, x, h + 1.2, z, stone);
		else addBox(scene, 9, 3, 24, x, h + 1.2, z, stone);
	}
	gatehouse(20, W.z1, 'x', true); // south — the single gate Xuanzang describes
	gatehouse(20, W.z0, 'x', false);
	gatehouse(W.x1, -280, 'z', false);
	gatehouse(W.x0, -280, 'z', false);

	/* the great well, inside the south gate */
	const wellOuter = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.6, 1.6, 20), stone);
	wellOuter.position.set(34, 0.8, 398);
	wellOuter.castShadow = wellOuter.receiveShadow = true;
	scene.add(wellOuter);
	const wellWater = new THREE.Mesh(new THREE.CircleGeometry(2.6, 20), mat(C.water));
	wellWater.rotation.x = -Math.PI / 2;
	wellWater.position.set(34, 1.62, 398);
	scene.add(wellWater);

	/* Temple 3 — the great temple amid its votive stupas, with Monastery 18
	   adjacent to its east and Monastery 1A beyond, tucked under Monastery 1 */
	scene.add(buildTemple(-47, 205, 52, true, brick, stone));
	scene.add(buildCourt(-8, 205, 26, 'north', brick, stone)); // Monastery 18
	scene.add(buildCourt(25, 212, 40, 'north', brick, stone)); // Monastery 1A

	/* Monasteries 1, 4, 6, 7, 8, 9, 10, 11 — the excavated line, entrances west */
	const courtZ = [160, 102, 44, -14, -72, -130, -188, -246];
	for (const z of courtZ) scene.add(buildCourt(58, z, 52, 'west', brick, stone));

	/* the buried extension of the row, south of Monastery 1A (F5) — and one
	   more temple in front of its southernmost court (F4): satellite-inferred */
	const ghostCourts: [number, number, number][] = [
		[58, 280, 58],
		[58, 350, 58]
	];
	for (const [x, z, S] of ghostCourts) scene.add(ghostify(buildCourt(x, z, S, 'west', brick, stone)));
	scene.add(ghostify(buildTemple(-47, 350, 62, true, brick, stone))); // F4
	/* the circular field-mounds, drawn as the great stupas they may hide */
	scene.add(ghostify(buildStupa(-40, 437, 16, brick))); // F7
	scene.add(ghostify(buildStupa(-160, 505, 16, brick))); // F8

	/* the conjectured northern continuation: two buried temples on the axis
	   (F1, and F2 — drawn as Bālāditya's unlocated great temple), the Baragaon
	   brick mound as a great stupa (F3), and five more courts under the
	   villages — a guess from the temple-faces-monastery pattern */
	scene.add(ghostify(buildTemple(-47, -390, 52, true, brick, stone))); // F1
	scene.add(ghostify(buildTemple(-47, -545, 80, true, brick, stone))); // F2
	scene.add(ghostify(buildStupa(-60, -655, 18, brick))); // F3
	for (const z of [-380, -445, -510, -575, -640])
		scene.add(ghostify(buildCourt(58, z, 58, 'west', brick, stone)));

	/* cell doors — nine in a row per side (Yijing), instanced across the courts */
	const doorGeo = new THREE.BoxGeometry(1.5, 2.6, 0.5);
	const doorMat = mat(C.door);
	const doors = new THREE.InstancedMesh(doorGeo, doorMat, 460);
	const dummy = new THREE.Object3D();
	let di = 0;
	function courtDoors(cx: number, cz: number, S: number, n: number) {
		const half = S / 2 - 7;
		for (let k = 0; k < n; k++) {
			const t = ((k + 0.5) / n - 0.5) * 2 * (half - 1.5);
			dummy.rotation.set(0, 0, 0);
			dummy.position.set(cx + t, 1.3, cz - half + 0.05);
			dummy.updateMatrix();
			doors.setMatrixAt(di++, dummy.matrix);
			dummy.position.set(cx + t, 1.3, cz + half - 0.05);
			dummy.updateMatrix();
			doors.setMatrixAt(di++, dummy.matrix);
			dummy.rotation.set(0, Math.PI / 2, 0);
			dummy.position.set(cx + half - 0.05, 1.3, cz + t);
			dummy.updateMatrix();
			doors.setMatrixAt(di++, dummy.matrix);
			dummy.position.set(cx - half + 0.05, 1.3, cz + t);
			dummy.updateMatrix();
			doors.setMatrixAt(di++, dummy.matrix);
		}
	}
	for (const z of courtZ) courtDoors(58, z, 52, 9);
	courtDoors(25, 212, 40, 7); // Monastery 1A
	courtDoors(-8, 205, 26, 4); // Monastery 18
	doors.count = di;
	scene.add(doors);

	/* windows: all three storeys outside, the two upper storeys on the
	   courtyard faces (the ground floor inside is the row of cell doors) —
	   but never on the entrance section itself */
	const winGeo = new THREE.BoxGeometry(1.1, 1.5, 0.4);
	const wins = new THREE.InstancedMesh(winGeo, doorMat, 2000);
	let wi = 0;
	function windowRow(cx: number, cz: number, S: number, facing: Facing) {
		for (const y of [2, 6, 10]) {
			for (let k = 0; k < 7; k++) {
				const t = ((k + 0.5) / 7 - 0.5) * 2 * (S / 2 - 3);
				const nearEntrance = Math.abs(t) < 8; // keep the entrance bay clear
				dummy.rotation.set(0, 0, 0);
				if (!(nearEntrance && facing === 'north')) {
					dummy.position.set(cx + t, y, cz - S / 2 - 0.05);
					dummy.updateMatrix();
					wins.setMatrixAt(wi++, dummy.matrix);
				}
				dummy.position.set(cx + t, y, cz + S / 2 + 0.05);
				dummy.updateMatrix();
				wins.setMatrixAt(wi++, dummy.matrix);
				dummy.rotation.set(0, Math.PI / 2, 0);
				if (!(nearEntrance && facing === 'west')) {
					dummy.position.set(cx - S / 2 - 0.05, y, cz + t);
					dummy.updateMatrix();
					wins.setMatrixAt(wi++, dummy.matrix);
				}
				dummy.position.set(cx + S / 2 + 0.05, y, cz + t);
				dummy.updateMatrix();
				wins.setMatrixAt(wi++, dummy.matrix);
			}
		}
	}
	function innerWindowRows(cx: number, cz: number, half: number, n: number, facing: Facing) {
		for (const y of [6, 10]) {
			for (let k = 0; k < n; k++) {
				const t = ((k + 0.5) / n - 0.5) * 2 * (half - 1.5);
				const nearEntrance = Math.abs(t) < 6; // the gap and its flanks
				dummy.rotation.set(0, 0, 0);
				if (!(nearEntrance && facing === 'north')) {
					dummy.position.set(cx + t, y, cz - half + 0.05);
					dummy.updateMatrix();
					wins.setMatrixAt(wi++, dummy.matrix);
				}
				dummy.position.set(cx + t, y, cz + half - 0.05);
				dummy.updateMatrix();
				wins.setMatrixAt(wi++, dummy.matrix);
				dummy.rotation.set(0, Math.PI / 2, 0);
				dummy.position.set(cx + half - 0.05, y, cz + t);
				dummy.updateMatrix();
				wins.setMatrixAt(wi++, dummy.matrix);
				if (!(nearEntrance && facing === 'west')) {
					dummy.position.set(cx - half + 0.05, y, cz + t);
					dummy.updateMatrix();
					wins.setMatrixAt(wi++, dummy.matrix);
				}
			}
		}
	}
	for (const z of courtZ) {
		windowRow(58, z, 52, 'west');
		innerWindowRows(58, z, 52 / 2 - 7, 9, 'west');
	}
	windowRow(25, 212, 40, 'north');
	innerWindowRows(25, 212, 40 / 2 - 7, 7, 'north');
	windowRow(-8, 205, 26, 'north');
	innerWindowRows(-8, 205, 26 / 2 - 7, 4, 'north');
	wins.count = wi;
	scene.add(wins);

	/* Temple 2 east of the row — and its twin the Sarai temple, further east
	   at about the same remove as Temple 2 stands from Temple 12 */
	scene.add(buildShrine(108, -100, brick, stone));
	scene.add(buildShrine(276, -75, brick, stone));

	/* Temple 12 — the great domed temple, with its own stupa field */
	scene.add(buildDomedTemple(-47, 44, brick, stone));
	/* Temple 13 — the tall pyramid, with corner turrets and its own stupas */
	scene.add(buildTemple(-47, -130, 52, true, brick, stone));
	/* Brass Temple of Śīlāditya — unfinished, between Temples 3 and 12 */
	const brassG = new THREE.Group();
	addBox(brassG, 24, 5, 24, -47, 2.5, 130, brick);
	const brassFrame = new THREE.LineSegments(
		new THREE.EdgesGeometry(new THREE.BoxGeometry(18, 16, 18)),
		new THREE.LineBasicMaterial({ color: C.brickDark })
	);
	brassFrame.position.set(-47, 13, 130);
	brassG.add(brassFrame);
	scene.add(brassG);
	/* Temple 14, the northernmost excavated temple — a modest stūpa-shrine,
	   the same scale as Temple 13 (Bālāditya's colossus lies further north,
	   unexcavated) */
	scene.add(buildTemple(-47, -280, 52, true, brick, stone));

	/* votive stupa fields around the standing temples (instanced, three parts) */
	const vDrum = new THREE.InstancedMesh(new THREE.CylinderGeometry(1.5, 1.8, 1.6, 10), brick, 80);
	const vDome = new THREE.InstancedMesh(
		new THREE.SphereGeometry(1.5, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2),
		mat(C.plaster),
		80
	);
	const vSpire = new THREE.InstancedMesh(new THREE.ConeGeometry(0.4, 1.6, 6), mat(C.sandstone), 80);
	let vi = 0;
	function stupaRing(cx: number, cz: number, r0: number, n: number, seed: number) {
		for (let k = 0; k < n; k++) {
			const a = (k / n) * Math.PI * 2 + seed;
			const r = r0 + ((k * 13 + seed * 7) % 8);
			const x = cx + Math.cos(a) * r;
			const z = cz + Math.sin(a) * r * 0.85;
			if (x > -23 && z > 184) continue; // keep clear of Monasteries 18 and 1A
			const s = 0.7 + ((k * 7 + seed) % 5) / 6;
			dummy.rotation.set(0, 0, 0);
			dummy.scale.setScalar(s);
			dummy.position.set(x, 0.8 * s, z);
			dummy.updateMatrix();
			vDrum.setMatrixAt(vi, dummy.matrix);
			dummy.position.set(x, 1.6 * s, z);
			dummy.updateMatrix();
			vDome.setMatrixAt(vi, dummy.matrix);
			dummy.position.set(x, 3.4 * s, z);
			dummy.updateMatrix();
			vSpire.setMatrixAt(vi, dummy.matrix);
			vi++;
		}
	}
	stupaRing(-47, 205, 27, 14, 0);
	stupaRing(-47, 205, 36, 8, 2);
	stupaRing(-47, 44, 30, 12, 1);
	stupaRing(-47, -130, 25, 10, 3); // around Temple 13
	stupaRing(-47, -280, 25, 10, 4); // around Temple 14
	vDrum.count = vDome.count = vSpire.count = vi;
	dummy.scale.setScalar(1);
	vDrum.castShadow = vDome.castShadow = true;
	scene.add(vDrum, vDome, vSpire);

	/* small shrines west of the road, as on the plan */
	for (const z of [130, -60, -200]) {
		addBox(scene, 6, 5, 6, -16, 2.5, z, brick);
		const sf = new THREE.Mesh(new THREE.ConeGeometry(2.4, 3, 4), stone);
		sf.rotation.y = Math.PI / 4;
		sf.position.set(-16, 6.5, z);
		sf.castShadow = true;
		scene.add(sf);
	}

	/* relic stupa + the willow-twig tree, between Temple 12 and the Brass Temple */
	scene.add(buildStupa(-22, 70, 9, brick));
	const trunkMat = mat(C.trunk);
	const leafMat = mat(C.leaf);
	const willow = new THREE.Group();
	const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 4.6, 8), trunkMat);
	trunk.position.set(-24, 2.3, 92);
	willow.add(trunk);
	for (const [dx, dz] of [
		[-1.8, 0.6],
		[1.8, -0.6]
	]) {
		const b = new THREE.Mesh(new THREE.SphereGeometry(2.5, 10, 8), leafMat);
		b.position.set(-24 + dx, 6.2, 92 + dz);
		b.castShadow = true;
		willow.add(b);
	}
	scene.add(willow);

	/* the ring of great tanks — believed dug for the earth that made the
	   bricks (Rajani 2014); they trace the edge of the site, outside the wall */
	const tankMat = mat(0x8fb5ad); // a touch deeper than the well, to read from the air
	function tank(cx: number, cz: number, w: number, d: number) {
		const t = new THREE.Mesh(new THREE.BoxGeometry(w, 1, d), tankMat);
		t.position.set(cx, 0.5, cz);
		t.receiveShadow = true;
		scene.add(t);
	}
	tank(470, -1210, 300, 100); // Dighi Pokhar, with its eastward spread
	tank(660, -1190, 90, 60);
	tank(360, -510, 85, 270); // Pansokar Pokhar — the path touches its bank
	tank(-240, -520, 75, 75); // Suraj Pokhar
	tank(-260, 470, 170, 95); // Indra Pokhar
	tank(90, 470, 70, 45); // Kargidya
	tank(-218, 90, 60, 36); // the tank outside the west wall
	/* sparrow stupa beside it */
	scene.add(buildStupa(-203, 62, 6, brick));

	/* copper colossus — “over eighty feet tall”, in its own walled enclosure
	   outside the east gate, the walls a little higher than the statue */
	const enc = new THREE.Group();
	const KX = 420;
	const KZ = -250;
	const ES = 22;
	const EH = 27;
	const encMat = mat(C.brick, { transparent: true, opacity: 0.82 });
	addBox(enc, ES, EH, 1.2, KX, EH / 2, KZ - ES / 2, encMat);
	addBox(enc, ES, EH, 1.2, KX, EH / 2, KZ + ES / 2, encMat);
	addBox(enc, 1.2, EH, ES, KX + ES / 2, EH / 2, KZ, encMat);
	const eseg = (ES - 8) / 2;
	addBox(enc, 1.2, EH, eseg, KX - ES / 2, EH / 2, KZ - 4 - eseg / 2, encMat);
	addBox(enc, 1.2, EH, eseg, KX - ES / 2, EH / 2, KZ + 4 + eseg / 2, encMat);
	addBox(enc, 2, 1.6, 10, KX - ES / 2, EH * 0.7, KZ, stone);
	for (const y of [9, 18]) {
		addBox(enc, ES + 0.5, 0.5, 0.6, KX, y, KZ - ES / 2, stone).castShadow = false;
		addBox(enc, ES + 0.5, 0.5, 0.6, KX, y, KZ + ES / 2, stone).castShadow = false;
	}
	// the standing figure: pedestal, robe, torso, head — ~24 m to the uṣṇīṣa
	const bronzeM = mat(C.bronze, { emissive: 0x33240e, emissiveIntensity: 0.5 });
	addBox(enc, 9, 1.6, 9, KX, 0.8, KZ, stone);
	const robe = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 3.1, 11, 14), bronzeM);
	robe.position.set(KX, 7.1, KZ);
	robe.castShadow = true;
	enc.add(robe);
	const torso = new THREE.Mesh(new THREE.CapsuleGeometry(2.0, 5.6, 6, 12), bronzeM);
	torso.position.set(KX, 15.4, KZ);
	torso.castShadow = true;
	enc.add(torso);
	for (const s of [-1, 1]) {
		const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.62, 4.6, 4, 8), bronzeM);
		arm.position.set(KX + s * 2.6, 14.6, KZ);
		arm.rotation.z = s * 0.18;
		arm.castShadow = true;
		enc.add(arm);
	}
	const headB = new THREE.Mesh(new THREE.SphereGeometry(1.55, 12, 10), bronzeM);
	headB.position.set(KX, 20.1, KZ);
	headB.castShadow = true;
	enc.add(headB);
	const usnisa = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 6), bronzeM);
	usnisa.position.set(KX, 21.6, KZ);
	enc.add(usnisa);
	scene.add(enc);

	/* Tārā temple, further north of the colossus */
	scene.add(buildTemple(435, -370, 24, false, brick, stone));

	/* the Begumpur quadrangle (F9) — ~450 × 400 m, four-pointed, only 4–5 m
	   proud of the fields; on the scale of Somāpura and Vikramaśīla */
	scene.add(ghostify(buildQuadrangle(0, -1180, 220, brick, stone), 0.5));

	/* villages — “in possession of 201 villages” (Yijing) */
	const hutGeo = new THREE.BoxGeometry(4.5, 3, 4.5);
	const roofGeo = new THREE.ConeGeometry(3.8, 2.4, 4);
	const huts = new THREE.InstancedMesh(hutGeo, mat(0xc9b389), 90);
	const roofs = new THREE.InstancedMesh(roofGeo, mat(0x9a7d52), 90);
	let hi = 0;
	for (let c = 0; c < 15; c++) {
		const cx = -520 + (c % 5) * 260 + ((c * 71) % 70);
		const cz = 510 + Math.floor(c / 5) * 120 + ((c * 41) % 50);
		for (let k = 0; k < 6; k++) {
			const x = cx + ((k * 29) % 24) - 12;
			const z = cz + ((k * 47) % 20) - 10;
			dummy.rotation.set(0, ((c + k) * 0.7) % Math.PI, 0);
			dummy.position.set(x, 1.5, z);
			dummy.updateMatrix();
			huts.setMatrixAt(hi, dummy.matrix);
			dummy.position.y = 4.2;
			dummy.rotation.y += Math.PI / 4;
			dummy.updateMatrix();
			roofs.setMatrixAt(hi, dummy.matrix);
			hi++;
		}
	}
	huts.count = roofs.count = hi;
	huts.castShadow = roofs.castShadow = true;
	scene.add(huts, roofs);

	/* mango trees */
	const treeTrunk = new THREE.InstancedMesh(
		new THREE.CylinderGeometry(0.4, 0.6, 3.4, 6),
		trunkMat,
		110
	);
	const treeCrown = new THREE.InstancedMesh(new THREE.SphereGeometry(3, 8, 6), leafMat, 110);
	let ti = 0;
	// naturally dispersed groves (deterministic LCG so the scene never shifts)
	let seed = 42;
	const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
	const tankRects: [number, number, number, number][] = [
		[470, -1210, 300, 100],
		[660, -1190, 90, 60],
		[360, -510, 85, 270],
		[-240, -520, 75, 75],
		[-260, 470, 170, 95],
		[90, 470, 70, 45],
		[-218, 90, 60, 36]
	];
	for (let i = 0; i < 500 && ti < 110; i++) {
		const x = -800 + rnd() * 1600;
		const z = -1640 + rnd() * 2400;
		if (x > -220 && x < 340 && z > -1400 && z < 450) continue; // keep the precinct clear
		if (x > 390 && x < 470 && z > -400 && z < -220) continue; // and the colossus + Tārā
		if (tankRects.some(([tx, tz, tw, td]) => Math.abs(x - tx) < tw / 2 + 5 && Math.abs(z - tz) < td / 2 + 5))
			continue;
		const s = 0.75 + rnd() * 0.6;
		dummy.rotation.set(0, 0, 0);
		dummy.scale.setScalar(s);
		dummy.position.set(x, 1.7 * s, z);
		dummy.updateMatrix();
		treeTrunk.setMatrixAt(ti, dummy.matrix);
		dummy.position.y = 5 * s;
		dummy.updateMatrix();
		treeCrown.setMatrixAt(ti, dummy.matrix);
		ti++;
	}
	dummy.scale.setScalar(1);
	treeTrunk.count = treeCrown.count = ti;
	treeCrown.castShadow = true;
	scene.add(treeTrunk, treeCrown);

	/* ghost library — later Tibetan tradition, location unrecorded; drawn in
	   the northern mound cluster, between the buried temples and Begumpur */
	const ghostMat = new THREE.MeshBasicMaterial({
		color: C.saffron,
		transparent: true,
		opacity: 0,
		depthWrite: false
	});
	const ghostEdges = new THREE.LineBasicMaterial({
		color: C.saffron,
		transparent: true,
		opacity: 0
	});
	const ghost = new THREE.Group();
	function ghostHall(
		hx: number,
		hz: number,
		floors: number,
		w0: number,
		d0: number,
		shrinkW: number,
		shrinkD: number
	) {
		for (let i = 0; i < floors; i++) {
			const geo = new THREE.BoxGeometry(w0 - i * shrinkW, 6.2, d0 - i * shrinkD);
			const solid = new THREE.Mesh(geo, ghostMat);
			solid.position.set(hx, i * 6.4 + 3.1, hz);
			ghost.add(solid);
			const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), ghostEdges);
			edges.position.copy(solid.position);
			ghost.add(edges);
		}
	}
	// Ratnodadhi, nine storeys, oblong (a hall of books, not a temple) — and
	// its two sister halls, smaller and even-sided, to either side
	ghostHall(-48, -880, 9, 30, 64, 1.4, 2.8);
	ghostHall(-48, -946, 7, 26, 26, 1.6, 1.6);
	ghostHall(-48, -814, 7, 26, 26, 1.6, 1.6);
	scene.add(ghost);
	let ghostTarget = 0;
	let ghostVal = 0;

	/* ------------------------------------------------------ glowing path --- */
	const curve = new THREE.CatmullRomCurve3(
		PATH_POINTS.map(([x, z]) => new THREE.Vector3(x, 1.2, z))
	);
	const SEGS = 1600;
	const tube = new THREE.Mesh(
		new THREE.TubeGeometry(curve, SEGS, 0.55, 6),
		new THREE.MeshBasicMaterial({ color: C.saffron })
	);
	const halo = new THREE.Mesh(
		new THREE.TubeGeometry(curve, SEGS, 1.8, 6),
		new THREE.MeshBasicMaterial({
			color: C.saffron,
			transparent: true,
			opacity: 0.12,
			blending: THREE.AdditiveBlending,
			depthWrite: false
		})
	);
	scene.add(tube, halo);
	const tubeIndexCount = tube.geometry.index!.count;
	const haloIndexCount = halo.geometry.index!.count;

	// arc-length fraction of each control point, so the path stays with the story
	const fractions: number[] = [0];
	{
		let acc = 0;
		for (let i = 1; i < PATH_POINTS.length; i++) {
			const [ax, az] = PATH_POINTS[i - 1];
			const [bx, bz] = PATH_POINTS[i];
			acc += Math.hypot(bx - ax, bz - az);
			fractions.push(acc);
		}
		for (let i = 0; i < fractions.length; i++) fractions[i] /= acc;
	}

	// glowing head sprite
	const spriteCanvas = document.createElement('canvas');
	spriteCanvas.width = spriteCanvas.height = 64;
	const ctx = spriteCanvas.getContext('2d')!;
	const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
	grad.addColorStop(0, 'rgba(255,220,150,1)');
	grad.addColorStop(0.4, 'rgba(224,130,20,0.55)');
	grad.addColorStop(1, 'rgba(224,130,20,0)');
	ctx.fillStyle = grad;
	ctx.fillRect(0, 0, 64, 64);
	const head = new THREE.Sprite(
		new THREE.SpriteMaterial({
			map: new THREE.CanvasTexture(spriteCanvas),
			blending: THREE.AdditiveBlending,
			depthWrite: false
		})
	);
	head.scale.set(7, 7, 1);
	scene.add(head);

	/* ------------------------------------------------------------- loop --- */
	let progress = 0;
	let shown = 0;
	let disposed = false;
	// on narrow (mobile) viewports the camera is dollied back from its look
	// target so more of the site fits the portrait frame; 1 on desktop
	let dolly = 1;
	const pos = new THREE.Vector3();
	const look = new THREE.Vector3();
	const a = new THREE.Vector3();
	const b = new THREE.Vector3();

	// station number → scroll fraction; replaced by measured values via calibrate()
	let stationPs = Array.from({ length: N_STATIONS }, (_, i) => (i + 0.5) / N_STATIONS);
	let keyPs: number[] = [];
	function computeKeyPs() {
		const last = N_STATIONS - 1;
		const sToP = (s: number) => {
			if (s <= -0.5) return 0;
			if (s >= last + 0.5) return 1;
			if (s < 0) return ((s + 0.5) / 0.5) * stationPs[0];
			if (s > last) return stationPs[last] + ((s - last) / 0.5) * (1 - stationPs[last]);
			const i = Math.floor(s);
			const f = s - i;
			return f === 0 ? stationPs[i] : stationPs[i] + f * (stationPs[i + 1] - stationPs[i]);
		};
		keyPs = CAM_KEYS.map((k) => sToP(k.s));
	}
	computeKeyPs();

	function applyProgress(p: number) {
		let i = CAM_KEYS.length - 2;
		for (let k = 0; k < CAM_KEYS.length - 1; k++) {
			if (p <= keyPs[k + 1]) {
				i = k;
				break;
			}
		}
		const k0 = CAM_KEYS[i];
		const k1 = CAM_KEYS[i + 1];
		const span = Math.max(1e-6, keyPs[i + 1] - keyPs[i]);
		const t = smooth(Math.min(1, Math.max(0, (p - keyPs[i]) / span)));
		pos.lerpVectors(a.set(...k0.pos), b.set(...k1.pos), t);
		look.lerpVectors(a.set(...k0.look), b.set(...k1.look), t);
		// dolly the camera back along its view ray on mobile so more fits the frame
		if (dolly !== 1) pos.sub(look).multiplyScalar(dolly).add(look);
		camera.position.copy(pos);
		camera.lookAt(look);
		// path reveal keyed to the same keyframes as the camera — it walks with
		// the story (a half-step ahead) instead of racing off on its own
		const f0 = fractions[k0.idx];
		const f1 = fractions[k1.idx];
		const reveal = Math.min(1, f0 + (f1 - f0) * t + 0.012);
		tube.geometry.setDrawRange(0, Math.floor(tubeIndexCount * reveal));
		halo.geometry.setDrawRange(0, Math.floor(haloIndexCount * reveal));
		head.position.copy(curve.getPointAt(Math.min(0.999, reveal)));
		head.position.y += 1.6;
	}

	function tick() {
		if (disposed) return;
		shown += (progress - shown) * 0.085;
		applyProgress(shown);
		ghostVal += (ghostTarget - ghostVal) * 0.06;
		ghostMat.opacity = ghostVal * 0.35;
		ghostEdges.opacity = ghostVal * 0.9;
		head.material.opacity = 0.85 + 0.15 * Math.sin(performance.now() / 300);
		renderer.render(scene, camera);
		requestAnimationFrame(tick);
	}

	function resize() {
		const w = canvas.clientWidth;
		const h = canvas.clientHeight;
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		// pull the camera back on narrow/portrait viewports: full zoom-out by
		// ~360 px wide, none at ≥720 px, eased between
		const t = Math.min(1, Math.max(0, (720 - w) / (720 - 360)));
		dolly = 1 + 0.4 * t;
		applyProgress(shown);
	}

	resize();
	applyProgress(0);
	renderer.shadowMap.needsUpdate = true;
	requestAnimationFrame(tick);

	return {
		setProgress(p) {
			progress = Math.min(1, Math.max(0, p));
		},
		setStation(i) {
			// the library ghost fades in at its own station and stays for the
			// Begumpur and farewell views
			ghostTarget = i >= 12 ? 1 : 0;
		},
		calibrate(ps) {
			if (ps.length === N_STATIONS && ps.every((v) => Number.isFinite(v))) {
				stationPs = ps.slice();
				computeKeyPs();
			}
		},
		resize,
		dispose() {
			disposed = true;
			renderer.dispose();
			scene.traverse((o) => {
				const m = o as THREE.Mesh;
				if (m.geometry) m.geometry.dispose();
			});
		}
	};
}
