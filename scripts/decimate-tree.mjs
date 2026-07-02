// Per-primitive vertex-clustering decimator for foliage GLBs (no deps).
// Keeps each primitive separate and gives it ONE flat colour chosen from its
// source material NAME (bark/branch → brown, leaf/vine → green …), dropping all
// textures — turning a heavy photoreal tree into a light, flat-shaded low-poly
// tree that matches this scene. Usage:
//   node scripts/decimate-tree.mjs <in.glb> <out.glb> <gridCells>
import { readFileSync, writeFileSync } from 'node:fs';

const [inPath, outPath, gridArg, coloursArg] = process.argv.slice(2);
const GRID = Number(gridArg ?? 80);
// optional per-output-primitive colour override, comma-separated hex
// (e.g. "6e573b,4a6b32"); falls back to the material-name heuristic
const hexToRgb = (h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const OVERRIDE = coloursArg ? coloursArg.split(',').map((h) => hexToRgb(h.replace('#', ''))) : null;

// material-name → flat colour (linear-ish sRGB baseColorFactor)
function colourFor(name = '') {
	const n = name.toLowerCase();
	if (/vine/.test(n)) return [0.3, 0.4, 0.22];
	if (/leaf|leaves|bodhi|front|cap|foliage/.test(n)) return [0.4, 0.53, 0.31];
	if (/bark|branch|trunk|wood|stem/.test(n)) return [0.42, 0.34, 0.22];
	return [0.4, 0.53, 0.31]; // default: leaf green
}

const buf = readFileSync(inPath);
const jsonLen = buf.readUInt32LE(12);
const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString());
const binStart = 20 + jsonLen + 8;

function accView(accIdx) {
	const a = json.accessors[accIdx];
	const v = json.bufferViews[a.bufferView];
	const off = binStart + (v.byteOffset || 0) + (a.byteOffset || 0);
	return { a, off };
}
function matFromTRS(node) {
	if (node.matrix) {
		const m = node.matrix;
		return { r: [m[0], m[4], m[8], m[1], m[5], m[9], m[2], m[6], m[10]], t: [m[12], m[13], m[14]] };
	}
	const [qx, qy, qz, qw] = node.rotation ?? [0, 0, 0, 1];
	const [tx, ty, tz] = node.translation ?? [0, 0, 0];
	const [sx, sy, sz] = node.scale ?? [1, 1, 1];
	const r = [
		1 - 2 * (qy * qy + qz * qz), 2 * (qx * qy - qz * qw), 2 * (qx * qz + qy * qw),
		2 * (qx * qy + qz * qw), 1 - 2 * (qx * qx + qz * qz), 2 * (qy * qz - qx * qw),
		2 * (qx * qz - qy * qw), 2 * (qy * qz + qx * qw), 1 - 2 * (qx * qx + qy * qy)
	];
	return { r: r.map((v, i) => v * [sx, sy, sz][i % 3]), t: [tx, ty, tz] };
}
function matMul(A, B) {
	const r = new Array(9);
	for (let i = 0; i < 3; i++)
		for (let j = 0; j < 3; j++)
			r[i * 3 + j] = A.r[i * 3] * B.r[j] + A.r[i * 3 + 1] * B.r[3 + j] + A.r[i * 3 + 2] * B.r[6 + j];
	const t = [0, 1, 2].map(
		(i) => A.r[i * 3] * B.t[0] + A.r[i * 3 + 1] * B.t[1] + A.r[i * 3 + 2] * B.t[2] + A.t[i]
	);
	return { r, t };
}
const IDENT = { r: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: [0, 0, 0] };

// gather primitives with world transforms and material names
const prims = [];
function walk(nodeIdx, parent) {
	const node = json.nodes[nodeIdx];
	const world = matMul(parent, matFromTRS(node));
	if (node.mesh !== undefined) for (const p of json.meshes[node.mesh].primitives) prims.push({ p, world });
	for (const c of node.children ?? []) walk(c, world);
}
for (const root of json.scenes[json.scene ?? 0].nodes) walk(root, IDENT);

// world-space positions per prim, and a global bbox for a consistent cell size
const primData = prims.map(({ p, world }) => {
	const pv = accView(p.attributes.POSITION);
	const src = new Float32Array(buf.buffer, buf.byteOffset + pv.off, pv.a.count * 3);
	const pos = new Float32Array(pv.a.count * 3);
	const { r, t } = world;
	for (let i = 0; i < pv.a.count; i++) {
		const x = src[i * 3], y = src[i * 3 + 1], z = src[i * 3 + 2];
		pos[i * 3] = r[0] * x + r[1] * y + r[2] * z + t[0];
		pos[i * 3 + 1] = r[3] * x + r[4] * y + r[5] * z + t[1];
		pos[i * 3 + 2] = r[6] * x + r[7] * y + r[8] * z + t[2];
	}
	const iv = accView(p.indices);
	const idx = iv.a.componentType === 5125
		? new Uint32Array(buf.buffer, buf.byteOffset + iv.off, iv.a.count)
		: new Uint16Array(buf.buffer, buf.byteOffset + iv.off, iv.a.count);
	const name = p.material !== undefined ? json.materials[p.material]?.name : '';
	return { pos, idx, name };
});

const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
for (const d of primData)
	for (let i = 0; i < d.pos.length; i += 3)
		for (let k = 0; k < 3; k++) {
			const v = d.pos[i + k];
			if (v < mn[k]) mn[k] = v;
			if (v > mx[k]) mx[k] = v;
		}
const cell = Math.max(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]) / GRID;

// build output primitives
const outPos = [], outNrm = [], outIdx = [], outMat = [];
for (const d of primData) {
	const map = new Map();
	const cluster = new Uint32Array(d.pos.length / 3);
	const sums = [];
	for (let i = 0; i < cluster.length; i++) {
		const ix = Math.floor((d.pos[i * 3] - mn[0]) / cell);
		const iy = Math.floor((d.pos[i * 3 + 1] - mn[1]) / cell);
		const iz = Math.floor((d.pos[i * 3 + 2] - mn[2]) / cell);
		const key = ix + iy * 4096 + iz * 16777216;
		let c = map.get(key);
		if (c === undefined) { c = sums.length; map.set(key, c); sums.push([0, 0, 0, 0]); }
		cluster[i] = c;
		const s = sums[c];
		s[0] += d.pos[i * 3]; s[1] += d.pos[i * 3 + 1]; s[2] += d.pos[i * 3 + 2]; s[3]++;
	}
	const nv = sums.length;
	const np = new Float32Array(nv * 3);
	for (let c = 0; c < nv; c++) { np[c * 3] = sums[c][0] / sums[c][3]; np[c * 3 + 1] = sums[c][1] / sums[c][3]; np[c * 3 + 2] = sums[c][2] / sums[c][3]; }
	const tris = [], seen = new Set();
	for (let t = 0; t < d.idx.length; t += 3) {
		const a = cluster[d.idx[t]], b = cluster[d.idx[t + 1]], c = cluster[d.idx[t + 2]];
		if (a === b || b === c || a === c) continue;
		const key = [a, b, c].sort((x, y) => x - y).join(',');
		if (seen.has(key)) continue;
		seen.add(key);
		tris.push(a, b, c);
	}
	if (!tris.length) continue;
	// bbox of this primitive, to help identify trunk vs canopy when assigning
	let bmn = [Infinity, Infinity, Infinity], bmx = [-Infinity, -Infinity, -Infinity];
	for (let k = 0; k < np.length; k += 3) for (let j = 0; j < 3; j++) { if (np[k + j] < bmn[j]) bmn[j] = np[k + j]; if (np[k + j] > bmx[j]) bmx[j] = np[k + j]; }
	console.log(`  prim ${outPos.length}: mat=${d.name} verts=${nv} bbox=[${(bmx[0] - bmn[0]).toFixed(1)},${(bmx[1] - bmn[1]).toFixed(1)},${(bmx[2] - bmn[2]).toFixed(1)}]`);
	const ni = new Uint32Array(tris);
	const nrm = new Float32Array(nv * 3);
	for (let t = 0; t < ni.length; t += 3) {
		const a = ni[t], b = ni[t + 1], c = ni[t + 2];
		const ux = np[b * 3] - np[a * 3], uy = np[b * 3 + 1] - np[a * 3 + 1], uz = np[b * 3 + 2] - np[a * 3 + 2];
		const vx = np[c * 3] - np[a * 3], vy = np[c * 3 + 1] - np[a * 3 + 1], vz = np[c * 3 + 2] - np[a * 3 + 2];
		const x = uy * vz - uz * vy, y = uz * vx - ux * vz, z = ux * vy - uy * vx;
		for (const v of [a, b, c]) { nrm[v * 3] += x; nrm[v * 3 + 1] += y; nrm[v * 3 + 2] += z; }
	}
	for (let v = 0; v < nv; v++) { const l = Math.hypot(nrm[v * 3], nrm[v * 3 + 1], nrm[v * 3 + 2]) || 1; nrm[v * 3] /= l; nrm[v * 3 + 1] /= l; nrm[v * 3 + 2] /= l; }
	const colour = OVERRIDE ? OVERRIDE[outPos.length % OVERRIDE.length] : colourFor(d.name);
	outPos.push(np); outNrm.push(nrm); outIdx.push(ni); outMat.push(colour);
}

// assemble GLB
const pad4 = (n) => (n + 3) & ~3;
const bufferViews = [], accessors = [], materials = [], primitivesOut = [];
const chunks = [];
let offset = 0;
function pushBV(typedArr, target) {
	const bytes = Buffer.from(typedArr.buffer, typedArr.byteOffset, typedArr.byteLength);
	const bvOff = offset;
	bufferViews.push({ buffer: 0, byteOffset: bvOff, byteLength: bytes.length, target });
	chunks.push(bytes);
	offset = pad4(offset + bytes.length);
	if (offset > bvOff + bytes.length) chunks.push(Buffer.alloc(offset - bvOff - bytes.length));
	return bufferViews.length - 1;
}
for (let i = 0; i < outPos.length; i++) {
	const p = outPos[i], nrm = outNrm[i], idx = outIdx[i], col = outMat[i];
	let pmn = [Infinity, Infinity, Infinity], pmx = [-Infinity, -Infinity, -Infinity];
	for (let k = 0; k < p.length; k += 3) for (let j = 0; j < 3; j++) { if (p[k + j] < pmn[j]) pmn[j] = p[k + j]; if (p[k + j] > pmx[j]) pmx[j] = p[k + j]; }
	const bvP = pushBV(p, 34962);
	const aP = accessors.push({ bufferView: bvP, componentType: 5126, count: p.length / 3, type: 'VEC3', min: pmn, max: pmx }) - 1;
	const bvN = pushBV(nrm, 34962);
	const aN = accessors.push({ bufferView: bvN, componentType: 5126, count: nrm.length / 3, type: 'VEC3' }) - 1;
	const bvI = pushBV(idx, 34963);
	const aI = accessors.push({ bufferView: bvI, componentType: 5125, count: idx.length, type: 'SCALAR' }) - 1;
	const mat = materials.push({ pbrMetallicRoughness: { baseColorFactor: [...col, 1], metallicFactor: 0, roughnessFactor: 0.95 }, doubleSided: true }) - 1;
	primitivesOut.push({ attributes: { POSITION: aP, NORMAL: aN }, indices: aI, material: mat });
}
const binOut = Buffer.concat(chunks);
const outJson = {
	asset: { version: '2.0', generator: 'decimate-tree' },
	scene: 0, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }],
	meshes: [{ primitives: primitivesOut }], materials, accessors, bufferViews,
	buffers: [{ byteLength: binOut.length }]
};
let jsonBuf = Buffer.from(JSON.stringify(outJson));
jsonBuf = Buffer.concat([jsonBuf, Buffer.alloc(pad4(jsonBuf.length) - jsonBuf.length, 0x20)]);
const total = 12 + 8 + jsonBuf.length + 8 + binOut.length;
const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(total, 8);
const jh = Buffer.alloc(8); jh.writeUInt32LE(jsonBuf.length, 0); jh.writeUInt32LE(0x4e4f534a, 4);
const bh = Buffer.alloc(8); bh.writeUInt32LE(binOut.length, 0); bh.writeUInt32LE(0x004e4942, 4);
writeFileSync(outPath, Buffer.concat([header, jh, jsonBuf, bh, binOut]));
const verts = accessors.filter((a) => a.type === 'VEC3' && a.min).reduce((s, a) => s + a.count, 0);
console.log(`${outPath}: prims ${primitivesOut.length} verts ${verts} out ${(total / 1e6).toFixed(2)}MB`);
