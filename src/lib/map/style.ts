import type { StyleSpecification } from 'maplibre-gl';

/**
 * Historical basemap style: parchment land, celadon water, sepia hillshade.
 * Entirely self-hosted (Natural Earth GeoJSON + local glyphs) except the
 * optional keyless AWS Terrarium elevation tiles, which are a progressive
 * enhancement — the map is complete without them.
 *
 * Nothing modern appears at any zoom: no borders, no roads, no modern labels.
 * The pilgrims travelled 399–695 CE.
 */
export function buildStyle(base: string): StyleSpecification {
	return {
		version: 8,
		glyphs: `${base}/glyphs/{fontstack}/{range}.pbf`,
		sources: {
			land: { type: 'geojson', data: `${base}/basemap/land.json` },
			lakes: { type: 'geojson', data: `${base}/basemap/lakes.json` },
			rivers: { type: 'geojson', data: `${base}/basemap/rivers.json` },
			'terrain-dem': {
				type: 'raster-dem',
				encoding: 'terrarium',
				tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
				tileSize: 256,
				maxzoom: 11
			}
		},
		layers: [
			{
				id: 'background',
				type: 'background',
				paint: { 'background-color': '#dde3da' } // muted celadon sea
			},
			{
				id: 'land-fill',
				type: 'fill',
				source: 'land',
				paint: { 'fill-color': '#ede3cb' }
			},
			{
				id: 'hillshade',
				type: 'hillshade',
				source: 'terrain-dem',
				paint: {
					'hillshade-exaggeration': 0.25,
					'hillshade-shadow-color': '#8b7355',
					'hillshade-highlight-color': '#fdf6e3',
					'hillshade-accent-color': '#a08a64'
				}
			},
			{
				id: 'lakes-fill',
				type: 'fill',
				source: 'lakes',
				paint: { 'fill-color': '#c9d6cf' }
			},
			{
				id: 'rivers-line',
				type: 'line',
				source: 'rivers',
				minzoom: 4.5,
				paint: {
					'line-color': '#b3c4ba',
					'line-width': ['interpolate', ['linear'], ['zoom'], 4.5, 0.5, 9, 1.6],
					'line-opacity': 0.9
				}
			},
			{
				id: 'coastline',
				type: 'line',
				source: 'land',
				paint: {
					'line-color': '#8b7b5e',
					'line-width': 0.8,
					'line-opacity': 0.7
				}
			}
		]
	};
}
