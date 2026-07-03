/**
 * Procedural, stylised 3D reconstruction of the Mahābodhi complex at Bodh Gayā
 * for the scroll tour. The layout follows Xuanzang's bearings (Record,
 * Fascicle VIII — every monument is placed by his cardinal direction from the
 * bodhi tree) checked against Cunningham's excavated survey (Mahābodhi, 1892:
 * Plates I, II, XI, XVIII) — see raw/extra/mahabodhi-schematic-instructions.md.
 *
 *   Three concentric stone railings (vedikā, the pillar-and-rail design whose
 *   Aśokan pillars Cunningham excavated) ring the tree, the temple terrace
 *   and the courtyard; Xuanzang's "high and strong" brick wall is drawn as
 *   the outermost enclosure, taking in the courtyard and the flower pool.
 *
 *   SOLID — the standing Great Temple (drawn in the stone grey of the temple
 *   as it looks today; Xuanzang records brick plastered with lime), the
 *   railings, Buddha's Walk, the extant tanks (Buddhokar, Mucilinda, Indra's
 *   pool), the courtyard monuments Cunningham matched to Xuanzang's list, and
 *   the Mahābodhi Saṅghārāma drawn to Cunningham's measured plan (the
 *   36-square block, the 16-towered enclosure, walls 30–40 ft).
 *
 *   TRANSLUCENT via ghostify() — satellite-inferred, not yet excavated: the
 *   outer monastery square with its moat (Cardiff/Bihar survey) and the
 *   Sujātā stupa across the Nairañjanā.
 *
 * The image within the temple sits against the back (west) wall, only that
 * wall between it and the tree; at the "image within" and "tree and diamond
 * seat" stations the real temple thins to a faint translucent ghost of itself,
 * its true stepped silhouette redrawn in edge-lines, so the chamber can be
 * seen through the actual building (not a blocky proxy shell).
 *
 * Scene units are metres-ish. +x = east, −z = north (the main gate is east,
 * toward the river; the west side is the "inaccessible natural barrier").
 * Origin (0,0) = the diamond seat and the bodhi tree.
 */
import * as THREE from 'three';
import type { SceneTour } from './types';
import { createTreeLoaders } from './treeModels';
import { buildRiceLand } from './riceFields';

/* --------------------------------------------------------------- palette --- */
const C = {
	fog: 0xdfe2d0, // horizon haze between the cream sky and green land (as Nālandā)
	ground: 0xb6c39c,
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
	leafDark: 0x5f7d4a,
	trunk: 0x6e573b,
	bronze: 0x9c7a40,
	saffron: 0xe08214,
	gold: 0xc2a14d,
	// Bodh Gayā additions — the temple is all stone
	stoneTemple: 0xb1a795, // weathered grey stone of the Mahābodhi tower
	stoneDark: 0x7b7263, // niches, door hollows
	railing: 0xbf9077, // the pinkish sandstone vedikā
	granite: 0x7a7268, // toran pillars
	silver: 0xc9cbd0, // the two silver doorway bodhisattvas
	blueStone: 0x5b7a94, // the veined blue stone before the Ratnagṛha
	saffronPlaster: 0xdfa055 // the Kunkuma stupa's saffron-clay facing
};

const mat = (color: number, opts: THREE.MeshLambertMaterialParameters = {}) =>
	new THREE.MeshLambertMaterial({ color, ...opts });

const N_STATIONS = 23;

/* ---------------------------------------------------------- glowing path --- */
/** Ground route, in story order: from the western fields, around the barrier
 *  mounds, through the gap between the outermost wall and the great
 *  monastery, down to the bank of the Nairañjanā, back in by the east gates,
 *  the temple, the tree, the seven stations, out by the south gate to the
 *  pools, and at last around the walls to the Saṅghārāma's court. */
/* One waypoint per story station, in scroll order — so the glowing head sits
   on each monument as its card comes up, and the saffron trail threads the
   whole route (it criss-crosses, because the monuments are scattered and the
   narrative order is not geographic). */
const PATH_POINTS: [number, number][] = [
	[-150, 0], // 0 the approach, from the west
	[20, -100], // 1 between the Mahābodhi and the monastery, on the way to the river
	[188, 4], // 2 the river bank
	[64, 0], // 3 in by the east gate
	[30, 0], // 4 the Great Temple, at the door
	[27, 0], // 5 the tower
	[12, 0], // 6 the image within
	[-5.5, 0], // 7 the tree and diamond seat
	[8, -16], // 8 Buddha's Walk
	[58, -28], // 9 the gazing shrine
	[-33, -38], // 10 Kāśyapa's shrine and the earth gods
	[-66, -2], // 11 the Ratnagṛha
	[-96, -18], // 12 the Saffron Stupa, at the west wall
	[-4, 36], // 13 Aśoka's stupa of the grass
	[64, 44], // 14 the banyan
	[1, 54.5], // 15 the sinking bodhisattva
	[22, 22], // 16 scales of a fish (the courtyard)
	[-70, 68], // 17 the milkmaids
	[8, 90], // 18 the flower pool
	[85, 106], // 19 Mucilinda's lake
	[128, 116], // 20 the six years' austerities
	[160, 84], // 21 the merchants' offering
	[10, -150], // 22 the road to the Saṅghārāma
	[10, -205] // 23 the Saṅghārāma
];

/* ------------------------------------------------------- camera keyframes --- */
interface CamKey {
	s: number;
	pos: [number, number, number];
	look: [number, number, number];
	idx: number;
}

const CAM_KEYS: CamKey[] = [
	{ s: -0.5, pos: [-380, 200, 380], look: [10, 20, 0], idx: 0 },
	{ s: 0, pos: [-240, 60, 140], look: [10, 26, -20], idx: 0 }, // 0 approach, from the west facing east
	{ s: 0.5, pos: [-96, 24, -104], look: [90, 8, -96], idx: 1 }, // between the temple (right) and the monastery (left)
	{ s: 1, pos: [215, 20, -70], look: [170, 2, 95], idx: 2 }, // 1 the river bank, complex at right
	{ s: 1.5, pos: [195, 18, 40], look: [290, 6, 95], idx: 3 },
	{ s: 2, pos: [158, 13, 26], look: [95, 5, 0], idx: 3 }, // 2 the east gates
	{ s: 2.5, pos: [92, 9, 8], look: [44, 8, 0], idx: 4 },
	{ s: 3, pos: [72, 16, 42], look: [12, 24, 0], idx: 4 }, // 3 the Great Temple (exterior)
	{ s: 4, pos: [74, 32, 58], look: [10, 30, 0], idx: 5 }, // 4 the tower and its long ruin
	{ s: 5, pos: [42, 9, 13], look: [-0.5, 3, 0], idx: 6 }, // 5 the image within (temple fades)
	{ s: 6, pos: [-30, 18, 26], look: [-5, 8, 0], idx: 7 }, // 6 tree + diamond seat (temple fades)
	{ s: 7, pos: [-12, 9, -28], look: [12, 1.5, -15], idx: 8 }, // 7 Buddha's Walk
	{ s: 8, pos: [86, 16, -14], look: [58, 8, -28], idx: 9 }, // 8 the gazing shrine
	{ s: 9, pos: [10, 12, -24], look: [-40, 3, -35], idx: 10 }, // 9 Kāśyapa's shrine and the earth gods
	{ s: 10, pos: [-40, 9, -20], look: [-66, 4, -2], idx: 11 }, // 10 the Ratnagṛha
	{ s: 11, pos: [-82, 27, -6], look: [-112, 10, -18], idx: 12 }, // 11 the Saffron Stupa
	{ s: 12, pos: [28, 18, 17], look: [-4, 12, 36], idx: 13 }, // 12 Aśoka's stupa of the clean grass
	{ s: 13, pos: [42, 12, 60], look: [64, 6, 43], idx: 14 }, // 13 the banyan
	{ s: 14, pos: [30, 11, 42], look: [1, 2, 54.5], idx: 15 }, // 14 the sinking bodhisattva
	{ s: 15, pos: [90, 68, 68], look: [0, 5, 5], idx: 16 }, // 15 scales of a fish
	{ s: 16, pos: [-42, 14, 54], look: [-70, 6, 70], idx: 17 }, // 16 the milkmaids
	{ s: 17, pos: [-32, 26, 42], look: [10, 0, 98], idx: 18 }, // 17 the flower pool
	{ s: 18, pos: [52, 12, 128], look: [86, 2, 106], idx: 19 }, // 18 Mucilinda
	{ s: 19, pos: [156, 14, 122], look: [131, 4, 113], idx: 20 }, // 19 the six years' austerities
	{ s: 20, pos: [148, 11, 42], look: [162, 3, 84], idx: 21 }, // 20 the merchants
	{ s: 20.5, pos: [95, 32, -25], look: [10, 10, -140], idx: 22 },
	{ s: 21, pos: [10, 58, -75], look: [10, 4, -205], idx: 22 }, // 21 the Saṅghārāma
	{ s: 21.5, pos: [10, 32, -148], look: [10, 8, -212], idx: 23 },
	{ s: 22, pos: [-300, 220, 320], look: [40, 0, -60], idx: 23 }, // 22 what remains
	{ s: 22.5, pos: [-340, 250, 360], look: [40, 20, -60], idx: 23 }
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

/** Sand-pale translucency for the satellite-inferred structures (as Nālandā). */
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

export interface BodhgayaModels {
	/** the scanned seated Buddha for the temple sanctum */
	sitting?: string;
	/** the scanned standing Buddha for the Ratnagṛha */
	standing?: string;
	/** small scans instanced into the tower niches */
	nicheA?: string;
	nicheB?: string;
	/** low-poly foliage GLBs (materials preserved) */
	bodhiTree?: string;
	banyan?: string;
	/** low-poly bodhisattva for the two figures flanking the temple door */
	bodhisattva?: string;
	/** the two Avalokiteśvara statues at the enclosure's north/south limits */
	dancingBodhisattva?: string;
	/** the emaciated Buddha for the six-years-austerities shrine */
	fastingBuddha?: string;
	/** low-poly foliage GLBs scattered across the landscape (materials kept) */
	scatterTrees?: string[];
	/** low-poly bone pile for the modern charnel ground north-west of the temple */
	bones?: string;
}

export function createBodhgayaTour(canvas: HTMLCanvasElement, models: BodhgayaModels = {}): SceneTour {
	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.shadowMap.autoUpdate = false;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;

	const scene = new THREE.Scene();
	scene.fog = new THREE.Fog(C.fog, 420, 2600);

	const camera = new THREE.PerspectiveCamera(46, 1, 0.5, 4200);

	/* lights */
	scene.add(new THREE.HemisphereLight(0xdce9ef, 0xb3bf99, 0.95));
	const sun = new THREE.DirectionalLight(0xffe8c0, 1.5);
	sun.position.set(-380, 460, 260);
	sun.castShadow = true;
	sun.shadow.mapSize.set(4096, 4096);
	const sc = sun.shadow.camera;
	sc.left = -520;
	sc.right = 520;
	sc.top = 520;
	sc.bottom = -520;
	sc.far = 2600;
	scene.add(sun);

	const brick = mat(C.brick);
	const brickDark = mat(C.brickDark);
	const stone = mat(C.sandstone);
	const temple = mat(C.stoneTemple);
	const templeDark = mat(C.stoneDark);
	const railMat = mat(C.railing);
	const granite = mat(C.granite);
	const plasterM = mat(C.plaster);
	const greyStone = mat(0x9a9584);
	const goldM = mat(C.gold, { emissive: C.gold, emissiveIntensity: 0.3 });
	const dummy = new THREE.Object3D();
	let disposed = false;
	const { loadTreeModel, scatterSpecies } = createTreeLoaders({
		scene,
		renderer,
		isDisposed: () => disposed
	});

	/* ------------------------------------------------ ground and landscape --- */
	const ground = new THREE.Mesh(new THREE.PlaneGeometry(4200, 3600), mat(C.ground));
	ground.rotation.x = -Math.PI / 2;
	ground.position.set(60, 0, -60);
	ground.receiveShadow = true;
	scene.add(ground);

	/* the rice country — paddy quilts on the open land (bunds carry the trees;
	   the pattern is the one the monks' robes copy), forests where no field is cut */
	const riceLand = buildRiceLand(scene, {
		blocks: [
			{ x: -390, z: -40, w: 400, d: 340, rot: 0.07 }, // the western fields of the approach
			{ x: -380, z: -350, w: 340, d: 220, rot: -0.06 }, // north-west of the monastery
			{ x: -30, z: 330, w: 420, d: 220, rot: -0.08 }, // south, beyond the pools
			{ x: 120, z: -460, w: 110, d: 200, rot: 0.05 }, // between the road north and the river
			{ x: 500, z: 80, w: 220, d: 320, rot: -0.1 } // Sujātā's side of the river
		],
		forests: [
			{ x: -560, z: -560, r: 80, n: 60 },
			{ x: -600, z: 280, r: 75, n: 55 },
			{ x: -120, z: 520, r: 65, n: 45 },
			{ x: 490, z: -320, r: 90, n: 65 },
			{ x: 520, z: 330, r: 70, n: 50 },
			{ x: -800, z: -150, r: 100, n: 70 },
			{ x: -750, z: -750, r: 90, n: 60 },
			{ x: -380, z: 570, r: 80, n: 55 },
			{ x: 720, z: -100, r: 80, n: 55 },
			{ x: 700, z: 500, r: 90, n: 60 }
		],
		shades: [C.fieldA, C.fieldB, 0x9fb888, 0xccd5a9],
		treeHeight: 20, // 1.5× — landscape trees taller, fewer of them
		seed: 31
	});

	/* the Nairañjanā — a wide sandy river running the whole length of the land */
	const river = new THREE.Mesh(new THREE.PlaneGeometry(115, 3400), mat(C.water));
	river.rotation.x = -Math.PI / 2;
	river.position.set(262, 0.22, -60);
	scene.add(river);
	const bank = new THREE.Mesh(new THREE.PlaneGeometry(160, 3400), mat(0xe3d5ae));
	bank.rotation.x = -Math.PI / 2;
	bank.position.set(262, 0.12, -60);
	bank.receiveShadow = true;
	scene.add(bank);
	for (const [sx, sz, r] of [
		[250, -140, 16],
		[280, 60, 12],
		[262, 240, 20],
		[255, -420, 18],
		[275, 430, 15]
	]) {
		const shoal = new THREE.Mesh(new THREE.CircleGeometry(r, 18), mat(0xe9dcb6));
		shoal.rotation.x = -Math.PI / 2;
		shoal.position.set(sx, 0.3, sz);
		shoal.scale.z = 2.2;
		scene.add(shoal);
	}

	/* the western "inaccessible natural barrier" — a chain of sandy mounds */
	for (const [mx, mz, r, s] of [
		[-118, -55, 22, 0.22],
		[-130, -12, 26, 0.28],
		[-120, 34, 20, 0.2],
		[-136, 70, 24, 0.24],
		[-114, 100, 18, 0.18]
	]) {
		const mound = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 10), mat(0xc5c09a));
		mound.position.set(mx, -r * (1 - s * 2.2), mz);
		mound.scale.y = s * 2;
		mound.castShadow = mound.receiveShadow = true;
		scene.add(mound);
	}

	/* Prāgbodhi, far to the north-east beyond the river */
	for (const [mx, mz, r, h] of [
		[640, -720, 150, 72],
		[540, -800, 115, 48]
	]) {
		const hill = new THREE.Mesh(new THREE.ConeGeometry(r, h, 14), mat(0xb0ac8c));
		hill.position.set(mx, h / 2 - 2, mz);
		hill.castShadow = hill.receiveShadow = true;
		scene.add(hill);
	}

	/* roads: east to the river, south to the pool, north to the monastery */
	function roadStrip(w: number, l: number, x: number, z: number, rot = 0) {
		const r = new THREE.Mesh(new THREE.PlaneGeometry(w, l), mat(C.road));
		r.rotation.x = -Math.PI / 2;
		r.rotation.z = rot;
		r.position.set(x, 0.15, z);
		r.receiveShadow = true;
		scene.add(r);
	}
	roadStrip(6, 118, 141, 0, Math.PI / 2);
	roadStrip(5, 14, 10, 64.5);
	roadStrip(5, 12, 10, 131);
	roadStrip(5, 92, 10, -92);

	/* --------------------------------------------- the nested enclosures --- */
	/* three concentric stone railings (vedikā): around the tree, around the
	   temple terrace, and around the courtyard — all to one design */
	const W = { x0: -78, x1: 82, z0: -46, z1: 58 }; // the courtyard railing
	const R = { x0: -18, x1: 34, z0: -20, z1: 20 }; // the terrace railing
	const T = { x0: -12.5, x1: -4.5, z0: -7, z1: 7 }; // the tree railing (open east, to the throne), drawn close about the trunk
	{
		const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, 3.3, 0.24), railMat, 420);
		let pi = 0;
		const railYs = [0.95, 1.75, 2.55];
		function railSide(
			axis: 'x' | 'z',
			fixed: number,
			from: number,
			to: number,
			gapAt: number | null,
			gapW = 4
		) {
			const segs: [number, number][] =
				gapAt === null
					? [[from, to]]
					: [
							[from, gapAt - gapW / 2],
							[gapAt + gapW / 2, to]
						];
			for (const [a, b] of segs) {
				const len = b - a;
				if (len <= 0) continue;
				const n = Math.max(2, Math.round(len / 1.9));
				for (let k = 0; k <= n; k++) {
					const t = a + (k / n) * len;
					dummy.rotation.set(0, axis === 'x' ? 0 : Math.PI / 2, 0);
					dummy.scale.setScalar(1);
					dummy.position.set(axis === 'x' ? t : fixed, 1.65, axis === 'x' ? fixed : t);
					dummy.updateMatrix();
					posts.setMatrixAt(pi++, dummy.matrix);
				}
				for (const y of railYs) {
					if (axis === 'x') addBox(scene, len, 0.3, 0.14, (a + b) / 2, y, fixed, railMat).castShadow = false;
					else addBox(scene, 0.14, 0.3, len, fixed, y, (a + b) / 2, railMat).castShadow = false;
				}
				if (axis === 'x') addBox(scene, len + 0.5, 0.45, 0.5, (a + b) / 2, 3.4, fixed, railMat);
				else addBox(scene, 0.5, 0.45, len + 0.5, fixed, 3.4, (a + b) / 2, railMat);
			}
		}
		function vedika(rect: { x0: number; x1: number; z0: number; z1: number }, gates: {
			e?: number;
			n?: number;
			s?: number;
			gapW?: number;
		}) {
			const gw = gates.gapW ?? 4;
			railSide('x', rect.z0, rect.x0, rect.x1, gates.n ?? null, gw);
			railSide('x', rect.z1, rect.x0, rect.x1, gates.s ?? null, gw);
			railSide('z', rect.x1, rect.z0, rect.z1, gates.e ?? null, gw);
			railSide('z', rect.x0, rect.z0, rect.z1, null);
		}
		// the tree railing: three sides only, open east toward throne and temple
		railSide('x', T.z0, T.x0, T.x1, null);
		railSide('x', T.z1, T.x0, T.x1, null);
		railSide('z', T.x0, T.z0, T.z1, null);
		vedika(R, { e: 0, n: 8, s: 8 });
		vedika(W, { e: 0, n: 10, s: 10, gapW: 6 });
		posts.count = pi;
		posts.castShadow = true;
		scene.add(posts);
	}

	/* the outermost brick wall — "built high and strong out of brick … long
	   from east to west and narrow from south to north" — drawn wide, taking
	   in the courtyard and the flower pool; gates east (main), south, north;
	   no west gate. A plain breach in the south-east lets the road out toward
	   Urel and the austerities sites. */
	const OUTER = { x0: -100, x1: 114, z0: -70, z1: 138 };
	{
		const wallH = 6;
		const wallT = 2.2;
		function wallRun(
			axis: 'x' | 'z',
			fixed: number,
			from: number,
			to: number,
			gaps: [number, number][]
		) {
			const segs: [number, number][] = [];
			let cur = from;
			for (const [g, gw] of gaps.sort((p, q) => p[0] - q[0])) {
				segs.push([cur, g - gw / 2]);
				cur = g + gw / 2;
			}
			segs.push([cur, to]);
			for (const [a, b] of segs) {
				const len = b - a;
				if (len <= 0) continue;
				if (axis === 'x') addBox(scene, len, wallH, wallT, (a + b) / 2, wallH / 2, fixed, brick);
				else addBox(scene, wallT, wallH, len, fixed, wallH / 2, (a + b) / 2, brick);
			}
		}
		wallRun('x', OUTER.z0, OUTER.x0, OUTER.x1, [[10, 9]]); // north gate
		wallRun('x', OUTER.z1, OUTER.x0, OUTER.x1, [[10, 9]]); // south gate
		wallRun('z', OUTER.x1, OUTER.z0, OUTER.z1, [
			[0, 10], // the MAIN gate, toward the river
			[110, 8] // the south-east breach
		]);
		wallRun('z', OUTER.x0, OUTER.z0, OUTER.z1, []); // west — no gate
		// toraṇa gateways in the Aśoka-gate style: a slim pillar either side of
		// the opening carrying three stacked architraves
		function gatehouse(x: number, z: number, axis: 'x' | 'z', main: boolean) {
			const h = main ? 10 : 8.5;
			const off = (main ? 10 : 9) / 2 + 1.3;
			const beamBase = h + 0.35;
			const beamStep = 1.5;
			// the pillars rise from the ground past the top architrave, so the
			// three beams cross them rather than floating above short posts
			const pillarH = beamBase + 2 * beamStep + 0.6;
			for (const side of [-1, 1]) {
				const pil = new THREE.Mesh(new THREE.BoxGeometry(2.5, pillarH, 2.5), brick);
				if (axis === 'x') pil.position.set(x + side * off, pillarH / 2, z);
				else pil.position.set(x, pillarH / 2, z + side * off);
				pil.castShadow = true;
				scene.add(pil);
			}
			[1.1, 0.95, 0.8].forEach((s, i) => {
				const len = off * 2 + 4 * s;
				const ly = beamBase + i * beamStep;
				if (axis === 'x') addBox(scene, len, 0.7, 2.7, x, ly, z, brick);
				else addBox(scene, 2.7, 0.7, len, x, ly, z, brick);
			});
		}
		gatehouse(OUTER.x1, 0, 'z', true); // east — "the main gate opens east toward the Nairañjanā"
		gatehouse(10, OUTER.z1, 'x', false);
		gatehouse(10, OUTER.z0, 'x', false);
	}

	/* -------------------------------------------- the Great Temple (§4) --- */
	const TX = 10;
	const TOTAL_H = 52;
	const BASE_W = 26;
	const BASE_H = 9;

	// everything belonging to the temple fades translucent at the sanctum and
	// tree stations, so the image against the back wall can be seen
	const fadeMats: THREE.MeshLambertMaterial[] = [];
	const fadePale = new THREE.Color(0xdcd2b8);
	function fadeable(m: THREE.Material): THREE.MeshLambertMaterial {
		const c = m.clone() as THREE.MeshLambertMaterial;
		c.userData.c0 = c.color.clone();
		fadeMats.push(c);
		return c;
	}

	function buildKalasha(x: number, y: number, z: number, s: number): THREE.Group {
		const g = new THREE.Group();
		const profile: THREE.Vector2[] = [
			new THREE.Vector2(0.02, 0),
			new THREE.Vector2(0.62, 0.12),
			new THREE.Vector2(0.8, 0.55),
			new THREE.Vector2(0.55, 1.05),
			new THREE.Vector2(0.3, 1.3)
		].map((v) => new THREE.Vector2(v.x * s, v.y * s));
		const pot = new THREE.Mesh(new THREE.LatheGeometry(profile, 14), goldM);
		pot.position.set(x, y, z);
		pot.castShadow = true;
		g.add(pot);
		const rads = [0.52, 0.4, 0.28];
		rads.forEach((r, i) => {
			const disc = new THREE.Mesh(new THREE.CylinderGeometry(r * s, r * s, 0.09 * s, 12), goldM);
			disc.position.set(x, y + (1.5 + i * 0.34) * s, z);
			disc.castShadow = true;
			g.add(disc);
		});
		const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1 * s, 0.7 * s, 8), goldM);
		tip.position.set(x, y + 2.75 * s, z);
		g.add(tip);
		return g;
	}

	// niches and the gilded images within them
	interface NicheSlot {
		x: number;
		y: number;
		z: number;
		yaw: number; // statue faces outward
		s: number; // niche scale
	}
	const nicheMats: THREE.Matrix4[] = [];
	const nicheSlots: NicheSlot[] = [];
	function pushNiche(x: number, y: number, z: number, ry: number, yaw: number, s: number) {
		dummy.rotation.set(0, ry, 0);
		dummy.scale.setScalar(s);
		dummy.position.set(x, y, z);
		dummy.updateMatrix();
		nicheMats.push(dummy.matrix.clone());
		nicheSlots.push({ x, y, z, yaw, s });
	}

	/** A curved śikhara tower of stacked stone courses, with tiers of niches. */
	function buildShikhara(
		x: number,
		z: number,
		w0: number,
		towerH: number,
		y0: number,
		withNiches: boolean
	): THREE.Group {
		const g = new THREE.Group();
		const courses = Math.max(6, Math.round(towerH / 3.8));
		for (let i = 0; i < courses; i++) {
			const t = i / courses;
			const w = w0 * (1 - 0.78 * Math.pow(t, 1.35));
			const h = towerH / courses;
			const y = y0 + i * h;
			addBox(g, w, h - 0.4, w, x, y + (h - 0.4) / 2, z, temple);
			addBox(g, w + 0.5, 0.4, w + 0.5, x, y + h - 0.2, z, templeDark).castShadow = false;
			if (withNiches && i < courses - 1) {
				const n = Math.max(2, Math.round(w / 3));
				const s = Math.min(1.15, Math.max(0.55, w / 8));
				for (let k = 0; k < n; k++) {
					const u = ((k + 0.5) / n - 0.5) * (w - 1.6);
					pushNiche(x + u, y + h / 2, z - w / 2 - 0.05, 0, Math.PI, s);
					pushNiche(x + u, y + h / 2, z + w / 2 + 0.05, 0, 0, s);
					pushNiche(x - w / 2 - 0.05, y + h / 2, z + u, Math.PI / 2, -Math.PI / 2, s);
					pushNiche(x + w / 2 + 0.05, y + h / 2, z + u, Math.PI / 2, Math.PI / 2, s);
				}
			}
		}
		return g;
	}

	const templeGroup = new THREE.Group();
	{
		const tg = templeGroup;
		// two-tier base ("built on a base whose front side is more than twenty paces wide")
		addBox(tg, BASE_W + 2, 2, BASE_W + 2, TX, 1, 0, temple);
		addBox(tg, BASE_W, BASE_H - 2, BASE_W, TX, 2 + (BASE_H - 2) / 2, 0, temple);
		for (const y of [3.4, 5.6, 7.8]) {
			addBox(tg, BASE_W + 0.6, 0.45, BASE_W + 0.6, TX, y, 0, templeDark).castShadow = false;
		}
		// niche rows on the base
		for (const y of [3.2, 6.2]) {
			const n = 7;
			for (let k = 0; k < n; k++) {
				const u = ((k + 0.5) / n - 0.5) * (BASE_W - 3);
				pushNiche(TX + u, y, -BASE_W / 2 - 0.06, 0, Math.PI, 1.25);
				pushNiche(TX + u, y, BASE_W / 2 + 0.06, 0, 0, 1.25);
				pushNiche(TX - BASE_W / 2 - 0.06, y, u, Math.PI / 2, -Math.PI / 2, 1.25);
			}
		}
		// the central tower and its pot finial
		tg.add(buildShikhara(TX, 0, 15, TOTAL_H - BASE_H - 4, BASE_H, true));
		tg.add(buildKalasha(TX, TOTAL_H - 4, 0, 2.6));
		// four corner śikharas standing on the base, as in the temple today
		const off = BASE_W / 2 - 3.2;
		for (const [dx, dz] of [
			[-off, -off],
			[off, -off],
			[-off, off],
			[off, off]
		]) {
			addBox(tg, 6.4, 2.2, 6.4, TX + dx, BASE_H + 1.1, dz, temple);
			tg.add(buildShikhara(TX + dx, dz, 5.6, 12, BASE_H + 2.2, true));
			tg.add(buildKalasha(TX + dx, BASE_H + 14.4, dz, 0.9));
		}

		// east portico — "a storied pavilion at the east, the eaves of which
		// are in three layers" — an open hall before the door of the chamber
		const PX = TX + BASE_W / 2; // 23
		// an open-fronted dark recess so a gateway reads as a passage you could
		// step into, not a flat panel on the wall
		const doorVoidM = mat(0x15120d);
		const hollowDoorway = (
			frontX: number,
			backX: number,
			z: number,
			halfW: number,
			y0: number,
			y1: number
		) => {
			const yc = (y0 + y1) / 2;
			const hh = y1 - y0;
			const dep = frontX - backX;
			const xc = (frontX + backX) / 2;
			addBox(tg, 0.3, hh, 2 * halfW, backX, yc, z, doorVoidM).castShadow = false; // back
			addBox(tg, dep, 0.3, 2 * halfW, xc, y0, z, doorVoidM).castShadow = false; // threshold
			addBox(tg, dep, 0.3, 2 * halfW, xc, y1, z, doorVoidM).castShadow = false; // soffit
			addBox(tg, dep, hh, 0.3, xc, yc, z - halfW, doorVoidM).castShadow = false; // jamb
			addBox(tg, dep, hh, 0.3, xc, yc, z + halfW, doorVoidM).castShadow = false; // jamb
		};
		addBox(tg, 8, 7, 1.6, PX + 4, 3.5, 5.2, temple); // south wall
		addBox(tg, 8, 7, 1.6, PX + 4, 3.5, -5.2, temple); // north wall
		addBox(tg, 9, 0.8, 12, PX + 4, 7.2, 0, temple); // roof
		// over the porch, a lesser gateway projecting from the śikhara face —
		// kept low over the porch: a recessed doorway with two columns and a
		// rounded arch, crowned by an arched (chaitya-gable) roof, not a flat eave
		addBox(tg, 8, 7.5, 8, PX - 2, 10.0, 0, temple); // the projecting mass
		hollowDoorway(PX + 2, PX - 1.5, 0, 1.35, 7.3, 11.4); // the recessed doorway
		for (const pz of [-1.8, 1.8]) {
			const col = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.4, 3.9, 10), granite);
			col.position.set(PX + 2.5, 9.25, pz);
			col.castShadow = true;
			tg.add(col);
			addBox(tg, 0.95, 0.5, 0.95, PX + 2.5, 7.4, pz, granite); // base
			addBox(tg, 1.05, 0.5, 1.05, PX + 2.5, 11.35, pz, granite); // capital
		}
		const upperArch = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.34, 8, 22, Math.PI), granite);
		upperArch.rotation.y = Math.PI / 2;
		upperArch.position.set(PX + 2.5, 11.4, 0);
		upperArch.castShadow = true;
		tg.add(upperArch);
		// an arched gable crowning the bay instead of a flat eave
		const gableShape = new THREE.Shape();
		gableShape.moveTo(-3.7, 0);
		for (let k = 0; k <= 16; k++) {
			const a = Math.PI - (Math.PI * k) / 16;
			gableShape.lineTo(Math.cos(a) * 3.8, Math.sin(a) * 2.7);
		}
		gableShape.closePath();
		const gable = new THREE.Mesh(
			new THREE.ExtrudeGeometry(gableShape, { depth: 2, bevelEnabled: false }),
			temple
		);
		gable.rotation.y = Math.PI / 2;
		gable.position.set(PX + 0, 13.75, 0);
		gable.castShadow = true;
		tg.add(gable);
		// four tall front pillars (Cunningham)
		for (const pz of [-4.4, -1.6, 1.6, 4.4]) {
			const pil = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 6.4, 10), granite);
			pil.position.set(PX + 8.3, 3.2, pz);
			pil.castShadow = true;
			tg.add(pil);
		}
		addBox(tg, 3, 0.8, 12.6, PX + 8.3, 6.9, 0, temple);
		// the doorway into the chamber
		addBox(tg, 3, 6.4, 1.6, PX + 1.5, 3.2, -3.2, templeDark); // north cheek
		addBox(tg, 3, 6.4, 1.6, PX + 1.5, 3.2, 3.2, templeDark); // south cheek
		addBox(tg, 3, 1.3, 8, PX + 1.5, 6.55, 0, templeDark); // lintel
		addBox(tg, 8.6, 0.3, 10.4, PX + 4.3, 0.15, 0, mat(0x4c463d)); // dark floor
		hollowDoorway(PX + 3, PX + 0.1, 0, 2.4, 0.4, 5.9); // the door into the chamber, opened up
		// swap every temple material for a fade-tracked clone
		tg.traverse((o) => {
			const m = o as THREE.Mesh;
			if (m.isMesh && m.material) m.material = fadeable(m.material as THREE.Material);
		});
		scene.add(tg);
	}

	// cull the tower niches hidden inside the upper gateway block
	for (let i = nicheSlots.length - 1; i >= 0; i--) {
		const s = nicheSlots[i];
		if (s.x > 16 && Math.abs(s.z) < 5 && s.y > 7 && s.y < 18) {
			nicheSlots.splice(i, 1);
			nicheMats.splice(i, 1);
		}
	}

	/* the ghost drawn while the temple is faded: the real temple is kept, only
	   made faintly translucent, and its true silhouette is redrawn in edge-lines
	   (the Nālandā ghost language) traced from the actual geometry — so the
	   chamber and the tree show through the building itself, not a blocky proxy.
	   Only the niche insets and gilded images are hidden, to keep it clean. */
	const hideOnFade: THREE.Object3D[] = [];
	const templeEdgeMat = new THREE.LineBasicMaterial({
		color: 0x8d8474,
		transparent: true,
		opacity: 0
	});
	const templeEdges = new THREE.Group();
	templeGroup.traverse((o) => {
		const m = o as THREE.Mesh;
		if (!m.isMesh || !m.geometry) return;
		const e = new THREE.LineSegments(
			new THREE.EdgesGeometry(m.geometry as THREE.BufferGeometry, 24),
			templeEdgeMat
		);
		e.position.copy(m.position);
		e.quaternion.copy(m.quaternion);
		e.scale.copy(m.scale);
		templeEdges.add(e);
	});
	templeEdges.visible = false;
	scene.add(templeEdges);

	// bake the niche instancing (niches 1.15× so the images read)
	let goldPlaceholders: THREE.InstancedMesh | null = null;
	{
		// a traditional Buddhist niche: a rectangular recess with a rounded
		// (arched) head — same 1.32 × 1.72 footprint as the old box so the
		// instanced placement is unchanged
		const nicheW = 1.32,
			nicheH = 1.72,
			nicheD = 0.25,
			nr = nicheW / 2,
			nicheBodyTop = nicheH / 2 - nr;
		const nicheShape = new THREE.Shape();
		nicheShape.moveTo(-nr, -nicheH / 2);
		nicheShape.lineTo(-nr, nicheBodyTop);
		for (let k = 1; k <= 14; k++) {
			const ang = Math.PI - (Math.PI * k) / 14;
			nicheShape.lineTo(Math.cos(ang) * nr, nicheBodyTop + Math.sin(ang) * nr);
		}
		nicheShape.lineTo(nr, -nicheH / 2);
		nicheShape.closePath();
		const nicheGeo = new THREE.ExtrudeGeometry(nicheShape, {
			depth: nicheD,
			bevelEnabled: false
		});
		nicheGeo.translate(0, 0, -nicheD / 2);
		const nicheIM = new THREE.InstancedMesh(nicheGeo, fadeable(templeDark), nicheMats.length);
		nicheMats.forEach((m, i) => nicheIM.setMatrixAt(i, m));
		nicheIM.castShadow = false;
		scene.add(nicheIM);
		hideOnFade.push(nicheIM);
		// simple gilded figures until (or unless) the scans arrive
		const golds = new THREE.InstancedMesh(
			new THREE.CapsuleGeometry(0.28, 0.7, 3, 6),
			fadeable(goldM),
			nicheMats.length
		);
		nicheMats.forEach((m, i) => golds.setMatrixAt(i, m));
		goldPlaceholders = golds;
		scene.add(golds);
		hideOnFade.push(golds);
	}

	// scanned statues instanced into the niches — "in all the niches arranged
	// in tiers there are golden images"
	function loadNicheStatues(url: string, slots: NicheSlot[], frontYaw: number) {
		import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
			if (disposed) return;
			new GLTFLoader().load(url, (gltf) => {
				if (disposed) return;
				let geo: THREE.BufferGeometry | null = null;
				gltf.scene.traverse((o) => {
					const m = o as THREE.Mesh;
					if (m.isMesh && !geo) geo = m.geometry;
				});
				if (!geo) return;
				const g = (geo as THREE.BufferGeometry).clone();
				g.computeBoundingBox();
				const bb = g.boundingBox!;
				const size = bb.getSize(new THREE.Vector3());
				const centre = bb.getCenter(new THREE.Vector3());
				// normalise: unit height, base at y0, centred in x/z
				g.translate(-centre.x, -bb.min.y, -centre.z);
				g.scale(1 / size.y, 1 / size.y, 1 / size.y);
				const im = new THREE.InstancedMesh(g, fadeable(goldM), slots.length);
				slots.forEach((slot, i) => {
					// the statue stands ~70% of the niche height (1.72 · s), set
					// proud of the shallow niche so it can be seen
					const h = 1.2 * slot.s;
					dummy.rotation.set(0, slot.yaw + frontYaw, 0);
					dummy.scale.setScalar(h);
					dummy.position.set(
						slot.x + Math.sin(slot.yaw) * 0.24 * slot.s,
						slot.y - 0.86 * slot.s,
						slot.z + Math.cos(slot.yaw) * 0.24 * slot.s
					);
					dummy.updateMatrix();
					im.setMatrixAt(i, dummy.matrix);
				});
				scene.add(im);
				hideOnFade.push(im);
				if (goldPlaceholders) {
					scene.remove(goldPlaceholders);
					const gi = hideOnFade.indexOf(goldPlaceholders);
					if (gi >= 0) hideOnFade.splice(gi, 1);
					goldPlaceholders = null;
				}
			});
		});
	}
	if (models.nicheA && models.nicheB) {
		const a: NicheSlot[] = [];
		const b: NicheSlot[] = [];
		nicheSlots.forEach((s, i) => (i % 2 ? a : b).push(s));
		loadNicheStatues(models.nicheA, a, 0);
		loadNicheStatues(models.nicheB, b, 0);
	}

	/* the image within: on its pedestal against the BACK (west) wall, only
	   that wall between it and the tree — facing east down the chamber */
	const SANCT = { x: -0.5, y: 0.3, z: 0 };
	addBox(scene, 2, 1.3, 3.8, SANCT.x, SANCT.y + 0.65, SANCT.z, stone); // "pedestal four feet two inches high"
	// "because it is in a deep inner chamber lamps and torches burn continually"
	const lamp = new THREE.PointLight(0xffd9a0, 60, 30, 1.6);
	lamp.position.set(SANCT.x + 4, 4, 0);
	scene.add(lamp);
	const gildM = mat(C.gold, { emissive: 0x8a6a20, emissiveIntensity: 0.55 });
	const sanctumFallback = new THREE.Group();
	{
		const body = new THREE.Mesh(new THREE.CapsuleGeometry(1, 1.5, 4, 10), gildM);
		body.position.set(SANCT.x, SANCT.y + 2.4, SANCT.z);
		sanctumFallback.add(body);
		const head = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), gildM);
		head.position.set(SANCT.x, SANCT.y + 4.1, SANCT.z);
		sanctumFallback.add(head);
		scene.add(sanctumFallback);
	}
	/** Load a scanned statue, normalise its size/footing, face it east, and
	 *  swap out the simple placeholder figure. */
	function loadStatue(
		url: string,
		opts: {
			height: number;
			x: number;
			floorY: number;
			z: number;
			material: THREE.Material;
			placeholder: THREE.Group;
			yaw?: number;
		}
	) {
		import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
			if (disposed) return;
			new GLTFLoader().load(url, (gltf) => {
				if (disposed) return;
				const model = gltf.scene;
				model.traverse((o) => {
					const m = o as THREE.Mesh;
					if (m.isMesh) {
						m.material = opts.material;
						m.castShadow = true;
					}
				});
				model.rotation.y = opts.yaw ?? -Math.PI / 2; // scan front −z → +x (east)
				const box = new THREE.Box3().setFromObject(model);
				const size = box.getSize(new THREE.Vector3());
				const s = opts.height / size.y;
				model.scale.setScalar(s);
				box.setFromObject(model);
				const centre = box.getCenter(new THREE.Vector3());
				model.position.x += opts.x - centre.x;
				model.position.z += opts.z - centre.z;
				model.position.y += opts.floorY - box.min.y;
				scene.add(model);
				scene.remove(opts.placeholder);
				renderer.shadowMap.needsUpdate = true;
			});
		});
	}
	if (models.sitting) {
		// "the image was eleven feet five inches tall", on its pedestal
		loadStatue(models.sitting, {
			height: 3.5,
			x: SANCT.x,
			floorY: SANCT.y + 1.3,
			z: SANCT.z,
			material: gildM,
			placeholder: sanctumFallback
		});
	}

	/* the two bodhisattvas flanking the temple door — Avalokiteśvara (north)
	   and Maitreya (south), "cast in silver and more than ten feet in height" */
	const silverM = mat(C.silver, { emissive: 0x666a70, emissiveIntensity: 0.25 });
	const doorX = TX + BASE_W / 2 + 7.6; // just outside the portico door
	const silverFallback = new THREE.Group();
	for (const pz of [-4.9, 4.9]) {
		const fig = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 2.3, 4, 10), silverM);
		fig.position.set(doorX, 1.9, pz);
		fig.castShadow = true;
		silverFallback.add(fig);
		const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 10, 8), silverM);
		head.position.set(doorX, 3.5, pz);
		silverFallback.add(head);
	}
	scene.add(silverFallback);
	if (models.bodhisattva) {
		import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
			if (disposed) return;
			new GLTFLoader().load(models.bodhisattva!, (gltf) => {
				if (disposed) return;
				const base = gltf.scene;
				base.traverse((o) => {
					const m = o as THREE.Mesh;
					if (m.isMesh) m.material = silverM;
				});
				base.rotation.y = 0; // face east, toward the approach
				const box = new THREE.Box3().setFromObject(base);
				const size = box.getSize(new THREE.Vector3());
				base.scale.setScalar(3.4 / size.y);
				for (const pz of [-4.9, 4.9]) {
					const fig = base.clone();
					fig.traverse((o) => {
						const m = o as THREE.Mesh;
						if (m.isMesh) m.castShadow = true;
					});
					const b = new THREE.Box3().setFromObject(fig);
					const c = b.getCenter(new THREE.Vector3());
					fig.position.x += doorX - c.x;
					fig.position.z += pz - c.z;
					fig.position.y += 0.3 - b.min.y;
					scene.add(fig);
				}
				scene.remove(silverFallback);
				renderer.shadowMap.needsUpdate = true;
			});
		});
	}

	/* --------------------------- the diamond seat and the bodhi tree (§4a) --- */
	// the throne between tree and temple, half-lost in the sand Xuanzang
	// describes; the tree railing (Aśoka's vedikā) rings them
	const sandPatch = new THREE.Mesh(new THREE.CircleGeometry(4.2, 20), mat(0xe6d8b0));
	sandPatch.rotation.x = -Math.PI / 2;
	sandPatch.position.set(-6, 0.18, 0);
	scene.add(sandPatch);
	addBox(scene, 1.6, 0.9, 2.6, -5.6, 0.45, 0, stone); // the stone platform
	const throne = new THREE.Mesh(
		new THREE.BoxGeometry(1.5, 0.28, 2.5),
		mat(0x8d8f92, { emissive: 0x23252a, emissiveIntensity: 0.35 })
	);
	throne.position.set(-5.6, 1.04, 0);
	throne.castShadow = throne.receiveShadow = true;
	scene.add(throne);

	// the tree: "the trunk of the tree is yellowish-white in colour and its
	// branches and leaves are always green"
	{
		const barkM = mat(0xcfc2a5);
		const leafA = mat(C.leaf);
		const leafB = mat(C.leafDark);
		const tree = new THREE.Group();
		const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.4, 8, 10), barkM);
		trunk.position.set(-8, 4, 0);
		trunk.castShadow = true;
		tree.add(trunk);
		const boughs: [number, number, number, number, number][] = [
			[-11, 8.5, -2.5, 0.5, -0.5],
			[-5.5, 9, 2.5, 0.5, 0.6],
			[-9, 10, 3, -0.4, 0.3],
			[-6, 10.5, -3, 0.4, -0.4]
		];
		for (const [bx, by, bz, rx, rz] of boughs) {
			const b = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.45, 5.5, 8), barkM);
			b.position.set(bx, by, bz);
			b.rotation.set(rx, 0, rz);
			b.castShadow = true;
			tree.add(b);
		}
		const blobs: [number, number, number, number, number][] = [
			[-8, 14, 0, 7.2, 0],
			[-13, 12.5, -4, 4.6, 1],
			[-3.5, 13, 4.5, 4.4, 0],
			[-12, 13, 5, 4.2, 1],
			[-4, 12.5, -5, 4.4, 1],
			[-8, 17.5, 0, 4.8, 0],
			[-13.5, 15, 1.5, 3.8, 0],
			[-2.5, 15, -1.5, 3.6, 1]
		];
		for (const [bx, by, bz, r, alt] of blobs) {
			const s = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), alt ? leafB : leafA);
			s.position.set(bx, by, bz);
			s.castShadow = true;
			tree.add(s);
		}
		scene.add(tree);
		// the scanned bodhi tree replaces the procedural one once loaded —
		// larger, and set lower so its roots sit in the ground, not above it
		if (models.bodhiTree)
			loadTreeModel(models.bodhiTree, { x: -9, z: 0, height: 50, sink: 7, yaw: 5, placeholder: tree });
	}

	/* ------------------------------------------------ Buddha's Walk (§5) --- */
	{
		addBox(scene, 16, 1.0, 1.6, 6, 0.5, -16, temple);
		addBox(scene, 16.6, 0.2, 2.0, 6, 1.05, -16, stone).castShadow = false;
		const lotus = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22, 0.28, 0.1, 8), goldM, 18);
		for (let k = 0; k < 18; k++) {
			dummy.rotation.set(0, 0, 0);
			dummy.scale.setScalar(1);
			dummy.position.set(6 - 7.2 + (k / 17) * 14.4, 1.2, -16 + (k % 2 ? 0.3 : -0.3));
			dummy.updateMatrix();
			lotus.setMatrixAt(k, dummy.matrix);
		}
		scene.add(lotus);
	}

	/* small shrine helper: square cell, pyramid cap, gold image facing east */
	function buildShrine(
		x: number,
		z: number,
		s: number,
		h: number,
		material: THREE.Material,
		withImage = true
	): THREE.Group {
		const g = new THREE.Group();
		addBox(g, s + 1.6, 0.9, s + 1.6, x, 0.45, z, material);
		addBox(g, s, h, s, x, 0.9 + h / 2, z, material);
		addBox(g, 1.4, 2, 0.4, x + s / 2, 1.9, z, templeDark); // east door
		const cap = new THREE.Mesh(new THREE.ConeGeometry(s * 0.72, h * 0.55, 4), templeDark);
		cap.rotation.y = Math.PI / 4;
		cap.position.set(x, 0.9 + h + h * 0.27, z);
		cap.castShadow = true;
		g.add(cap);
		if (withImage) {
			const fig = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 0.8, 3, 8), goldM);
			fig.position.set(x + s / 2 + 0.4, 1.1, z);
			g.add(fig);
		}
		return g;
	}

	/** Elongated stupa: stepped base always wider than the bell, a tall bell
	 *  body with a rounded shoulder, harmikā and tapering spire. */
	function buildStupa(
		x: number,
		z: number,
		height: number,
		baseM: THREE.Material,
		bellM: THREE.Material = plasterM,
		baseScale = 1,
		stonePlinth?: boolean
	): THREE.Group {
		const g = new THREE.Group();
		const R = height * 0.3;
		const bR = R * Math.min(1, baseScale * 1.09); // the bell never overhangs the base
		// three stepped base tiers, each wider than the bell
		const tiers: [number, number][] = [
			[1.85 * baseScale, 1.7 * baseScale],
			[1.6 * baseScale, 1.45 * baseScale],
			[1.35 * baseScale, 1.2 * baseScale]
		];
		let y = 0;
		// the medium and big stupas stand on a grey stone plinth under the brick
		if (stonePlinth ?? height >= 4.5) {
			const p = new THREE.Mesh(
				new THREE.CylinderGeometry(1.95 * baseScale * R, 2.1 * baseScale * R, height * 0.055, 18),
				greyStone
			);
			p.position.set(x, height * 0.0275, z);
			p.castShadow = p.receiveShadow = true;
			g.add(p);
			y += height * 0.055;
		}
		for (const [rb, rt] of tiers) {
			const t = new THREE.Mesh(
				new THREE.CylinderGeometry(rt * R, rb * R, height * 0.09, 18),
				baseM
			);
			t.position.set(x, y + height * 0.045, z);
			t.castShadow = t.receiveShadow = true;
			g.add(t);
			y += height * 0.09;
		}
		// the bell: a tall body with a rounded shoulder
		const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.95 * bR, 1.1 * bR, height * 0.34, 18), bellM);
		bell.position.set(x, y + height * 0.17, z);
		bell.castShadow = true;
		g.add(bell);
		const shoulder = new THREE.Mesh(
			new THREE.SphereGeometry(0.95 * bR, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2),
			bellM
		);
		shoulder.position.set(x, y + height * 0.34, z);
		shoulder.castShadow = true;
		g.add(shoulder);
		const domeTop = y + height * 0.34 + 0.95 * bR;
		// harmikā and spire
		addBox(g, 0.62 * bR, height * 0.05, 0.62 * bR, x, domeTop + height * 0.01, z, stone);
		const spire = new THREE.Mesh(
			new THREE.ConeGeometry(0.26 * bR, height * 0.3, 10),
			mat(C.gold, { emissive: C.gold, emissiveIntensity: 0.2 })
		);
		spire.position.set(x, domeTop + height * 0.17, z);
		spire.castShadow = true;
		g.add(spire);
		return g;
	}

	/* ------------------------------------ the courtyard monuments (§6) --- */
	// Animeṣalocana, the gazing shrine — "on a huge rock", north of the Walk
	// and towards the east, on its mound, with an east-facing porch as today
	{
		const AX = 58;
		const AZ = -28;
		const mound = new THREE.Mesh(new THREE.SphereGeometry(11, 16, 10), mat(C.ground));
		mound.scale.y = 0.42;
		mound.position.set(AX, -0.6, AZ);
		mound.castShadow = mound.receiveShadow = true;
		scene.add(mound);
		addBox(scene, 7.5, 2.2, 7.5, AX, 4.8, AZ, temple); // the wide base
		scene.add(buildShikhara(AX, AZ, 6, 10, 5.9, false));
		scene.add(buildKalasha(AX, 16.2, AZ, 0.7));
		// the porch, opening east
		addBox(scene, 3.4, 3.2, 4.6, AX + 4.7, 5.4, AZ, temple);
		addBox(scene, 0.3, 2.2, 1.6, AX + 6.35, 5.0, AZ, templeDark);
		addBox(scene, 4.2, 0.6, 5.4, AX + 4.7, 7.3, AZ, templeDark).castShadow = false;
		const gaze = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 0.9, 3, 8), goldM);
		gaze.position.set(AX + 4.5, 5.6, AZ);
		scene.add(gaze);
	}
	// Yun-shu's stupa of the ten thousand Buddhas, 30 paces north of the tree
	scene.add(buildStupa(-6, -25, 3.2, mat(0xa8a093)));
	// the stupa north of the temple, between it and the courtyard railing,
	// with the small temple beside it to the east (the schematic)
	scene.add(buildStupa(10, -33, 7, templeDark));
	scene.add(buildShrine(21, -33, 3.6, 4.2, temple));
	// the Ratnagṛha — the jewel house, "not far to the west", brass image facing east
	{
		const g = new THREE.Group();
		addBox(g, 10, 1.5, 10, -66, 0.75, -2, temple);
		addBox(g, 1.4, 6, 8, -69.5, 4.5, -2, temple);
		addBox(g, 6, 6, 1.4, -66.6, 4.5, -5.7, temple);
		addBox(g, 6, 6, 1.4, -66.6, 4.5, 1.7, temple);
		addBox(g, 9, 1, 9.4, -66, 8, -2, stone);
		const fin = new THREE.Mesh(new THREE.ConeGeometry(2, 3, 4), stone);
		fin.rotation.y = Math.PI / 4;
		fin.position.set(-66, 10, -2);
		fin.castShadow = true;
		g.add(fin);
		const brassM = mat(C.bronze, { emissive: 0x33240e, emissiveIntensity: 0.5 });
		const brassFallback = new THREE.Group();
		const fig = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 2.6, 4, 10), brassM);
		fig.position.set(-66, 3.6, -2);
		fig.castShadow = true;
		brassFallback.add(fig);
		const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), brassM);
		head.position.set(-66, 5.6, -2);
		brassFallback.add(head);
		scene.add(brassFallback);
		if (models.standing) {
			// the brass image "in the standing posture, facing east, adorned with rare jewels"
			loadStatue(models.standing, {
				height: 4.6,
				x: -66,
				floorY: 1.5,
				z: -2,
				material: brassM,
				placeholder: brassFallback,
				yaw: Math.PI / 2 // this scan fronts +z
			});
		}
		// the blue stone "with wonderful veins of various hues" before it
		addBox(g, 2, 0.3, 2, -62.5, 0.35, -2, mat(C.blueStone));
		scene.add(g);
	}
	// a medium stupa between the Ratnagṛha and the Great Temple
	scene.add(buildStupa(-30, 2, 8, templeDark));
	// Aśoka's stupa of the grass-cutter, "more than one hundred feet high", to
	// the south — clear space around it on every side
	{
		addBox(scene, 22, 1.2, 22, -4, 0.6, 36, greyStone); // the stone plinth
		addBox(scene, 18, 1.6, 18, -4, 2, 36, templeDark);
		addBox(scene, 15, 1.5, 15, -4, 3.55, 36, templeDark);
		const st = buildStupa(-4, 36, 18, templeDark, plasterM, 0.76, false);
		st.position.y = 4.3;
		scene.add(st);
	}
	// the bluebirds-and-deer omen stupa, north-east of the grass spot
	scene.add(buildStupa(16, 27, 3.6, templeDark));
	// Māra's temptation — two stupas either side of the main road, east
	scene.add(buildStupa(54, -6.5, 5.5, templeDark));
	scene.add(buildStupa(54, 6.5, 5.5, templeDark));
	// the Tārā shrine and its companions — three joined cells in a row,
	// before the temple entrance, doors to the north
	{
		addBox(scene, 16, 0.9, 6.6, 46, 0.45, 13.5, temple); // shared platform
		for (const [cx, tall] of [
			[41.2, 0],
			[46, 1],
			[50.8, 0]
		]) {
			const h = tall ? 5.4 : 4.8;
			addBox(scene, 4.8, h, 4.8, cx as number, 0.9 + h / 2, 13.5, temple);
			addBox(scene, 1.3, 2.1, 0.4, cx as number, 2, 11, templeDark); // north door
			const cap = new THREE.Mesh(new THREE.ConeGeometry(3.3, h * 0.55, 4), templeDark);
			cap.rotation.y = Math.PI / 4;
			cap.position.set(cx as number, 0.9 + h + h * 0.27, 13.5);
			cap.castShadow = true;
			scene.add(cap);
		}
		const tara = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 0.8, 3, 8), goldM);
		tara.position.set(46, 2, 12);
		scene.add(tara);
	}
	// Kāśyapa Buddha's shrine, north-west — "it often emits a bright light"
	scene.add(buildShrine(-33, -38, 4.4, 4.6, temple));
	// the two brick chambers of the earth gods, north-west of it
	addBox(scene, 3, 3, 3, -46, 1.5, -31, temple);
	addBox(scene, 3, 3, 3, -50, 1.5, -26, temple);
	addBox(scene, 1.1, 1.8, 0.3, -44.4, 1.1, -31, mat(C.door));
	addBox(scene, 1.1, 1.8, 0.3, -48.4, 1.1, -26, mat(C.door));
	// Mahānāma's temple (Cunningham's H — the Ceylonese inscription)
	scene.add(buildShrine(-44, 13, 4, 5, temple));
	// the charnel ground on the temple's north-west, between the railings and
	// the brick wall — a present-day cremation ground (Tibetan tradition; the
	// pilgrims record none), drawn as ash-grey earth strewn with piles of bone
	{
		const patch = new THREE.Mesh(new THREE.BoxGeometry(26, 0.1, 50), mat(0x9a9791));
		patch.position.set(100, 0.14, -45);
		patch.receiveShadow = true;
		scene.add(patch);
		if (models.bones)
			scatterSpecies(
				models.bones,
				[
					[100, -60, 1.4, 0.6],
					[105, -49, 1.1, 1.4],
					[950, -34, 1.5, 1.1],
					[98, -37, 1.2, 2.7],
					[90, -44, 1.4, 3.0],
					[93, -31, 1.3, 2.2]
				],
				{ material: mat(0xccc4b0) }
			);
	}
	// the banyan of Mahābrahmā's entreaty, south-east corner, with stupa and temple
	{
		const barkM = mat(C.trunk);
		const g = new THREE.Group();
		const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.1, 6, 8), barkM);
		trunk.position.set(64, 3, 44);
		trunk.castShadow = true;
		g.add(trunk);
		for (const [dx, dz] of [
			[-3.5, 1.5],
			[3, -2],
			[1, 3.5]
		]) {
			const root = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 5, 6), barkM);
			root.position.set(64 + dx, 2.5, 44 + dz);
			g.add(root);
		}
		for (const [dx, dy, dz, r] of [
			[0, 8, 0, 6.5],
			[-4.5, 7, 2, 4],
			[4, 7.2, -2.5, 4.2],
			[1, 7, 4, 3.8]
		]) {
			const s = new THREE.Mesh(new THREE.SphereGeometry(r, 11, 8), mat(C.leafDark));
			s.position.set(64 + dx, dy, 44 + dz);
			s.scale.y = 0.62;
			s.castShadow = true;
			g.add(s);
		}
		scene.add(g);
		// the scanned banyan replaces the procedural one once loaded
		if (models.banyan)
			loadTreeModel(models.banyan, { x: 64, z: 44, height: 20, placeholder: g });
		scene.add(buildStupa(57, 39, 4.5, temple));
		scene.add(buildShrine(71, 39, 3.6, 4.2, temple));
	}
	// the four great stupas at the four corners of the enclosure
	for (const [cx, cz] of [
		[-70, -38],
		[74, -38],
		[-70, 50],
		[74, 50]
	]) {
		scene.add(buildStupa(cx, cz, 9, templeDark));
	}
	// Māra's attempt to frighten the Bodhisattva, beside the east gate — and
	// the two stupas built by Indra and Brahmā
	scene.add(buildStupa(77, -7, 5, templeDark));
	scene.add(buildStupa(74, 9, 4, templeDark));
	scene.add(buildStupa(70, 12, 4, templeDark));
	// the two Avalokiteśvara statues at the southern and northern limits, set a
	// little west of the gate axis so they don't block it — the southern one
	// "has already sunk down up to the chest", half-buried in drifted sand
	{
		const AVX = 1;
		for (const [az, sunk] of [
			[-42.5, 0],
			[54.5, 1]
		] as [number, number][]) {
			const floorY = sunk ? -3.5 : 0.5;
			if (!sunk) addBox(scene, 3.4, 1.2, 3.4, AVX, 0.6, az, temple); // low plinth for the standing one
			const fb = new THREE.Group();
			const cap = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 1.8, 3, 8), goldM);
			cap.position.set(AVX, floorY + 1.9, az);
			cap.castShadow = true;
			fb.add(cap);
			scene.add(fb);
			if (models.dancingBodhisattva) {
				loadStatue(models.dancingBodhisattva, {
					height: 6,
					x: AVX,
					floorY,
					z: az,
					material: greyStone,
					placeholder: fb,
					yaw: Math.PI / 2 // turned to face east
				});
			}
			if (sunk) {
				const drift = new THREE.Mesh(new THREE.CircleGeometry(3.4, 16), mat(0xe6d8b0));
				drift.rotation.x = -Math.PI / 2;
				drift.position.set(AVX, 0.16, az);
				scene.add(drift);
			}
		}
	}
	// the toran gateway, east of the temple on the axis
	{
		for (const tz of [-1.7, 1.7]) {
			const pil = new THREE.Mesh(new THREE.BoxGeometry(0.7, 5.2, 0.7), granite);
			pil.position.set(44, 2.6, tz);
			pil.castShadow = true;
			scene.add(pil);
		}
		addBox(scene, 0.8, 0.55, 6, 44, 5.5, 0, granite);
		addBox(scene, 0.7, 0.4, 5, 44, 6.4, 0, granite);
	}
	// the octagonal well, outside the court's east gate on the south side of the road
	{
		const wellO = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.9, 1.3, 8), stone);
		wellO.position.set(89, 0.65, 6);
		wellO.castShadow = wellO.receiveShadow = true;
		scene.add(wellO);
		const wellW = new THREE.Mesh(new THREE.CircleGeometry(1.25, 8), mat(C.water));
		wellW.rotation.x = -Math.PI / 2;
		wellW.position.set(89, 1.32, 6);
		scene.add(wellW);
	}

	/* ---------------------------------- outside the walls: west and south --- */
	// the Saffron Stupa of the Jāguḍa merchants (Xuanzang: west; Cunningham: NW),
	// beyond the western wall
	scene.add(buildStupa(-112, -18, 13, mat(C.saffronPlaster), mat(0xe8c084)));
	// the milkmaids' two stupas, outside the court's south-west corner
	scene.add(buildStupa(-72, 68, 4, brick));
	scene.add(buildStupa(-67, 72, 3.4, brick));

	/* the flower pool (Buddhokar) — "more than seven hundred paces in circuit",
	   outside the south gate; nearly square, its north bank a niched wall
	   with steps down to the water */
	{
		// a flat sheet of water, flush with the ground
		const tank = new THREE.Mesh(new THREE.BoxGeometry(60, 0.4, 52), mat(0x8fb5ad));
		tank.position.set(8, 0.05, 98);
		tank.receiveShadow = true;
		scene.add(tank);
		// the stone kerb runs all the way round; steps on the north bank
		addBox(scene, 62.4, 1.2, 1.2, 8, 0.6, 71.4, stone);
		addBox(scene, 62.4, 1.2, 1.2, 8, 0.6, 124.6, stone);
		addBox(scene, 1.2, 1.2, 54.4, -22.6, 0.6, 98, stone);
		addBox(scene, 1.2, 1.2, 54.4, 38.6, 0.6, 98, stone);
		for (let k = 0; k < 3; k++) {
			const h = 1.4 - k * 0.4;
			addBox(scene, 8, h, 1.5, 8, h / 2, 72.8 + k * 1.5, stone).castShadow = false;
		}
	}
	// Indra's pool, further south-west, and the clothes-drying rock
	{
		const pool = new THREE.Mesh(new THREE.CylinderGeometry(16, 16, 0.4, 22), mat(0x8fb5ad));
		pool.scale.z = 0.72;
		pool.position.set(-65, 0.05, 122);
		scene.add(pool);
		const rock = new THREE.Mesh(new THREE.BoxGeometry(4, 1.6, 3), mat(0x9a9584));
		rock.position.set(-88, 0.8, 120);
		rock.castShadow = true;
		scene.add(rock);
		scene.add(buildStupa(-84, 113, 3, brick));
		scene.add(buildStupa(-80, 128, 3, brick));
	}
	/* Mucilinda's pond, in a wood to the east — the small shrine on its west
	   bank, the dragon king's chamber on the east */
	{
		const pond = new THREE.Mesh(new THREE.CylinderGeometry(19, 19, 0.4, 24), mat(0x86a8a4));
		pond.scale.z = 0.8;
		pond.position.set(85, 0.05, 106);
		scene.add(pond);
		scene.add(buildShrine(63, 106, 3.6, 4, brick));
		addBox(scene, 3, 2.4, 3, 106, 1.2, 106, brickDark);
	}
	// the emaciated-Buddha shrine and its promenade with two pipal trees —
	// beyond the walls, toward Urel. A second ghost-fade (its own material set,
	// separate from the temple's) opens it at the austerities station.
	const austMats: THREE.MeshLambertMaterial[] = [];
	const austFadePale = new THREE.Color(0xdcd2b8);
	const austEdgeMat = new THREE.LineBasicMaterial({ color: 0x8d8474, transparent: true, opacity: 0 });
	const austEdges = new THREE.Group();
	const austFadeable = (m: THREE.Material) => {
		const c = m.clone() as THREE.MeshLambertMaterial;
		c.userData.c0 = c.color.clone();
		austMats.push(c);
		return c;
	};
	{
		const SX = 128;
		const SZ = 116;
		const CW = 8; // a bigger cell than the other shrines, to hold the statue
		const CH = 8;
		const g = new THREE.Group();
		const wallM = austFadeable(brick);
		const capM = austFadeable(templeDark);
		addBox(g, CW + 2.6, 1, CW + 2.6, SX, 0.5, SZ, wallM); // platform
		addBox(g, 1, CH, CW, SX - CW / 2, 1 + CH / 2, SZ, wallM); // west (back)
		addBox(g, CW, CH, 1, SX, 1 + CH / 2, SZ - CW / 2, wallM); // north
		addBox(g, CW, CH, 1, SX, 1 + CH / 2, SZ + CW / 2, wallM); // south
		const pier = (CW - 3) / 2; // east wall with a door gap
		addBox(g, 1, CH, pier, SX + CW / 2, 1 + CH / 2, SZ - CW / 2 + pier / 2, wallM);
		addBox(g, 1, CH, pier, SX + CW / 2, 1 + CH / 2, SZ + CW / 2 - pier / 2, wallM);
		addBox(g, 1, CH * 0.28, CW, SX + CW / 2, 1 + CH - CH * 0.14, SZ, wallM); // lintel
		const cap = new THREE.Mesh(new THREE.ConeGeometry(CW * 0.72, CH * 0.85, 4), capM);
		cap.rotation.y = Math.PI / 4;
		cap.position.set(SX, 1 + CH + CH * 0.4, SZ);
		cap.castShadow = true;
		g.add(cap);
		scene.add(g);
		// the real silhouette in edge-lines, for the ghost
		g.traverse((o) => {
			const m = o as THREE.Mesh;
			if (!m.isMesh || !m.geometry) return;
			const e = new THREE.LineSegments(
				new THREE.EdgesGeometry(m.geometry as THREE.BufferGeometry, 24),
				austEdgeMat
			);
			e.position.copy(m.position);
			e.quaternion.copy(m.quaternion);
			e.scale.copy(m.scale);
			austEdges.add(e);
		});
		austEdges.visible = false;
		scene.add(austEdges);
		// the emaciated Buddha inside, facing east toward the door
		const fastFallback = new THREE.Group();
		const fb = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 1.6, 3, 8), gildM);
		fb.position.set(SX, 3, SZ);
		fastFallback.add(fb);
		scene.add(fastFallback);
		if (models.fastingBuddha) {
			loadStatue(models.fastingBuddha, {
				height: 4.6,
				x: SX,
				floorY: 1,
				z: SZ,
				material: templeDark,
				placeholder: fastFallback,
				yaw: Math.PI / 2 // turned to face east
			});
		}
		addBox(scene, 1.2, 0.5, 18, 134, 0.25, 116, brick);
		// the two pipal trees at the ends of the promenade — the banyan model
		const barkM = mat(C.trunk);
		for (const pz of [100, 130]) {
			const ph = new THREE.Group();
			const t = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 4, 7), barkM);
			t.position.set(134, 2, pz);
			ph.add(t);
			const cr = new THREE.Mesh(new THREE.SphereGeometry(2.6, 9, 7), mat(C.leaf));
			cr.position.set(134, 5, pz);
			cr.castShadow = true;
			ph.add(cr);
			scene.add(ph);
			if (models.banyan)
				loadTreeModel(models.banyan, { x: 134, z: pz, height: 20, placeholder: ph });
		}
		scene.add(buildStupa(140, 110, 3, brick)); // Ājñāta-Kauṇḍinya and his companions
	}
	/* the merchants' offering and the four bowls — near the road by the river;
	   the tree of the seventh week */
	{
		scene.add(buildStupa(158, 74, 5, brick));
		scene.add(buildStupa(165, 82, 5, brick));
		const barkM = mat(C.trunk);
		const t = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 5, 8), barkM);
		t.position.set(160, 2.5, 88);
		t.castShadow = true;
		scene.add(t);
		if (models.banyan)
			loadTreeModel(models.banyan, { x: 160, z: 88, height: 18, placeholder: t });
		scene.add(buildStupa(168, 122, 4, brick));
		scene.add(buildStupa(175, 132, 3.4, brick));
		scene.add(buildStupa(163, 140, 3.4, brick));
		scene.add(buildStupa(188, 146, 3.6, brick));
		addBox(scene, 4, 0.8, 3, 196, 0.4, 128, stone);
	}

	/* ------------------------------ the Mahābodhi Saṅghārāma, north (§8) --- */
	{
		const M = { cx: 10, cz: -205 };
		addBox(scene, 136, 5, 136, M.cx, 2.5, M.cz, mat(0xc9b389)); // the mound
		const top = 5;
		const half = 60;
		const T = 6;
		const H = 11;
		const win = new THREE.InstancedMesh(new THREE.BoxGeometry(1.2, 1.7, 0.4), mat(C.door), 700);
		let wi = 0;
		function range(w: number, d: number, x: number, z: number, gap: boolean) {
			// the gate stays open to the sky — no slab bridges it
			if (gap) {
				const seg = (w - 7) / 2;
				for (const side of [-1, 1]) {
					const cx = x + side * (3.5 + seg / 2);
					addBox(scene, seg, H, d, cx, top + H / 2, z, brick);
					for (const y of [top + 3.6, top + 7.2]) {
						addBox(scene, seg + 0.5, 0.45, d + 0.5, cx, y, z, stone).castShadow = false;
					}
				}
			} else {
				addBox(scene, w, H, d, x, top + H / 2, z, brick);
				for (const y of [top + 3.6, top + 7.2]) {
					addBox(scene, w + 0.5, 0.45, d + 0.5, x, y, z, stone).castShadow = false;
				}
			}
			const along = Math.max(w, d);
			const n = Math.floor(along / 5);
			for (const y of [top + 2.2, top + 5.8, top + 9.2]) {
				for (let k = 0; k < n; k++) {
					const t = ((k + 0.5) / n - 0.5) * (along - 4);
					if (gap && Math.abs(t) < 5) continue;
					if (w >= d) {
						dummy.rotation.set(0, 0, 0);
						dummy.position.set(x + t, y, z - d / 2 - 0.05);
						dummy.updateMatrix();
						win.setMatrixAt(wi++, dummy.matrix);
						dummy.position.set(x + t, y, z + d / 2 + 0.05);
					} else {
						dummy.rotation.set(0, Math.PI / 2, 0);
						dummy.position.set(x - w / 2 - 0.05, y, z + t);
						dummy.updateMatrix();
						win.setMatrixAt(wi++, dummy.matrix);
						dummy.position.set(x + w / 2 + 0.05, y, z + t);
					}
					dummy.updateMatrix();
					win.setMatrixAt(wi++, dummy.matrix);
				}
			}
		}
		range(2 * half, T, M.cx, M.cz - half + T / 2, false); // north
		range(2 * half, T, M.cx, M.cz + half - T / 2, true); // south, with the gate
		range(T, 2 * half - 2 * T, M.cx - half + T / 2, M.cz, false); // west
		range(T, 2 * half - 2 * T, M.cx + half - T / 2, M.cz, false); // east
		win.count = wi;
		scene.add(win);
		function tower(x: number, z: number, big: boolean) {
			const r = big ? 5 : 3;
			const h = big ? 13 : 11.5;
			const t = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.6, h, 14), brickDark);
			t.position.set(x, top + h / 2, z);
			t.castShadow = t.receiveShadow = true;
			scene.add(t);
			const dome = new THREE.Mesh(
				new THREE.SphereGeometry(r, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
				plasterM
			);
			dome.position.set(x, top + h, z);
			dome.castShadow = true;
			scene.add(dome);
			if (big) {
				const fin = new THREE.Mesh(new THREE.ConeGeometry(0.6, 2.4, 8), goldM);
				fin.position.set(x, top + h + r + 1, z);
				scene.add(fin);
			}
		}
		for (const [dx, dz] of [
			[-half, -half],
			[half, -half],
			[-half, half],
			[half, half]
		]) {
			tower(M.cx + dx, M.cz + dz, true);
		}
		for (const f of [-0.5, 0, 0.5]) {
			tower(M.cx + f * 2 * half * 0.5, M.cz - half, false);
			if (f !== 0) tower(M.cx + f * 2 * half * 0.5, M.cz + half, false); // keep the south gate clear
			tower(M.cx - half, M.cz + f * 2 * half * 0.5, false);
			tower(M.cx + half, M.cz + f * 2 * half * 0.5, false);
		}
		const B = 16;
		const BH = 12;
		addBox(scene, 2 * B, BH, 5, M.cx, top + BH / 2, M.cz - B + 2.5, brick);
		addBox(scene, 2 * B, BH, 5, M.cx, top + BH / 2, M.cz + B - 2.5, brick);
		addBox(scene, 5, BH, 2 * B - 10, M.cx - B + 2.5, top + BH / 2, M.cz, brick);
		addBox(scene, 5, BH, 2 * B - 10, M.cx + B - 2.5, top + BH / 2, M.cz, brick);
		for (const y of [top + 4, top + 8]) {
			addBox(scene, 2 * B + 0.6, 0.45, 2 * B + 0.6, M.cx, y, M.cz, stone).castShadow = false;
		}
		addBox(scene, 6, BH, 10, M.cx - B - 3, top + BH / 2, M.cz, brick);
		addBox(scene, 6, BH, 10, M.cx + B + 3, top + BH / 2, M.cz, brick);
		addBox(scene, 8, BH - 2, 4, M.cx, top + (BH - 2) / 2, M.cz - B - 2, brick);
		addBox(scene, 8, BH - 2, 4, M.cx, top + (BH - 2) / 2, M.cz + B + 2, brick);
		addBox(scene, 20, 0.4, 20, M.cx, top + 0.2, M.cz, plasterM).castShadow = false;
		const wellO = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.35, 1, 10), stone);
		wellO.position.set(M.cx - 5, top + 0.5, M.cz + 4);
		scene.add(wellO);
		const st = buildStupa(M.cx, M.cz, 6, brick);
		st.position.y = top;
		scene.add(st);
		function smallCourt(cx: number, cz: number) {
			const S = 20;
			const t = 4.5;
			const h = 8;
			addBox(scene, S, h, t, cx, top + h / 2, cz - S / 2 + t / 2, brick);
			addBox(scene, S, h, t, cx, top + h / 2, cz + S / 2 - t / 2, brick);
			addBox(scene, t, h, S - 2 * t, cx - S / 2 + t / 2, top + h / 2, cz, brick);
			addBox(scene, t, h, S - 2 * t, cx + S / 2 - t / 2, top + h / 2, cz, brick);
			addBox(scene, S + 0.5, 0.4, S + 0.5, cx, top + h, cz, stone).castShadow = false;
		}
		smallCourt(-28, M.cz - 32);
		smallCourt(48, M.cz - 32);
		smallCourt(-28, M.cz + 30);
		smallCourt(48, M.cz + 30);
		const r1 = buildStupa(M.cx - 24, M.cz + 42, 10, brick);
		r1.position.y = top;
		scene.add(r1);
		const r2 = buildStupa(M.cx + 30, M.cz + 42, 10, brick);
		r2.position.y = top;
		scene.add(r2);
		// the great flight of steps, solid to the ground
		for (let k = 0; k < 5; k++) {
			const h = 5 - k;
			addBox(scene, 10, h, 2.2, 10, h / 2, M.cz + 70 + k * 2.2, stone);
		}

		/* satellite-inferred (Cardiff/Bihar): the outer enclosure square and
		   its moat — drawn sand-pale, not yet excavated */
		const ghost = new THREE.Group();
		const G = 82;
		addBox(ghost, 2 * G, 4, 2, M.cx, 2, M.cz - G, brick);
		addBox(ghost, 2 * G, 4, 2, M.cx, 2, M.cz + G, brick);
		addBox(ghost, 2, 4, 2 * G, M.cx - G, 2, M.cz, brick);
		addBox(ghost, 2, 4, 2 * G, M.cx + G, 2, M.cz, brick);
		const moatM = mat(C.water);
		addBox(ghost, 2 * G + 26, 0.3, 11, M.cx, 0.15, M.cz - G - 7.5, moatM);
		addBox(ghost, 2 * G + 26, 0.3, 11, M.cx, 0.15, M.cz + G + 7.5, moatM);
		addBox(ghost, 11, 0.3, 2 * G + 4, M.cx - G - 7.5, 0.15, M.cz, moatM);
		addBox(ghost, 11, 0.3, 2 * G + 4, M.cx + G + 7.5, 0.15, M.cz, moatM);
		scene.add(ghostify(ghost, 0.5));
	}

	/* the Sujātā stupa across the river — satellite-read as part of the
	   wider complex; drawn sand-pale on the far bank */
	scene.add(ghostify(buildStupa(355, 85, 14, brick), 0.45));

	/* ------------------------------------------------- the votive field --- */
	{
		const vDrum = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.85, 1.0, 1.0, 9), mat(0xa8a093), 340);
		const vDome = new THREE.InstancedMesh(
			new THREE.SphereGeometry(0.85, 9, 7, 0, Math.PI * 2, 0, Math.PI / 2),
			plasterM,
			340
		);
		const vSpire = new THREE.InstancedMesh(new THREE.ConeGeometry(0.24, 1.0, 6), mat(C.sandstone), 340);
		let vi = 0;
		let seed = 11;
		const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
		const keepOut: [number, number, number][] = [
			[10, 0, 22], // the temple and its base
			[-8, 0, 13], // the tree railing
			[6, -16, 6], // the Walk
			[58, -28, 14], // the gazing shrine on its mound
			[-66, -2, 8], // the Ratnagṛha
			[-30, 2, 7], // the medium stupa west of the temple
			[-4, 36, 16], // Aśoka's stupa, with its clear ground
			[16, 27, 4],
			[10, -33, 6], // the stupa north of the temple
			[21, -33, 5], // and its small temple
			[-33, -38, 5],
			[-48, -29, 6],
			[-44, 13, 5],
			[64, 44, 10], // the banyan
			[54, -6.5, 4],
			[54, 6.5, 4],
			[46, 13, 11], // the Tārā row
			[44, 0, 3],
			[77, -7, 4],
			[72, 10, 5],
			[1, -42.5, 4],
			[1, 54.5, 4],
			[-6, -25, 3],
			[-70, -38, 7], // the four corner stupas
			[74, -38, 7],
			[-70, 50, 7],
			[74, 50, 7]
		];
		const placed: [number, number, number][] = [];
		const place = (x: number, z: number, sMin: number, sMax: number) => {
			if (vi >= 340) return;
			for (const [kx, kz, kr] of keepOut) {
				if ((x - kx) ** 2 + (z - kz) ** 2 < kr * kr) return;
			}
			const s = sMin + rnd() * (sMax - sMin);
			// never let two votive stupas merge into each other
			for (const [px, pz, ps] of placed) {
				const min = (s + ps) * 1.1;
				if ((x - px) ** 2 + (z - pz) ** 2 < min * min) return;
			}
			placed.push([x, z, s]);
			dummy.rotation.set(0, 0, 0);
			dummy.scale.setScalar(s);
			dummy.position.set(x, 0.5 * s, z);
			dummy.updateMatrix();
			vDrum.setMatrixAt(vi, dummy.matrix);
			dummy.position.set(x, 1.0 * s, z);
			dummy.updateMatrix();
			vDome.setMatrixAt(vi, dummy.matrix);
			dummy.position.set(x, 2.1 * s, z);
			dummy.updateMatrix();
			vSpire.setMatrixAt(vi, dummy.matrix);
			vi++;
		};
		// a few ordered rows first — pilgrims built in lines as well as crowds
		for (let k = 0; k < 10; k++) place(-26, 22 + k * 2.3, 0.7, 0.85);
		for (let k = 0; k < 9; k++) place(-32 + k * 2.4, -34, 0.6, 0.75);
		for (let k = 0; k < 11; k++) place(26 + k * 2.5, 26, 0.65, 0.8);
		for (let k = 0; k < 8; k++) place(-14 + k * 2.4, 50, 0.6, 0.75);
		// dense in the courtyard, avoiding the east road and the gates
		for (let i = 0; i < 900 && vi < 270; i++) {
			const x = W.x0 + 3 + rnd() * (W.x1 - W.x0 - 6);
			const z = W.z0 + 3 + rnd() * (W.z1 - W.z0 - 6);
			if (x > R.x0 - 1 && x < R.x1 + 1 && z > R.z0 - 1 && z < R.z1 + 1) continue;
			if (x > 34 && Math.abs(z) < 4) continue; // the processional road
			if (Math.abs(x - 10) < 4 && (z > 50 || z < -38)) continue; // gate paths
			place(x, z, 0.55, 1.5);
		}
		// spilling south toward the pool, thinning with distance
		for (let i = 0; i < 200 && vi < 320; i++) {
			const x = -40 + rnd() * 110;
			const z = 61 + rnd() * 9;
			if (Math.abs(x - 10) < 4) continue;
			place(x, z, 0.4, 0.9 - (z - 61) * 0.02);
		}
		// a line along the road between the two east gates
		for (let i = 0; i < 80 && vi < 340; i++) {
			const x = 88 + rnd() * 22;
			const z = (rnd() > 0.5 ? 1 : -1) * (5 + rnd() * 6);
			place(x, z, 0.4, 0.9);
		}
		vDrum.count = vDome.count = vSpire.count = vi;
		dummy.scale.setScalar(1);
		vDrum.castShadow = vDome.castShadow = true;
		scene.add(vDrum, vDome, vSpire);
	}

	/* ------------------------------------------------ villages and trees --- */
	const hutGeo = new THREE.BoxGeometry(4.5, 3, 4.5);
	const roofGeo = new THREE.ConeGeometry(3.8, 2.4, 4);
	const huts = new THREE.InstancedMesh(hutGeo, mat(0xc9b389), 60);
	const roofs = new THREE.InstancedMesh(roofGeo, mat(0x9a7d52), 60);
	let hi = 0;
	// Urel — ancient Uruvilvā — east-south-east on the near bank, hamlets south-west
	const hamlets: [number, number][] = [
		[170, 162],
		[150, 192],
		[-180, 170],
		[-260, 120],
		[-300, -160],
		[150, -220]
	];
	for (const [cx, cz] of hamlets) {
		for (let k = 0; k < 7; k++) {
			const x = cx + ((k * 29) % 26) - 13;
			const z = cz + ((k * 47) % 22) - 11;
			dummy.rotation.set(0, ((cx + k) * 0.7) % Math.PI, 0);
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

	/* groves — "exotic trees and famous flowers cast continuous shade": the
	   low-poly tree GLBs instanced across the landscape (see scatterSpecies) */
	{
		let seed = 77;
		const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
		const spots: [number, number, number, number][] = []; // x, z, height, yaw
		const put = (x: number, z: number, hBase: number) =>
			spots.push([x, z, hBase * (0.8 + rnd() * 0.5), rnd() * Math.PI * 2]);
		// the wood of Mucilinda and the austerities grove
		for (let i = 0; i < 16; i++) {
			const a = rnd() * Math.PI * 2;
			const r = 24 + rnd() * 22;
			const x = 95 + Math.cos(a) * r;
			const z = 112 + Math.sin(a) * r * 0.8;
			if ((x - 85) ** 2 / 1.1 + (z - 106) ** 2 < 21 * 21) continue;
			if (x > 108 && x < 120 && z < 138) continue; // not in the east wall
			put(x, z, 8);
		}
		// scattered groves everywhere else — the uncultivated land is thick with
		// trees — clear of the precinct, tanks, river, monastery and paddies
		for (let i = 0; i < 4000 && spots.length < 200; i++) {
			const x = -950 + rnd() * 1800;
			const z = -650 + rnd() * 1300;
			if (x > -108 && x < 126 && z > -100 && z < 148) continue; // walls + surrounds
			if (x > -70 && x < 90 && z > -320 && z < -80) continue; // the monastery
			if (x > 160 && x < 360) continue; // the river and its banks
			if (Math.hypot(x - 640, z + 720) < 170 || Math.hypot(x - 540, z + 800) < 140)
				continue; // Prāgbodhi's slopes
			if (x > 55 && x < 130 && z > 80 && z < 135) continue; // Mucilinda
			if (x > -145 && x < -100 && z > -80 && z < 115) continue; // the barrier mounds
			if (riceLand.onFields(x, z)) continue; // never on the paddies
			put(x, z, 20); // 1.5× taller landscape tree

		}
		spots.push(...riceLand.forestSpots);
		// hand the spots out among the species; the oak GLB is a wide cluster,
		// so it goes to a few far-off spots only, scaled up as background groves —
		// and never onto a bund, where it would sprawl over the paddies
		const species = models.scatterTrees ?? [];
		if (species.length) {
			const oak = species.length - 1;
			const nSingle = Math.max(1, species.length - 1);
			const buckets: [number, number, number, number][][] = species.map(() => []);
			spots.forEach((s, i) => {
				if (Math.hypot(s[0], s[1]) > 240 && i % 5 === 0)
					buckets[oak].push([s[0], s[1], s[2] * 1.8, s[3]]);
				else buckets[i % nSingle].push(s);
			});
			riceLand.bundSpots.forEach((s, i) => buckets[i % nSingle].push(s));
			species.forEach((url, i) => scatterSpecies(url, buckets[i]));
		}
	}

	/* ------------------------------------------------------ glowing path --- */
	const curve = new THREE.CatmullRomCurve3(
		PATH_POINTS.map(([x, z]) => new THREE.Vector3(x, 1.2, z))
	);
	const SEGS = 1600;
	// sample arc length finely and evenly per segment, so the control-point
	// fractions below line up with the tube's own arc-length parametrisation
	const DIV_PER_SEG = 24;
	curve.arcLengthDivisions = DIV_PER_SEG * (PATH_POINTS.length - 1);
	const tube = new THREE.Mesh(
		new THREE.TubeGeometry(curve, SEGS, 0.3, 6),
		new THREE.MeshBasicMaterial({ color: C.saffron })
	);
	const halo = new THREE.Mesh(
		new THREE.TubeGeometry(curve, SEGS, 1.0, 6),
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

	// the arc-length fraction of each control point (station waypoint), so the
	// glowing head and the trail's tip sit exactly on the monument the card
	// names — plain chord distance drifts wildly on this criss-crossing curve
	const cumLen = curve.getLengths();
	const totalLen = cumLen[cumLen.length - 1] || 1;
	const fractions = PATH_POINTS.map((_, i) => cumLen[i * DIV_PER_SEG] / totalLen);

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
	head.scale.set(4, 4, 1);
	scene.add(head);

	/* ------------------------------------------------------------- loop --- */
	let progress = 0;
	let shown = 0;
	let dolly = 1;
	let fadeTarget = 0;
	let fadeVal = 0;
	let austFadeTarget = 0;
	let austFadeVal = 0;
	const pos = new THREE.Vector3();
	const look = new THREE.Vector3();
	const a = new THREE.Vector3();
	const b = new THREE.Vector3();

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
		if (dolly !== 1) pos.sub(look).multiplyScalar(dolly).add(look);
		camera.position.copy(pos);
		camera.lookAt(look);
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
		// fade the temple at the sanctum and tree stations — keep the real
		// building, only make it a faint translucent ghost of itself
		const dv = fadeTarget - fadeVal;
		if (Math.abs(dv) > 0.002) {
			fadeVal += dv * 0.12;
			// stacked translucent surfaces never actually look see-through, so
			// past a cutoff we HIDE the solid temple outright (guaranteed fully
			// transparent) and let the real stepped silhouette be carried by the
			// edge-lines alone. Below the cutoff it dissolves smoothly.
			const cut = 0.5;
			const gone = fadeVal > cut;
			const op = gone ? 0 : 1 - fadeVal / cut;
			for (const m of fadeMats) {
				m.opacity = op;
				m.transparent = fadeVal > 0.01;
				m.depthWrite = op > 0.6;
				m.color.copy(m.userData.c0 as THREE.Color).lerp(fadePale, Math.min(1, fadeVal) * 0.5);
			}
			if (templeGroup.visible === gone) {
				templeGroup.visible = !gone;
				renderer.shadowMap.needsUpdate = true;
			}
			// the tower niches and gilded images hide with the solid
			for (const o of hideOnFade) {
				if (o.visible === gone) o.visible = !gone;
			}
			// its true silhouette, redrawn in edge-lines
			templeEdges.visible = fadeVal > 0.12;
			templeEdgeMat.opacity = Math.min(1, fadeVal * 1.4) * 0.75;
		}
		// the six-years-austerities shrine only needs to go translucent, not
		// vanish: fade the solid surfaces down to a floor opacity and keep the
		// group visible, so it reads as a translucent shrine rather than an
		// edges-only ghost like the great temple.
		const dv2 = austFadeTarget - austFadeVal;
		if (Math.abs(dv2) > 0.002) {
			austFadeVal += dv2 * 0.12;
			const floor2 = 0.32;
			const op2 = 1 - Math.min(1, austFadeVal) * (1 - floor2);
			for (const m of austMats) {
				m.opacity = op2;
				m.transparent = austFadeVal > 0.01;
				m.depthWrite = op2 > 0.6;
				m.color.copy(m.userData.c0 as THREE.Color).lerp(austFadePale, Math.min(1, austFadeVal) * 0.5);
			}
			austEdges.visible = austFadeVal > 0.12;
			austEdgeMat.opacity = Math.min(1, austFadeVal * 1.4) * 0.75;
		}
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
			// the temple turns translucent while the chamber and the tree are
			// the story, so the image against the back wall can be seen
			fadeTarget = i === 5 || i === 6 ? 1 : 0;
			// the austerities shrine opens at its own station
			austFadeTarget = i === 19 ? 1 : 0;
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
