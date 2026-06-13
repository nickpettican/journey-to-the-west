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

	addLayers(routesUrl: string, stops: JourneyStop[]) {
		const colour = PILGRIM_COLOURS[this.pilgrim];
		this.map.addSource('journey-routes', { type: 'geojson', data: routesUrl });
		this.map.addSource('journey-stop', {
			type: 'geojson',
			data: { type: 'FeatureCollection', features: [] }
		});
		// every stop on the road, for the cumulative trail of place-names
		this.map.addSource('journey-labels', {
			type: 'geojson',
			data: {
				type: 'FeatureCollection',
				features: stops.map((s) => ({
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [s.lon, s.lat] },
					properties: { id: s.id, name: s.name, year: s.year }
				}))
			}
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
		// the trail of names behind the pilgrim: revealed cumulatively, subdued,
		// and yielding to the current label and to each other on collision.
		this.map.addLayer({
			id: 'journey-trail-label',
			type: 'symbol',
			source: 'journey-labels',
			filter: ['==', ['get', 'id'], '__none__'],
			layout: {
				'text-field': ['get', 'name'],
				'text-font': ['Noto Sans Regular'],
				'text-size': 12,
				'text-anchor': 'top',
				'text-offset': [0, 0.9],
				'text-optional': true
			},
			paint: {
				'text-color': '#4d4136',
				'text-opacity': 0.7,
				'text-halo-color': '#f8f2e4',
				'text-halo-width': 1.4
			}
		});
		// the current stop's name: pilgrim-coloured, always shown (never collided away).
		this.map.addLayer({
			id: 'journey-stop-label',
			type: 'symbol',
			source: 'journey-stop',
			layout: {
				'text-field': ['get', 'name'],
				'text-font': ['Noto Sans Regular'],
				'text-size': 14,
				'text-anchor': 'top',
				'text-offset': [0, 1.1],
				'text-allow-overlap': true
			},
			paint: {
				'text-color': colour,
				'text-halo-color': '#f8f2e4',
				'text-halo-width': 1.6
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
					properties: { name: stop.name }
				}
			]
		});
		// reveal the trail of names up to here, minus the current stop (its own
		// pilgrim-coloured label owns that spot).
		this.map.setFilter('journey-trail-label', [
			'all',
			['<=', ['get', 'year'], stop.year],
			['!=', ['get', 'id'], stop.id]
		]);
		flyTo(this.map, { center: stop.camera.center, zoom: stop.camera.zoom });
	}

	/** Regional overview when a chapter heading enters. */
	fitChapter(chapter: JourneyChapter) {
		fitBounds(this.map, chapter.bbox as [number, number, number, number]);
	}
}
