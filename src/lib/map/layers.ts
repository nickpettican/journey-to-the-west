import type {
	Map as MlMap,
	ExpressionSpecification,
	FilterSpecification,
	GeoJSONSourceSpecification
} from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import { YANA_COLOURS, PILGRIM_COLOURS } from '$lib/data/colours';
import type { PilgrimId, Pilgrim } from '$lib/types';

export const PILGRIM_IDS: PilgrimId[] = ['faxian', 'xuanzang', 'yijing'];
export const FIELD_YANAS = ['Mahayana', 'Sravakayana', 'Vajrayana', 'non-Buddhist'] as const;

/** Distinct dash patterns per pilgrim — colour is never the only signal. */
const ROUTE_DASHES: Record<PilgrimId, number[]> = {
	faxian: [1, 0],
	xuanzang: [2.5, 1.2],
	yijing: [0.8, 1.6]
};

const yanaColourMatch = (): ExpressionSpecification => [
	'match',
	['get', 'yanaKey'],
	'Mahayana',
	YANA_COLOURS.Mahayana,
	'Sravakayana',
	YANA_COLOURS.Sravakayana,
	'Vajrayana',
	YANA_COLOURS.Vajrayana,
	'mixed',
	YANA_COLOURS.mixed,
	'non-Buddhist',
	YANA_COLOURS['non-Buddhist'],
	/* unknown */ YANA_COLOURS.unknown
];

/**
 * Adds all data sources and thematic layers used by the Map Explorer.
 * Year filtering / era dimming / layer visibility are applied afterwards via
 * applyYear / applyVisibility — adding and updating are kept separate so the
 * scrubber can update cheaply on every tick.
 */
export function addExplorerLayers(
	map: MlMap,
	places: FeatureCollection,
	urls: { routes: string; regions: string }
) {
	map.addSource('places', { type: 'geojson', data: places } as GeoJSONSourceSpecification);
	map.addSource('routes', { type: 'geojson', data: urls.routes });
	map.addSource('regions', { type: 'geojson', data: urls.regions });

	// --- yāna dominance fields: soft, overlapping, borderless. The honest way
	// to show "which vehicle where" from 210 points — no invented choropleth
	// borders. A place professing both vehicles feeds both fields.
	for (const yana of FIELD_YANAS) {
		const colour = YANA_COLOURS[yana];
		map.addLayer({
			id: `yana-field-${yana}`,
			type: 'heatmap',
			source: 'places',
			paint: {
				'heatmap-weight': [
					'min',
					1,
					['/', ['ln', ['+', ['coalesce', ['get', 'monks'], 100], 2]], 9]
				],
				'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 3, 30, 7, 80],
				'heatmap-intensity': 0.9,
				'heatmap-opacity': 0.28,
				'heatmap-color': [
					'interpolate',
					['linear'],
					['heatmap-density'],
					0,
					'rgba(0,0,0,0)',
					0.3,
					hexWithAlpha(colour, 0.35),
					1,
					colour
				]
			}
		});
	}

	// --- Yijing's testimony zones: fuzzy regions, not borders.
	map.addLayer({
		id: 'testimony-fill',
		type: 'fill',
		source: 'regions',
		paint: { 'fill-color': '#8a6d24', 'fill-opacity': 0.06 }
	});
	map.addLayer({
		id: 'testimony-line',
		type: 'line',
		source: 'regions',
		paint: {
			'line-color': '#8a6d24',
			'line-width': 1.4,
			'line-dasharray': [3, 3],
			'line-blur': 2,
			'line-opacity': 0.7
		}
	});
	map.addLayer({
		id: 'testimony-label',
		type: 'symbol',
		source: 'regions',
		layout: {
			'text-field': ['get', 'label'],
			'text-font': ['Noto Sans Italic'],
			'text-size': 13,
			'text-letter-spacing': 0.15,
			'text-transform': 'uppercase'
		},
		paint: {
			'text-color': '#8a6d24',
			'text-opacity': 0.85,
			'text-halo-color': '#f8f2e4',
			'text-halo-width': 1.2
		}
	});

	// --- routes, drawn forward in time by the scrubber.
	for (const pid of PILGRIM_IDS) {
		map.addLayer({
			id: `route-${pid}`,
			type: 'line',
			source: 'routes',
			filter: ['==', ['get', 'pilgrim'], pid],
			layout: { 'line-cap': 'round', 'line-join': 'round' },
			paint: {
				'line-color': PILGRIM_COLOURS[pid],
				'line-width': ['interpolate', ['linear'], ['zoom'], 3, 1.4, 8, 3],
				'line-opacity': 0.75,
				...(ROUTE_DASHES[pid][1] > 0 ? { 'line-dasharray': ROUTE_DASHES[pid] } : {})
			}
		});
	}

	// --- geoConfidence halo: the blurrier and wider, the less certain the
	// identification. Visible spatial honesty.
	map.addLayer({
		id: 'places-halo',
		type: 'circle',
		source: 'places',
		paint: {
			'circle-color': '#9a938a',
			'circle-blur': 1,
			'circle-opacity': 0.3,
			'circle-radius': [
				'+',
				placeRadius(),
				['match', ['get', 'geoConfidence'], 'high', 2, 'medium', 8, 14]
			]
		}
	});

	// --- the places themselves. Hearsay (reported, not visited) renders hollow.
	// A derived Vajrayāna never recolours a bubble: the fill stays the witnessed
	// yāna and the esoteric layer draws as a purple ring (the community is
	// triyāna — vinaya kept, Mahāyāna studied, mantra practised; see About).
	const derivedVajra = [
		'in',
		'Vajrayana',
		['get', 'yanaDerived']
	] as unknown as ExpressionSpecification;
	map.addLayer({
		id: 'places',
		type: 'circle',
		source: 'places',
		paint: {
			'circle-color': yanaColourMatch(),
			'circle-radius': placeRadius(),
			'circle-opacity': ['case', ['get', 'firsthand'], 0.92, 0],
			'circle-stroke-color': [
				'case',
				['get', 'firsthand'],
				['case', derivedVajra, YANA_COLOURS.Vajrayana, '#2a211a'],
				yanaColourMatch()
			],
			'circle-stroke-width': [
				'case',
				['get', 'firsthand'],
				['case', derivedVajra, 2.5, 0.8],
				2
			]
		}
	});

	// --- labels: featured places early, everything when zoomed in.
	const labelLayout = (textField: ExpressionSpecification) => ({
		'text-field': textField,
		'text-font': ['Noto Sans Regular'],
		'text-size': 12,
		'text-anchor': 'top' as const,
		'text-offset': [0, 0.9] as [number, number],
		'text-optional': true
	});
	const namesOnly: ExpressionSpecification = ['get', 'name'];
	const labelPaint = {
		'text-color': '#4d4136',
		'text-halo-color': '#f8f2e4',
		'text-halo-width': 1.4
	};
	map.addLayer({
		id: 'places-label-featured',
		type: 'symbol',
		source: 'places',
		minzoom: 5,
		filter: ['get', 'featured'],
		layout: labelLayout(namesOnly),
		paint: labelPaint
	});
	map.addLayer({
		id: 'places-label-rest',
		type: 'symbol',
		source: 'places',
		minzoom: 7,
		filter: ['!', ['get', 'featured']],
		layout: labelLayout(namesOnly),
		paint: labelPaint
	});
}

const placeRadius = (): ExpressionSpecification => [
	'interpolate',
	['linear'],
	['sqrt', ['coalesce', ['get', 'monks'], 0]],
	0,
	4.5,
	100,
	14
];

function hexWithAlpha(hex: string, alpha: number): string {
	const n = parseInt(hex.slice(1), 16);
	return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

export interface ExplorerFilters {
	year: number;
	pilgrims: Record<PilgrimId, boolean>;
	sect: string | null;
	showHearsay: boolean;
}

/**
 * Re-applies year/pilgrim/sect filters and era dimming. Cumulative reveal: a
 * place appears once its visit year passes and persists; places outside the
 * pilgrim journey containing the scrub year dim to 45% — knowledge
 * accumulating across three centuries.
 */
export function applyFilters(map: MlMap, f: ExplorerFilters, pilgrims: Pilgrim[]) {
	const enabledPilgrims = PILGRIM_IDS.filter((p) => f.pilgrims[p]);
	const baseConditions: FilterSpecification[] = [
		['<=', ['get', 'year'], f.year],
		['in', ['get', 'pilgrim'], ['literal', enabledPilgrims]]
	] as unknown as FilterSpecification[];
	if (!f.showHearsay) baseConditions.push(['get', 'firsthand'] as unknown as FilterSpecification);
	if (f.sect)
		baseConditions.push(['in', f.sect, ['get', 'sectKeys']] as unknown as FilterSpecification);
	const placeFilter = ['all', ...baseConditions] as FilterSpecification;

	const active = pilgrims.find(
		(p) => f.year >= p.journey.startYear && f.year <= p.journey.endYear
	)?.id;
	const eraDim: ExpressionSpecification = active
		? ['case', ['==', ['get', 'pilgrim'], active], 1, 0.45]
		: (['literal', 0.55] as unknown as ExpressionSpecification);

	map.setFilter('places', placeFilter);
	map.setFilter('places-halo', placeFilter);
	// label layers keep their featured/rest split alongside the shared filter
	map.setFilter('places-label-featured', [
		'all',
		['get', 'featured'],
		placeFilter
	] as FilterSpecification);
	map.setFilter('places-label-rest', [
		'all',
		['!', ['get', 'featured']],
		placeFilter
	] as FilterSpecification);
	map.setPaintProperty('places', 'circle-opacity', [
		'case',
		['get', 'firsthand'],
		['*', 0.92, eraDim],
		0
	]);
	map.setPaintProperty('places', 'circle-stroke-opacity', eraDim);

	for (const yana of FIELD_YANAS) {
		map.setFilter(`yana-field-${yana}`, [
			'all',
			['in', yana, ['get', 'yanaAll']],
			placeFilter
		] as FilterSpecification);
	}

	for (const pid of PILGRIM_IDS) {
		map.setFilter(`route-${pid}`, [
			'all',
			['==', ['get', 'pilgrim'], pid],
			['<=', ['get', 'toYear'], f.year]
		] as FilterSpecification);
		map.setLayoutProperty(
			`route-${pid}`,
			'visibility',
			f.pilgrims[pid] ? 'visible' : 'none'
		);
	}
}

export interface LayerToggles {
	yanaFields: boolean;
	testimony: boolean;
	routes: boolean;
	modernNames: boolean;
}

export function applyToggles(map: MlMap, t: LayerToggles) {
	const vis = (on: boolean) => (on ? 'visible' : 'none');
	for (const yana of FIELD_YANAS) {
		map.setLayoutProperty(`yana-field-${yana}`, 'visibility', vis(t.yanaFields));
	}
	for (const id of ['testimony-fill', 'testimony-line', 'testimony-label']) {
		map.setLayoutProperty(id, 'visibility', vis(t.testimony));
	}
	for (const pid of PILGRIM_IDS) {
		map.setLayoutProperty(`route-${pid}`, 'visibility', vis(t.routes));
	}
	const nameField: ExpressionSpecification = t.modernNames
		? [
				'case',
				['!=', ['coalesce', ['get', 'modernName'], ''], ''],
				['concat', ['get', 'name'], ' · ', ['get', 'modernName']],
				['get', 'name']
			]
		: ['get', 'name'];
	for (const id of ['places-label-featured', 'places-label-rest']) {
		map.setLayoutProperty(id, 'text-field', nameField);
	}
}
