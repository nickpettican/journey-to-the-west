import * as THREE from 'three';

export interface TreeLoaderCtx {
	scene: THREE.Scene;
	renderer: THREE.WebGLRenderer;
	isDisposed: () => boolean;
}

/**
 * Shared foliage-GLB loaders for the 3D tours (Nālandā and Bodh Gayā). Two
 * placement modes, both keeping the model's own flat low-poly materials:
 *   loadTreeModel  — one tree, keeps its scene graph, can be sunk into the
 *                    ground and swaps out a placeholder;
 *   scatterSpecies — many trees baked into instanced meshes (a few draw calls
 *                    for a whole grove), with an optional uniform sink.
 */
export function createTreeLoaders({ scene, renderer, isDisposed }: TreeLoaderCtx) {
	/** Load a foliage/scene GLB keeping its own (flat, low-poly) materials;
	 *  normalise it to a target height and drop it, base on the ground (or sunk
	 *  by `sink`), removing a placeholder once it is in. One tree per call. */
	function loadTreeModel(
		url: string,
		opts: {
			x: number;
			z: number;
			height: number;
			yaw?: number;
			sink?: number;
			placeholder?: THREE.Object3D;
		}
	) {
		import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
			if (isDisposed()) return;
			new GLTFLoader().load(url, (gltf) => {
				if (isDisposed()) return;
				const model = gltf.scene;
				model.traverse((o) => {
					const m = o as THREE.Mesh;
					if (m.isMesh) {
						m.castShadow = true;
						m.receiveShadow = true;
					}
				});
				model.rotation.y = opts.yaw ?? 0;
				const box = new THREE.Box3().setFromObject(model);
				const size = box.getSize(new THREE.Vector3());
				model.scale.setScalar(opts.height / size.y);
				box.setFromObject(model);
				const centre = box.getCenter(new THREE.Vector3());
				model.position.x += opts.x - centre.x;
				model.position.z += opts.z - centre.z;
				model.position.y += -box.min.y - (opts.sink ?? 0);
				scene.add(model);
				opts.placeholder?.parent?.remove(opts.placeholder);
				renderer.shadowMap.needsUpdate = true;
			});
		});
	}

	/** Scatter a GLB across many positions as instanced meshes (one per
	 *  primitive) — a few draw calls for the whole grove. spots are
	 *  [x, z, height, yaw]; an optional uniform sink, and an optional material
	 *  override (else each primitive keeps its own flat low-poly material). */
	function scatterSpecies(
		url: string,
		spots: [number, number, number, number][],
		opts: { sink?: number; material?: THREE.Material } = {}
	) {
		if (!spots.length) return;
		import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
			if (isDisposed()) return;
			new GLTFLoader().load(url, (gltf) => {
				if (isDisposed()) return;
				gltf.scene.updateMatrixWorld(true);
				const prims: { g: THREE.BufferGeometry; m: THREE.Material }[] = [];
				const bb = new THREE.Box3();
				gltf.scene.traverse((o) => {
					const me = o as THREE.Mesh;
					if (!me.isMesh) return;
					const g = me.geometry.clone();
					g.applyMatrix4(me.matrixWorld);
					g.computeBoundingBox();
					bb.union(g.boundingBox!);
					prims.push({ g, m: me.material as THREE.Material });
				});
				if (!prims.length) return;
				const size = bb.getSize(new THREE.Vector3());
				const ctr = bb.getCenter(new THREE.Vector3());
				const invH = 1 / (size.y || 1);
				const norm = new THREE.Matrix4().makeTranslation(-ctr.x, -bb.min.y, -ctr.z);
				for (const p of prims) {
					p.g.applyMatrix4(norm);
					p.g.scale(invH, invH, invH); // unit height, base at y=0, centred
				}
				const up = new THREE.Vector3(0, 1, 0);
				const sink = opts.sink ?? 0;
				const mats = spots.map(([x, z, h, yaw]) =>
					new THREE.Matrix4().compose(
						new THREE.Vector3(x, -sink, z),
						new THREE.Quaternion().setFromAxisAngle(up, yaw),
						new THREE.Vector3(h, h, h)
					)
				);
				for (const p of prims) {
					const im = new THREE.InstancedMesh(p.g, opts.material ?? p.m, spots.length);
					mats.forEach((m, i) => im.setMatrixAt(i, m));
					im.instanceMatrix.needsUpdate = true;
					im.castShadow = true;
					im.receiveShadow = true;
					scene.add(im);
				}
				renderer.shadowMap.needsUpdate = true;
			});
		});
	}

	return { loadTreeModel, scatterSpecies };
}
