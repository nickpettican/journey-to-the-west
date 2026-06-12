import type {
	Map as MlMap,
	FlyToOptions,
	JumpToOptions,
	FitBoundsOptions,
	LngLatBoundsLike
} from 'maplibre-gl';

export function prefersReducedMotion(): boolean {
	return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** flyTo that degrades to an instant jump under prefers-reduced-motion. */
export function flyTo(map: MlMap, options: FlyToOptions) {
	if (prefersReducedMotion()) {
		map.jumpTo(options as JumpToOptions);
	} else {
		map.flyTo({ speed: 0.9, curve: 1.4, ...options });
	}
}

export function fitBounds(map: MlMap, bounds: LngLatBoundsLike, options: FitBoundsOptions = {}) {
	map.fitBounds(bounds, { padding: 60, duration: prefersReducedMotion() ? 0 : 1400, ...options });
}
