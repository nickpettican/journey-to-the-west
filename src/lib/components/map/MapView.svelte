<script lang="ts">
	import maplibregl from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { buildStyle } from '$lib/map/style';

	let {
		center = [80, 24] as [number, number],
		zoom = 4,
		minZoom = 2,
		maxZoom = 11,
		interactive = true,
		navControl = true,
		label = 'Map of the Indian subcontinent and the pilgrim routes',
		onready
	}: {
		center?: [number, number];
		zoom?: number;
		minZoom?: number;
		maxZoom?: number;
		interactive?: boolean;
		navControl?: boolean;
		label?: string;
		onready?: (map: maplibregl.Map) => void;
	} = $props();

	let container: HTMLDivElement;

	onMount(() => {
		const map = new maplibregl.Map({
			container,
			style: buildStyle(base),
			center,
			zoom,
			minZoom,
			maxZoom,
			attributionControl: false
		});
		map.addControl(
			new maplibregl.AttributionControl({
				compact: true,
				customAttribution: 'Basemap: Natural Earth · Relief: Mapzen/AWS terrain tiles'
			})
		);
		if (interactive && navControl) {
			map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
		}
		// The hillshade source is a progressive enhancement; swallow its tile
		// errors (offline, blocked, etc.) so they never surface to the console
		// as failures.
		map.on('error', (e) => {
			const sourceId = (e as unknown as { sourceId?: string }).sourceId;
			if (sourceId === 'terrain-dem') return;
			if (e.error) console.warn('map error:', e.error.message);
		});
		map.on('load', () => onready?.(map));
		return () => map.remove();
	});
</script>

<div bind:this={container} class="map" role="application" aria-label={label}></div>

<style>
	.map {
		position: absolute;
		inset: 0;
		background: var(--paper-deep);
	}

	.map :global(.maplibregl-ctrl-attrib) {
		font-size: 0.65rem;
		background: color-mix(in srgb, var(--paper) 75%, transparent);
	}
</style>
