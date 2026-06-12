import { base } from '$app/paths';
import type { FeatureCollection } from 'geojson';
import type { Pilgrim, PlaceDetail, Observation, Journey, PilgrimId, StopProperties } from '$lib/types';

const cache = new Map<string, Promise<unknown>>();

function fetchJson<T>(path: string): Promise<T> {
	if (!cache.has(path)) {
		cache.set(
			path,
			fetch(`${base}/data/${path}`).then((r) => {
				if (!r.ok) throw new Error(`failed to load ${path}: ${r.status}`);
				return r.json();
			})
		);
	}
	return cache.get(path) as Promise<T>;
}

export const loadPilgrims = () => fetchJson<Pilgrim[]>('pilgrims.json');
export const loadDetails = () => fetchJson<Record<string, PlaceDetail>>('details.json');
export const loadObservations = () => fetchJson<Observation[]>('observations.json');
export const loadJourney = (pid: PilgrimId) => fetchJson<Journey>(`journeys/${pid}.json`);

export async function loadPlacesMerged(): Promise<{
	collection: FeatureCollection;
	stops: StopProperties[];
}> {
	const parts = await Promise.all(
		(['faxian', 'xuanzang', 'yijing'] as const).map((p) =>
			fetchJson<FeatureCollection>(`places-${p}.geojson`)
		)
	);
	const features = parts.flatMap((fc) => fc.features);
	return {
		collection: { type: 'FeatureCollection', features },
		stops: features.map((f) => f.properties as unknown as StopProperties)
	};
}

export const routesUrl = () => `${base}/data/routes.geojson`;
export const regionsUrl = () => `${base}/data/regions.geojson`;
