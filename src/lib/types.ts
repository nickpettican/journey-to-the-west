/** Types mirroring the artefacts produced by scripts/build-data.mjs. */

export type PilgrimId = 'faxian' | 'xuanzang' | 'yijing';

export type GeoConfidence = 'high' | 'medium' | 'low' | 'unknown';

export interface Pilgrim {
	id: PilgrimId;
	name: string;
	nameVariants: string[];
	journey: { startYear: number; endYear: number };
	origin: string;
	bio: string;
	source: { work: string; translator: string; year: number };
	colour: string;
}

/** Lean per-place properties carried by places-*.geojson features and journey stops. */
export interface StopProperties {
	id: string;
	canonicalId: string;
	pilgrim: PilgrimId;
	sequence: number;
	name: string;
	year: number;
	yearInterpolated: boolean;
	yanaKey: string;
	yanaAll: string[];
	yanaDerived: string[];
	sectKeys: string[];
	sectDerived: string[];
	typePrimary: string;
	types: string[];
	geoConfidence: GeoConfidence;
	firsthand: boolean;
	monks: number | null;
	monksEstimated: boolean;
	monksText: string | null;
	monasteries: number | null;
	modernName: string | null;
	hasAnecdotes: boolean;
	anecdoteCount: number;
	featured: boolean;
	pilgrimCount: number;
}

export interface JourneyStop extends StopProperties {
	lon: number;
	lat: number;
	camera: { center: [number, number]; zoom: number };
	activity: string | null;
	quote: string;
	ref: string;
	bestAnecdote: { title: string; kind: string; summary: string } | null;
}

export interface JourneyChapter {
	id: string;
	title: string;
	bbox: [number, number, number, number];
	stops: JourneyStop[];
}

export interface Journey {
	pilgrim: PilgrimId;
	name: string;
	years: { startYear: number; endYear: number };
	bio: string;
	sourceWork: { work: string; translator: string; year: number };
	chapters: JourneyChapter[];
}

/** Full place entry, faithful to the extraction schema (used in details.json visits). */
export interface PlaceEntry {
	id: string;
	pilgrim: string;
	sequence: number;
	canonicalId: string;
	names: { primary: string; asGiven: string; variants: string[] };
	type: string[];
	firsthand: boolean;
	yana: string[];
	/** Pipeline-derived yāna keys (e.g. Vajrayana at Udyāna/Nālandā) — never the pilgrim's words. */
	yanaDerived?: string[];
	sect: string[];
	monasteries: { count: number | null; text: string | null; approx: boolean };
	monks: { count: number | null; text: string | null; approx: boolean };
	activity: string | null;
	anecdotes: Anecdote[];
	features: string[];
	figures: string[];
	route: { fromPlace: string | null; directionFromPrev: string | null; distance: string | null };
	date: {
		year: number | null;
		yearEarliest: number | null;
		yearLatest: number | null;
		approx: boolean;
		text: string | null;
		basis: string | null;
	};
	scholarlyNotes: {
		modernName: string | null;
		coordinates: { lat: number; lon: number; note: string | null };
		geoConfidence: GeoConfidence;
		notes: string | null;
	};
	source: { work: string; ref: string; quote: string };
	supplementarySources?: { work: string; ref: string; quote: string; note?: string | null }[];
}

export interface Anecdote {
	title: string;
	kind: 'jataka' | 'miracle' | 'relic' | 'historical' | 'legend' | 'other';
	summary: string;
	figures: string[];
}

export interface CanonicalPlace {
	canonicalId: string;
	name: string;
	modernName: string | null;
	region: string | null;
	type: string[];
	coordinates: { lat: number; lon: number; geoConfidence: GeoConfidence; basis?: string };
	reconciledYana: string[];
	reconciledSect: string[];
	pilgrimCount: number;
	traditionNote: string | null;
	visitedBy: {
		pilgrim: string;
		placeId: string;
		sequence: number;
		firsthand?: boolean;
		year: number | null;
		yana?: string[];
		sect?: string[];
	}[];
}

export interface PlaceDetail {
	canonical: CanonicalPlace;
	visits: PlaceEntry[];
}

export interface Observation {
	id: string;
	topic: string;
	region: string;
	regionIds: string[];
	claim: string;
	yana: string[];
	sect: string[];
	source: { work: string; ref: string; quote: string };
}
