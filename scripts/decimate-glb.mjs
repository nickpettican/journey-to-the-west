// Multi-mesh vertex-clustering decimator (no deps): merges all primitives,
// bakes node-hierarchy transforms, clusters on a grid, recomputes normals.
// Usage: node decimate-glb2.mjs <in.glb> <out.glb> <gridCells>
import { readFileSync, writeFileSync } from 'node:fs';

const [inPath, outPath, gridArg] = process.argv.slice(2);
const GRID = Number(gridArg ?? 120);

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

// --- minimal mat4 (column-major not needed; use row-major 3x3 + t)
function matFromTRS(node) {
	if (node.matrix) {
		// glTF matrices are column-major
		const m = node.matrix;
		return {
			r: [m[0], m[4], m[8], m[1], m[5], m[9], m[2], m[6], m[10]],
			t: [m[12], m[13], m[14]]
		};
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
	// A ∘ B (apply B first)
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

// gather primitives with world transforms
const prims = [];
function walk(nodeIdx, parent) {
	const node = json.nodes[nodeIdx];
	const world = matMul(parent, matFromTRS(node));
	if (node.mesh !== undefined) {
		for (const p of json.meshes[node.mesh].primitives) prims.push({ p, world });
	}
	for (const c of node.children ?? []) walk(c, world);
}
for (const root of json.scenes[json.scene ?? 0].nodes) walk(root, IDENT);

// merge all positions + indices
let totalV = 0;
let totalI = 0;
for (const { p } of prims) {
	totalV += json.accessors[p.attributes.POSITION].count;
	totalI += json.accessors[p.indices].count;
}
const pos = new Float32Array(totalV * 3);
const idx = new Uint32Array(totalI);
let vOff = 0;
let iOff = 0;
for (const { p, world } of prims) {
	const pv = accView(p.attributes.POSITION);
	const src = new Float32Array(buf.buffer, buf.byteOffset + pv.off, pv.a.count * 3);
	const { r, t } = world;
	for (let i = 0; i < pv.a.count; i++) {
		const x = src[i * 3], y = src[i * 3 + 1], z = src[i * 3 + 2];
		pos[(vOff + i) * 3] = r[0] * x + r[1] * y + r[2] * z + t[0];
		pos[(vOff + i) * 3 + 1] = r[3] * x + r[4] * y + r[5] * z + t[1];
		pos[(vOff + i) * 3 + 2] = r[6] * x + r[7] * y + r[8] * z + t[2];
	}
	const iv = accView(p.indices);
	const ctype = iv.a.componentType;
	const srcIdx =
		ctype === 5125
			? new Uint32Array(buf.buffer, buf.byteOffset + iv.off, iv.a.count)
			: new Uint16Array(buf.buffer, buf.byteOffset + iv.off, iv.a.count);
	for (let i = 0; i < iv.a.count; i++) idx[iOff + i] = srcIdx[i] + vOff;
	vOff += pv.a.count;
	iOff += iv.a.count;
}

// --- cluster (same as v1)
const mn = [Infinity, Infinity, Infinity];
const mx = [-Infinity, -Infinity, -Infinity];
for (let i = 0; i < pos.length; i += 3) {
	for (let k = 0; k < 3; k++) {
		const v = pos[i + k];
		if (v < mn[k]) mn[k] = v;
		if (v > mx[k]) mx[k] = v;
	}
}
const span = Math.max(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]);
const cell = span / GRID;
const map = new Map();
const cluster = new Uint32Array(totalV);
const sums = [];
for (let i = 0; i < totalV; i++) {
	const ix = Math.floor((pos[i * 3] - mn[0]) / cell);
	const iy = Math.floor((pos[i * 3 + 1] - mn[1]) / cell);
	const iz = Math.floor((pos[i * 3 + 2] - mn[2]) / cell);
	const key = ix + iy * 4096 + iz * 16777216;
	let c = map.get(key);
	if (c === undefined) {
		c = sums.length;
		map.set(key, c);
		sums.push([0, 0, 0, 0]);
	}
	cluster[i] = c;
	const s = sums[c];
	s[0] += pos[i * 3];
	s[1] += pos[i * 3 + 1];
	s[2] += pos[i * 3 + 2];
	s[3]++;
}
const nv = sums.length;
const newPos = new Float32Array(nv * 3);
for (let c = 0; c < nv; c++) {
	newPos[c * 3] = sums[c][0] / sums[c][3];
	newPos[c * 3 + 1] = sums[c][1] / sums[c][3];
	newPos[c * 3 + 2] = sums[c][2] / sums[c][3];
}
const tris = [];
const seen = new Set();
for (let t = 0; t < idx.length; t += 3) {
	const a = cluster[idx[t]];
	const b = cluster[idx[t + 1]];
	const c = cluster[idx[t + 2]];
	if (a === b || b === c || a === c) continue;
	const key = [a, b, c].sort((x, y) => x - y).join(',');
	if (seen.has(key)) continue;
	seen.add(key);
	tris.push(a, b, c);
}
const newIdx = new Uint32Array(tris);
const nrm = new Float32Array(nv * 3);
for (let t = 0; t < newIdx.length; t += 3) {
	const [a, b, c] = [newIdx[t], newIdx[t + 1], newIdx[t + 2]];
	const ax = newPos[a * 3], ay = newPos[a * 3 + 1], az = newPos[a * 3 + 2];
	const ux = newPos[b * 3] - ax, uy = newPos[b * 3 + 1] - ay, uz = newPos[b * 3 + 2] - az;
	const vx = newPos[c * 3] - ax, vy = newPos[c * 3 + 1] - ay, vz = newPos[c * 3 + 2] - az;
	const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
	for (const v of [a, b, c]) {
		nrm[v * 3] += nx;
		nrm[v * 3 + 1] += ny;
		nrm[v * 3 + 2] += nz;
	}
}
for (let v = 0; v < nv; v++) {
	const l = Math.hypot(nrm[v * 3], nrm[v * 3 + 1], nrm[v * 3 + 2]) || 1;
	nrm[v * 3] /= l;
	nrm[v * 3 + 1] /= l;
	nrm[v * 3 + 2] /= l;
}
const nmn = [Infinity, Infinity, Infinity];
const nmx = [-Infinity, -Infinity, -Infinity];
for (let i = 0; i < newPos.length; i += 3) {
	for (let k = 0; k < 3; k++) {
		const v = newPos[i + k];
		if (v < nmn[k]) nmn[k] = v;
		if (v > nmx[k]) nmx[k] = v;
	}
}
const pad4 = (n) => (n + 3) & ~3;
const posBytes = Buffer.from(newPos.buffer, 0, newPos.byteLength);
const nrmBytes = Buffer.from(nrm.buffer, 0, nrm.byteLength);
const idxBytes = Buffer.from(newIdx.buffer, 0, newIdx.byteLength);
const o1 = 0, o2 = pad4(o1 + posBytes.length), o3 = pad4(o2 + nrmBytes.length);
const binLen = pad4(o3 + idxBytes.length);
const binOut = Buffer.alloc(binLen);
posBytes.copy(binOut, o1);
nrmBytes.copy(binOut, o2);
idxBytes.copy(binOut, o3);
const outJson = {
	asset: { version: '2.0', generator: 'decimate-glb2' },
	scene: 0,
	scenes: [{ nodes: [0] }],
	nodes: [{ mesh: 0 }],
	meshes: [{ primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: 0 }] }],
	materials: [{ pbrMetallicRoughness: { baseColorFactor: [0.76, 0.63, 0.3, 1], metallicFactor: 0.2, roughnessFactor: 0.6 } }],
	accessors: [
		{ bufferView: 0, componentType: 5126, count: nv, type: 'VEC3', min: nmn, max: nmx },
		{ bufferView: 1, componentType: 5126, count: nv, type: 'VEC3' },
		{ bufferView: 2, componentType: 5125, count: newIdx.length, type: 'SCALAR' }
	],
	bufferViews: [
		{ buffer: 0, byteOffset: o1, byteLength: posBytes.length, target: 34962 },
		{ buffer: 0, byteOffset: o2, byteLength: nrmBytes.length, target: 34962 },
		{ buffer: 0, byteOffset: o3, byteLength: idxBytes.length, target: 34963 }
	],
	buffers: [{ byteLength: binLen }]
};
let jsonBuf = Buffer.from(JSON.stringify(outJson));
const jsonPad = pad4(jsonBuf.length);
jsonBuf = Buffer.concat([jsonBuf, Buffer.alloc(jsonPad - jsonBuf.length, 0x20)]);
const total = 12 + 8 + jsonBuf.length + 8 + binLen;
const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(total, 8);
const jsonChunkH = Buffer.alloc(8);
jsonChunkH.writeUInt32LE(jsonBuf.length, 0);
jsonChunkH.writeUInt32LE(0x4e4f534a, 4);
const binChunkH = Buffer.alloc(8);
binChunkH.writeUInt32LE(binLen, 0);
binChunkH.writeUInt32LE(0x004e4942, 4);
writeFileSync(outPath, Buffer.concat([header, jsonChunkH, jsonBuf, binChunkH, binOut]));
console.log('verts', nv, 'tris', newIdx.length / 3, 'out MB', (total / 1e6).toFixed(2));
