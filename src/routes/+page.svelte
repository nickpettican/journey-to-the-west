<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { loadPilgrims } from '$lib/data/load';
	import { PILGRIM_COLOURS } from '$lib/data/colours';
	import { prefersReducedMotion } from '$lib/map/camera';
	import type { Pilgrim } from '$lib/types';

	let pilgrims: Pilgrim[] = $state([]);
	let monkImg: HTMLImageElement | undefined = $state();

	onMount(async () => {
		if (monkImg && !prefersReducedMotion()) {
			const { gsap } = await import('gsap');
			// the pilgrim walks in from the east, the direction of home
			gsap.from(monkImg, {
				x: 60,
				opacity: 0,
				duration: 1.6,
				ease: 'power2.out',
				delay: 0.15
			});
		}
		pilgrims = await loadPilgrims();
	});
</script>

<svelte:head>
	<title>Journeys to the West — three pilgrims, three centuries, one map</title>
	<meta
		name="description"
		content="Follow Faxian, Xuanzang and Yijing across the Buddhist world of 399–695 CE — an interactive map and timeline built from their own records."
	/>
</svelte:head>

<div class="landing">
	<section class="hero">
		<img
			bind:this={monkImg}
			class="monk-hero"
			src="{base}/img/monk-pilgrim.svg"
			alt="A wandering monk with staff and travelling pack"
			width="188"
			height="271"
		/>
		<h1>Journeys to the West</h1>
		<p class="tagline prose">
			Between 399 and 695 CE, three monks walked and sailed out of China to reach India — the land
			their scriptures called the West. They crossed the river of sand and the Onion Mountains,
			rode the monsoon past Sumatra, and wrote down everything: the monasteries and their
			schools, the stūpas and their stories, the kingdoms and their kings. This site rebuilds
			their world from their own words.
		</p>
		<div class="entries">
			<a class="entry primary" href="{base}/map/">Roam the map</a>
			<a class="entry" href="{base}/journeys/">Follow a journey</a>
		</div>
	</section>

	<hr class="lotus-rule" />

	<section class="portals" aria-label="The three pilgrims">
		{#each pilgrims as p (p.id)}
			<a class="portal" href="{base}/journeys/{p.id}/" style:--pc={PILGRIM_COLOURS[p.id]}>
				<span class="years">{p.journey.startYear}–{p.journey.endYear} CE</span>
				<h2>{p.name}</h2>
				<p>{p.bio}</p>
				<span class="cta">Follow the journey →</span>
			</a>
		{/each}
	</section>

	<hr class="lotus-rule" />

	<section class="threads prose">
		<h2>What the records hold</h2>
		<p>
			Two hundred and ten recorded visits. One hundred and sixty-six stories — jātakas, miracles,
			relics and remembered history. Seven holy places that all three pilgrims saw, from Nālandā’s
			lecture halls to the Bodhi Tree itself, so you can watch a single monastery change across
			three hundred years.
		</p>
		<p>
			The map shows where the Mahāyāna and the Śrāvakayāna flourished, which schools kept which
			monasteries, and how far the pilgrims’ own eyes reached — every claim traceable to a
			verbatim line of the source text.
		</p>
	</section>

		<hr class="lotus-rule" />

		<p class="dedication">For my teacher, Do Tulku Rinpoche, who set me on this road.</p>
</div>

<style>
	.landing {
		max-width: 64rem;
		margin: 0 auto;
		padding: var(--space-5) var(--space-3) var(--space-6);
	}

	.hero {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-5) 0;
	}

	.monk-hero {
		width: clamp(6.5rem, 16vw, 9.5rem);
		height: auto;
	}

	.hero h1 {
		margin: 0;
	}

	.tagline {
		margin: 0 auto;
		color: var(--ink-soft);
	}

	.entries {
		display: flex;
		gap: var(--space-3);
		flex-wrap: wrap;
		justify-content: center;
		margin-top: var(--space-2);
	}

	.entry {
		font-family: var(--font-display);
		font-size: 1.05rem;
		padding: var(--space-2) var(--space-4);
		border: 1.5px solid var(--maroon);
		border-radius: 999px;
		text-decoration: none;
		color: var(--maroon);
		transition: all var(--transition);
	}

	.entry:hover {
		background: var(--maroon);
		color: var(--paper);
	}

	.entry.primary {
		background: var(--maroon);
		color: var(--paper);
	}

	.entry.primary:hover {
		background: var(--saffron);
		border-color: var(--saffron);
	}

	.portals {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-3);
	}

	.portal {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		background: var(--paper-card);
		border: 1px solid color-mix(in srgb, var(--pc) 45%, transparent);
		border-top: 4px solid var(--pc);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-card);
		padding: var(--space-3);
		text-decoration: none;
		color: var(--ink);
		transition: transform var(--transition), box-shadow var(--transition);
	}

	.portal:hover {
		transform: translateY(-3px);
		box-shadow: var(--shadow-panel);
		color: var(--ink);
	}

	.portal .years {
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		color: var(--pc);
		font-weight: 700;
	}

	.portal h2 {
		margin: 0;
	}

	.portal p {
		font-family: var(--font-narrative);
		font-size: 0.92rem;
		color: var(--ink-soft);
		margin: 0;
		flex: 1;
	}

	.cta {
		color: var(--pc);
		font-size: 0.85rem;
		font-weight: 600;
	}

	.threads {
		margin: 0 auto;
	}

	.dedication {
		max-width: 30rem;
		margin: 0 auto;
		text-align: center;
		font-family: var(--font-narrative);
		font-style: italic;
		font-size: 0.98rem;
		line-height: 1.6;
		color: var(--ink-soft);
	}
</style>
