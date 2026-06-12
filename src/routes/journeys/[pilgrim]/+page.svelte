<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import type maplibregl from 'maplibre-gl';
	import MapView from '$lib/components/map/MapView.svelte';
	import StoryCard from '$lib/components/scrolly/StoryCard.svelte';
	import ChapterHeading from '$lib/components/scrolly/ChapterHeading.svelte';
	import ProgressRail from '$lib/components/scrolly/ProgressRail.svelte';
	import PlaceDetailPanel from '$lib/components/place/PlaceDetailPanel.svelte';
	import { ScrollyDirector } from '$lib/components/scrolly/ScrollyDirector';
	import { prefersReducedMotion } from '$lib/map/camera';
	import { loadDetails, routesUrl } from '$lib/data/load';
	import { PILGRIM_COLOURS } from '$lib/data/colours';
	import type { PilgrimId, PlaceDetail, JourneyStop } from '$lib/types';

	let { data } = $props();

	const journey = $derived(data.journey);
	const pilgrim = $derived(journey.pilgrim as PilgrimId);
	const colour = $derived(PILGRIM_COLOURS[pilgrim]);

	let director: ScrollyDirector | null = null;
	let mapInstance: maplibregl.Map | undefined;
	let scrollyEl: HTMLElement | undefined = $state();
	let activeChapter = $state(0);
	let detail: PlaceDetail | null = $state(null);
	let mapReady = $state(false);
	let domReady = $state(false);
	let cardEls: HTMLElement[] = $state([]);
	let activeCard = $state(0);

	function onMapReady(m: maplibregl.Map) {
		mapInstance = m;
		director = new ScrollyDirector(m, journey.pilgrim as PilgrimId);
		director.addLayers(routesUrl());
		const first = journey.chapters[0]?.stops[0];
		if (first) director.goToStop(first);
		mapReady = true;
	}

	onMount(() => {
		domReady = true;
	});

	// GSAP ScrollTrigger wiring once both map and DOM are ready.
	$effect(() => {
		if (!mapReady || !domReady || !scrollyEl || !director) return;

		let cancelled = false;
		let cleanup: (() => void) | undefined;

		Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
			([{ gsap }, { ScrollTrigger }]) => {
				if (cancelled || !scrollyEl || !director) return;
				gsap.registerPlugin(ScrollTrigger);
				const reduced = prefersReducedMotion();
				const triggers: globalThis.ScrollTrigger[] = [];

				const stopsById = new Map(
					journey.chapters.flatMap((c) => c.stops.map((s) => [s.id, s] as const))
				);

				const els = [...scrollyEl.querySelectorAll<HTMLElement>('[data-stop-id]')];
				cardEls = els;
				for (const [i, el] of els.entries()) {
					const stop = stopsById.get(el.dataset.stopId!);
					if (!stop) continue;
					triggers.push(
						ScrollTrigger.create({
							trigger: el,
							start: 'top 65%',
							onEnter: () => {
								activeCard = i;
								director!.goToStop(stop);
							},
							onEnterBack: () => {
								activeCard = i;
								director!.goToStop(stop);
							}
						})
					);
					if (!reduced) {
						gsap.from(el, {
							y: 14,
							opacity: 0,
							duration: 0.5,
							ease: 'power2.out',
							scrollTrigger: { trigger: el, start: 'top 85%' }
						});
					}
				}

				journey.chapters.forEach((chapter, i) => {
					const el = scrollyEl!.querySelector<HTMLElement>(`[data-chapter-id="${chapter.id}"]`);
					if (!el) return;
					triggers.push(
						ScrollTrigger.create({
							trigger: el,
							start: 'top 65%',
							onEnter: () => {
								activeChapter = i;
								director!.fitChapter(chapter);
							},
							onEnterBack: () => {
								activeChapter = i;
							}
						})
					);
				});

				cleanup = () => triggers.forEach((t) => t.kill());
			}
		);

		return () => {
			cancelled = true;
			cleanup?.();
		};
	});

	async function explore(canonicalId: string) {
		const all = await loadDetails();
		detail = all[canonicalId] ?? null;
	}

	function ribbonStop(canonicalId: string) {
		// fly there and open the detail — the ribbon represents the stops
		// without story cards
		explore(canonicalId);
		const stop = journey.chapters
			.flatMap((c) => c.stops)
			.find((s) => s.canonicalId === canonicalId);
		if (stop && director) director.goToStop(stop as JourneyStop);
	}

	function goCard(delta: number) {
		const target = Math.max(0, Math.min(cardEls.length - 1, activeCard + delta));
		cardEls[target]?.scrollIntoView({
			behavior: prefersReducedMotion() ? 'auto' : 'smooth',
			block: 'center'
		});
	}

	function onKeydown(e: KeyboardEvent) {
		if (detail) return; // the detail panel owns the keyboard while open
		const t = e.target as HTMLElement;
		if (t.closest('input, select, textarea, [contenteditable]')) return;
		if (e.key === 'ArrowRight') {
			goCard(1);
			e.preventDefault();
		} else if (e.key === 'ArrowLeft') {
			goCard(-1);
			e.preventDefault();
		}
	}
</script>

<svelte:window onkeydown={onKeydown} />

<svelte:head>
	<title>{journey.name}’s journey ({journey.years.startYear}–{journey.years.endYear} CE) — Journeys to the West</title>
	<meta name="description" content={journey.bio} />
</svelte:head>

<div class="scrolly-page">
	<div class="sticky-map">
		<MapView
			onready={onMapReady}
			navControl={false}
			label="Map following {journey.name}'s route"
		/>
	</div>

	<ProgressRail chapters={journey.chapters} activeIndex={activeChapter} {colour} />

	<div class="story-column" bind:this={scrollyEl}>
		<header class="journey-intro" style:--pc={colour}>
			<p class="years">{journey.years.startYear}–{journey.years.endYear} CE</p>
			<h1>{journey.name}</h1>
			<p class="prose">{journey.bio}</p>
			<p class="source-note">
				After <em>{journey.sourceWork.work}</em>, translated by {journey.sourceWork.translator}
				({journey.sourceWork.year}). Scroll to follow the road.
			</p>
		</header>

		{#each journey.chapters as chapter, i (chapter.id)}
			<ChapterHeading {chapter} index={i} onstop={ribbonStop} />
			{#each chapter.stops.filter((s) => s.featured) as stop (stop.id)}
				<StoryCard {stop} onexplore={explore} />
			{/each}
		{/each}

		<footer class="journey-outro">
			<hr class="lotus-rule" />
			<p class="prose">
				{#if pilgrim === 'faxian'}
					Faxian came home by sea in 414, aged about seventy-seven, with the books he had gone to
					find. He spent the rest of his life translating them.
				{:else if pilgrim === 'xuanzang'}
					Xuanzang returned to Chang’an in 645 with 657 texts carried by twenty horses, and spent
					his remaining nineteen years translating them. His record of the western regions became
					the most detailed account of seventh-century India ever written.
				{:else}
					Yijing stayed ten years at Nālandā, then withdrew to Śrībhoga in the Southern Sea, where
					he wrote his Record and sent it home — a portrait of the Buddhist world as one connected
					sea of monasteries from Sumatra to Magadha.
				{/if}
			</p>
			<a href="{base}/map/">Explore everything on the map →</a>
		</footer>
	</div>

	{#if cardEls.length}
		<nav class="stop-nav" aria-label="Previous and next place" style:--pc={colour}>
			<button onclick={() => goCard(-1)} disabled={activeCard === 0} aria-label="Previous place">
				←
			</button>
			<span class="counter">{activeCard + 1} / {cardEls.length}</span>
			<button
				onclick={() => goCard(1)}
				disabled={activeCard >= cardEls.length - 1}
				aria-label="Next place"
			>
				→
			</button>
		</nav>
	{/if}

	{#if detail}
		<div class="detail-slide">
			<PlaceDetailPanel
				{detail}
				onclose={() => (detail = null)}
				permalinkHref="{base}/places/{detail.canonical.canonicalId}/"
				viewOnMapHref="{base}/map/?place={detail.canonical.canonicalId}"
			/>
		</div>
	{/if}
</div>

<style>
	.scrolly-page {
		position: relative;
	}

	.sticky-map {
		position: sticky;
		top: var(--header-h);
		height: calc(100vh - var(--header-h));
		z-index: 0;
	}

	.story-column {
		position: relative;
		z-index: 5;
		width: min(26rem, calc(100% - 2rem));
		margin-left: auto;
		margin-right: var(--space-4);
		margin-top: calc(-100vh + var(--header-h) + var(--space-5));
		padding-bottom: 40vh;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	@media (max-width: 900px) {
		/* full-screen map with cards floating over it; large gaps let the map
		   and route show through between cards */
		.story-column {
			width: calc(100% - 1.6rem);
			margin-left: auto;
			margin-right: auto;
			margin-top: calc(-100vh + var(--header-h) + 45vh);
			gap: 42vh;
			padding-bottom: 30vh;
		}
	}

	.stop-nav {
		position: fixed;
		bottom: var(--space-3);
		left: 50%;
		transform: translateX(-50%);
		z-index: 35;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		background: color-mix(in srgb, var(--paper) 94%, transparent);
		border: 1px solid color-mix(in srgb, var(--pc) 50%, transparent);
		border-radius: 999px;
		box-shadow: var(--shadow-card);
		padding: 0.25rem 0.5rem;
	}

	.stop-nav button {
		border: none;
		background: none;
		font-size: 1.25rem;
		line-height: 1;
		color: var(--pc);
		padding: 0.3rem 0.55rem;
		border-radius: 999px;
	}

	.stop-nav button:hover:not(:disabled) {
		background: color-mix(in srgb, var(--pc) 12%, transparent);
	}

	.stop-nav button:disabled {
		color: var(--ink-faint);
		opacity: 0.4;
		cursor: default;
	}

	.stop-nav .counter {
		font-size: 0.75rem;
		color: var(--ink-soft);
		min-width: 3.6rem;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}

	@media (max-width: 900px) {
		.stop-nav {
			bottom: var(--space-2);
		}
	}

	.journey-intro {
		background: var(--paper-card);
		border-top: 4px solid var(--pc);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-card);
		padding: var(--space-3);
	}

	.journey-intro .years {
		font-size: 0.8rem;
		letter-spacing: 0.12em;
		color: var(--pc);
		font-weight: 700;
		margin: 0;
	}

	.journey-intro h1 {
		margin: var(--space-1) 0 var(--space-2);
	}

	.source-note {
		font-size: 0.8rem;
		color: var(--ink-faint);
		margin: 0;
	}

	.journey-outro {
		background: var(--paper-card);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-card);
		padding: var(--space-3);
	}

	.detail-slide {
		position: fixed;
		top: var(--header-h);
		right: 0;
		bottom: 0;
		z-index: 40;
		width: min(30rem, 100%);
		display: flex;
	}

	.detail-slide :global(.panel) {
		flex: 1;
	}
</style>
