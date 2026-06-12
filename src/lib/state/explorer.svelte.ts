import type { PilgrimId } from '$lib/types';

export interface ExplorerSnapshot {
	year: number;
	yanaFields: boolean;
	testimony: boolean;
	routes: boolean;
	modernNames: boolean;
	showHearsay: boolean;
	pilgrims: Record<PilgrimId, boolean>;
	sect: string | null;
	place: string | null;
}

const DEFAULTS: ExplorerSnapshot = {
	year: 645,
	yanaFields: true,
	testimony: true,
	routes: true,
	modernNames: false,
	showHearsay: false,
	pilgrims: { faxian: true, xuanzang: true, yijing: true },
	sect: null,
	place: null
};

/** URL-synced explorer state: every map view is shareable. */
export class ExplorerState {
	year = $state(DEFAULTS.year);
	yanaFields = $state(DEFAULTS.yanaFields);
	testimony = $state(DEFAULTS.testimony);
	routes = $state(DEFAULTS.routes);
	modernNames = $state(DEFAULTS.modernNames);
	showHearsay = $state(DEFAULTS.showHearsay);
	pilgrims = $state({ ...DEFAULTS.pilgrims });
	sect = $state<string | null>(DEFAULTS.sect);
	place = $state<string | null>(DEFAULTS.place);

	readFrom(params: URLSearchParams) {
		const year = Number(params.get('year'));
		if (Number.isFinite(year) && year >= 399 && year <= 695) this.year = year;
		const layers = params.get('layers');
		if (layers !== null) {
			const on = new Set(layers.split(','));
			this.yanaFields = on.has('yana');
			this.testimony = on.has('testimony');
			this.routes = on.has('routes');
			this.modernNames = on.has('modern');
			this.showHearsay = !on.has('nohearsay');
		}
		const pilgrims = params.get('pilgrims');
		if (pilgrims !== null) {
			const on = new Set(pilgrims.split(','));
			for (const p of ['faxian', 'xuanzang', 'yijing'] as PilgrimId[]) {
				this.pilgrims[p] = on.has(p);
			}
		}
		this.sect = params.get('sect');
		this.place = params.get('place');
	}

	toParams(): URLSearchParams {
		const params = new URLSearchParams();
		if (this.year !== DEFAULTS.year) params.set('year', String(this.year));
		const layers: string[] = [];
		if (this.yanaFields) layers.push('yana');
		if (this.testimony) layers.push('testimony');
		if (this.routes) layers.push('routes');
		if (this.modernNames) layers.push('modern');
		if (!this.showHearsay) layers.push('nohearsay');
		const defaultLayers = ['yana', 'routes'].join(',');
		if (layers.join(',') !== defaultLayers) params.set('layers', layers.join(','));
		const enabled = (['faxian', 'xuanzang', 'yijing'] as PilgrimId[]).filter(
			(p) => this.pilgrims[p]
		);
		if (enabled.length < 3) params.set('pilgrims', enabled.join(','));
		if (this.sect) params.set('sect', this.sect);
		if (this.place) params.set('place', this.place);
		return params;
	}
}
