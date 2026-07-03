<script lang="ts">
	import maplibregl from 'maplibre-gl';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { replaceState } from '$app/navigation';
	import { browser } from '$app/environment';
	import MapView from '$lib/components/map/MapView.svelte';
	import Legend from '$lib/components/map/Legend.svelte';
	import LayerControls from '$lib/components/map/LayerControls.svelte';
	import TimelineScrubber from '$lib/components/timeline/TimelineScrubber.svelte';
	import PlaceDetailPanel from '$lib/components/place/PlaceDetailPanel.svelte';
	import { ExplorerState } from '$lib/state/explorer.svelte';
	import { addExplorerLayers, applyFilters, applyToggles } from '$lib/map/layers';
	import {
		loadPilgrims,
		loadPlacesMerged,
		loadDetails,
		loadObservations,
		routesUrl,
		regionsUrl
	} from '$lib/data/load';
	import { SECT_LABELS, YANA_LABELS, PILGRIM_NAMES } from '$lib/data/labels';
	import type { Pilgrim, StopProperties, PlaceDetail, Observation } from '$lib/types';

	const s = new ExplorerState();

	let map: maplibregl.Map | undefined = $state();
	let layersReady = $state(false);
	let pilgrims: Pilgrim[] = $state([]);
	let stops: StopProperties[] = $state([]);
	let detail: PlaceDetail | null = $state(null);
	let observations: Observation[] = $state([]);
	let testimonyRegion: { id: string; name: string } | null = $state(null);
	let listView = $state(false);
	// layers & filters take too much screen on phones — collapsed by default,
	// opened on wider screens in onMount (so mobile never flashes it expanded)
	let controlsOpen = $state(false);

	const sects = $derived(
		[...new Set(stops.flatMap((p) => p.sectKeys))].sort((a, b) => a.localeCompare(b))
	);

	onMount(() => {
		controlsOpen = !window.matchMedia('(max-width: 640px)').matches;
		s.readFrom(new URLSearchParams(window.location.search));
		loadPilgrims().then((p) => (pilgrims = p));
		loadObservations().then((o) => (observations = o));
	});

	async function onMapReady(m: maplibregl.Map) {
		const { collection, stops: loaded } = await loadPlacesMerged();
		stops = loaded;
		addExplorerLayers(m, collection, { routes: routesUrl(), regions: regionsUrl() });

		const hoverPopup = new maplibregl.Popup({
			closeButton: false,
			closeOnClick: false,
			offset: 12,
			className: 'hover-popup'
		});
		m.on('mouseenter', 'places', (e) => {
			m.getCanvas().style.cursor = 'pointer';
			const f = e.features?.[0];
			if (!f) return;
			const p = f.properties as unknown as StopProperties;
			hoverPopup
				.setLngLat(e.lngLat)
				.setHTML(
					`<strong>${p.name}</strong><br/>${PILGRIM_NAMES[p.pilgrim]}, ${p.year} CE${p.firsthand ? '' : ' · from report'}`
				)
				.addTo(m);
		});
		m.on('mouseleave', 'places', () => {
			m.getCanvas().style.cursor = '';
			hoverPopup.remove();
		});
		m.on('click', 'places', (e) => {
			const f = e.features?.[0];
			if (f) s.place = (f.properties as unknown as StopProperties).canonicalId;
		});
		m.on('click', 'testimony-fill', (e) => {
			// places take precedence when overlapping
			const hits = m.queryRenderedFeatures(e.point, { layers: ['places'] });
			if (hits.length) return;
			const f = e.features?.[0];
			if (f) testimonyRegion = { id: f.properties.id as string, name: f.properties.name as string };
		});

		map = m;
		layersReady = true;
	}

	// filters react to year / pilgrim / sect / hearsay changes
	$effect(() => {
		if (!map || !layersReady || !pilgrims.length) return;
		applyFilters(
			map,
			{
				year: s.year,
				pilgrims: { ...s.pilgrims },
				sect: s.sect,
				showHearsay: s.showHearsay
			},
			pilgrims
		);
	});

	// layer visibility toggles
	$effect(() => {
		if (!map || !layersReady) return;
		applyToggles(map, {
			yanaFields: s.yanaFields,
			testimony: s.testimony,
			routes: s.routes,
			modernNames: s.modernNames
		});
	});

	// the selected place drives the detail panel (lazy-loads details.json once)
	$effect(() => {
		const id = s.place;
		if (!id) {
			detail = null;
			return;
		}
		loadDetails().then((all) => {
			if (s.place === id) detail = all[id] ?? null;
		});
	});

	// URL sync — every view is shareable
	let urlTimer: ReturnType<typeof setTimeout>;
	$effect(() => {
		const qs = s.toParams().toString();
		if (!browser || !layersReady) return;
		clearTimeout(urlTimer);
		urlTimer = setTimeout(() => {
			replaceState(qs ? `?${qs}` : window.location.pathname, {});
		}, 250);
		return () => clearTimeout(urlTimer);
	});

	const regionObservations = $derived(
		testimonyRegion ? observations.filter((o) => o.regionIds.includes(testimonyRegion!.id)) : []
	);

	const visibleStops = $derived(
		stops
			.filter(
				(p) =>
					p.year <= s.year &&
					s.pilgrims[p.pilgrim] &&
					(s.showHearsay || p.firsthand) &&
					(!s.sect || p.sectKeys.includes(s.sect))
			)
			.sort((a, b) => a.year - b.year || a.sequence - b.sequence)
	);
</script>

<svelte:head>
	<title>Map explorer — Journeys to the West</title>
	<meta
		name="description"
		content="Explore Buddhist India through the eyes of three Chinese pilgrims, 399–695 CE — where each school and vehicle held sway, place by place."
	/>
</svelte:head>

<div class="explorer">
	<div class="map-area">
		<MapView onready={onMapReady} />

		<details class="controls-overlay" bind:open={controlsOpen}>
			<summary>Layers &amp; filters</summary>
			<LayerControls state={s} {sects} />
		</details>

		<div class="legend-overlay">
			<Legend />
		</div>

		<button class="list-toggle" onclick={() => (listView = !listView)} aria-pressed={listView}>
			{listView ? 'Hide list' : 'View as list'}
		</button>

		{#if testimonyRegion}
			<aside class="testimony-popover" aria-label="Yijing's testimony for {testimonyRegion.name}">
				<header>
					<h3>{testimonyRegion.name}</h3>
					<button onclick={() => (testimonyRegion = null)} aria-label="Close">×</button>
				</header>
				<p class="testimony-sub">Yijing’s testimony on the schools, c. 691 CE</p>
				{#each regionObservations as obs (obs.id)}
					<article>
						<p class="claim">{obs.claim}</p>
						<blockquote>
							{obs.source.quote}
							<cite>{obs.source.ref}</cite>
						</blockquote>
						{#if obs.sect.length}
							<p class="obs-sects">{obs.sect.map((k) => SECT_LABELS[k] ?? k).join(' · ')}</p>
						{/if}
					</article>
				{:else}
					<p>No specific claims recorded for this region.</p>
				{/each}
			</aside>
		{/if}

		{#if s.place && detail}
			<div class="detail-slide">
				<PlaceDetailPanel
					{detail}
					onclose={() => (s.place = null)}
					permalinkHref="{base}/places/{detail.canonical.canonicalId}/"
				/>
			</div>
		{/if}
	</div>

	{#if listView}
		<section class="list-view" aria-label="Places as a list">
			<table>
				<thead>
					<tr><th>Place</th><th>Pilgrim</th><th>Year</th><th>Yāna</th><th>Region note</th></tr>
				</thead>
				<tbody>
					{#each visibleStops as p (p.id)}
						<tr>
							<td><button class="link" onclick={() => (s.place = p.canonicalId)}>{p.name}</button></td>
							<td>{PILGRIM_NAMES[p.pilgrim]}</td>
							<td>{p.year}{p.yearInterpolated ? ' (est.)' : ''}{p.firsthand ? '' : ' · reported'}</td>
							<td>{p.yanaAll.map((y) => YANA_LABELS[y] ?? y).join(', ')}</td>
							<td>{p.modernName ?? '—'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</section>
	{/if}

	<div class="timeline-bar">
		{#if pilgrims.length}
			<TimelineScrubber {pilgrims} {stops} bind:year={s.year} />
		{/if}
	</div>
</div>

<style>
	.explorer {
		display: flex;
		flex-direction: column;
		height: calc(100vh - var(--header-h));
	}

	.map-area {
		position: relative;
		flex: 1;
		min-height: 0;
	}

	.controls-overlay {
		position: absolute;
		top: var(--space-2);
		left: var(--space-2);
		z-index: 10;
		background: color-mix(in srgb, var(--paper) 94%, transparent);
		border: 1px solid color-mix(in srgb, var(--ink-faint) 40%, transparent);
		border-radius: var(--radius);
		padding: var(--space-2);
		max-width: 14rem;
		max-height: 70%;
		overflow-y: auto;
	}

	.controls-overlay summary {
		font-family: var(--font-display);
		color: var(--maroon);
		cursor: pointer;
		margin-bottom: var(--space-2);
	}

	.legend-overlay {
		position: absolute;
		bottom: var(--space-2);
		left: var(--space-2);
		z-index: 10;
	}

	.list-toggle {
		position: absolute;
		top: var(--space-2);
		right: 3.2rem;
		z-index: 10;
		border: 1px solid var(--ink-faint);
		background: color-mix(in srgb, var(--paper) 94%, transparent);
		border-radius: var(--radius);
		padding: var(--space-1) var(--space-2);
		font-size: 0.8rem;
		color: var(--ink-soft);
	}

	.testimony-popover {
		position: absolute;
		top: var(--space-3);
		left: 50%;
		transform: translateX(-50%);
		z-index: 15;
		width: min(26rem, calc(100% - 2rem));
		max-height: 70%;
		overflow-y: auto;
		background: var(--paper);
		border: 1px solid var(--gold);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-panel);
		padding: var(--space-3);
	}

	.testimony-popover header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.testimony-popover h3 {
		margin: 0;
	}

	.testimony-popover header button {
		border: none;
		background: none;
		font-size: 1.3rem;
		color: var(--ink-soft);
	}

	.testimony-sub {
		font-size: 0.75rem;
		color: var(--ink-faint);
		margin: 0 0 var(--space-2);
	}

	.testimony-popover .claim {
		font-family: var(--font-narrative);
		margin: 0 0 var(--space-1);
	}

	.testimony-popover blockquote {
		font-size: 0.82rem;
		margin: 0 0 var(--space-2);
	}

	.obs-sects {
		font-size: 0.72rem;
		color: var(--ochre);
		margin: 0 0 var(--space-2);
	}

	.detail-slide {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		z-index: 20;
		width: min(30rem, 100%);
		display: flex;
	}

	.detail-slide :global(.panel) {
		flex: 1;
	}

	@media (max-width: 640px) {
		.detail-slide {
			top: 30%;
			width: 100%;
			border-radius: var(--radius-lg) var(--radius-lg) 0 0;
			overflow: hidden;
		}
	}

	.list-view {
		max-height: 40vh;
		overflow-y: auto;
		border-top: 1px solid var(--ink-faint);
		background: var(--paper);
		padding: 0 var(--space-3);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.85rem;
	}

	th {
		text-align: left;
		font-family: var(--font-display);
		color: var(--maroon);
		position: sticky;
		top: 0;
		background: var(--paper);
		padding: var(--space-2) var(--space-2) var(--space-1) 0;
	}

	td {
		padding: var(--space-1) var(--space-2) var(--space-1) 0;
		border-top: 1px solid color-mix(in srgb, var(--ink-faint) 25%, transparent);
	}

	.link {
		border: none;
		background: none;
		padding: 0;
		color: var(--maroon);
		text-decoration: underline;
		text-decoration-color: var(--gold);
		font-size: inherit;
	}

	.timeline-bar {
		flex: 0 0 auto;
		padding: var(--space-2) var(--space-3);
		border-top: 1px solid color-mix(in srgb, var(--ink-faint) 35%, transparent);
		background: var(--paper);
	}

	:global(.hover-popup .maplibregl-popup-content) {
		background: var(--paper-card);
		color: var(--ink);
		font-family: var(--font-ui);
		font-size: 0.8rem;
		padding: 0.4rem 0.6rem;
		border: 1px solid var(--gold);
		border-radius: 4px;
		box-shadow: var(--shadow-card);
	}
</style>
