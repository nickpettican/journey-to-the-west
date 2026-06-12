import type { Map as MlMap, GeoJSONSource } from 'maplibre-gl';
import { flyTo, fitBounds } from '$lib/map/camera';
import { PILGRIM_COLOURS } from '$lib/data/colours';
import type { JourneyStop, JourneyChapter, PilgrimId } from '$lib/types';

/**
 * Owns the map side of a scrollytelling journey page: the route layers, the
 * progressive route reveal, and the camera contract (discrete flights per
 * stop — never a scrub-tied camera, which judders).
 */
export class ScrollyDirector {
	constructor(
		private map: MlMap,
		private pilgrim: PilgrimId
	) {}

	addLayers(routesUrl: string) {
		const colour = PILGRIM_COLOURS[this.pilgrim];
		this.map.addSource('journey-routes', { type: 'geojson', data: routesUrl });
		this.map.addSource('journey-stop', {
			type: 'geojson',
			data: { type: 'FeatureCollection', features: [] }
		});

		// full route, faint — where the journey will go
		this.map.addLayer({
			id: 'journey-route-bg',
			type: 'line',
			source: 'journey-routes',
			filter: ['==', ['get', 'pilgrim'], this.pilgrim],
			layout: { 'line-cap': 'round' },
			paint: {
				'line-color': '#8b7b5e',
				'line-width': 1.2,
				'line-dasharray': [1, 2.5],
				'line-opacity': 0.5
			}
		});
		// the ink line that draws itself as the reader scrolls
		this.map.addLayer({
			id: 'journey-route-progress',
			type: 'line',
			source: 'journey-routes',
			filter: ['==', ['get', 'pilgrim'], '__none__'],
			layout: { 'line-cap': 'round', 'line-join': 'round' },
			paint: {
				'line-color': colour,
				'line-width': ['interpolate', ['linear'], ['zoom'], 3, 2, 8, 3.6],
				'line-opacity': 0.9
			}
		});
		// the pilgrim's current position
		this.map.addLayer({
			id: 'journey-stop-halo',
			type: 'circle',
			source: 'journey-stop',
			paint: {
				'circle-radius': 14,
				'circle-color': colour,
				'circle-opacity': 0.25,
				'circle-blur': 0.6
			}
		});
		this.map.addLayer({
			id: 'journey-stop-dot',
			type: 'circle',
			source: 'journey-stop',
			paint: {
				'circle-radius': 6,
				'circle-color': colour,
				'circle-stroke-color': '#f8f2e4',
				'circle-stroke-width': 2
			}
		});
	}

	/** Discrete flight to a stop; the route line catches up to its year. */
	goToStop(stop: JourneyStop) {
		this.map.setFilter('journey-route-progress', [
			'all',
			['==', ['get', 'pilgrim'], this.pilgrim],
			['<=', ['get', 'toYear'], stop.year]
		]);
		(this.map.getSource('journey-stop') as GeoJSONSource | undefined)?.setData({
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [stop.lon, stop.lat] },
					properties: {}
				}
			]
		});
		flyTo(this.map, { center: stop.camera.center, zoom: stop.camera.zoom });
	}

	/** Regional overview when a chapter heading enters. */
	fitChapter(chapter: JourneyChapter) {
		fitBounds(this.map, chapter.bbox as [number, number, number, number]);
	}
}
