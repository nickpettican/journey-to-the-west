<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { loadPilgrims } from '$lib/data/load';
	import { PILGRIM_COLOURS } from '$lib/data/colours';
	import type { Pilgrim } from '$lib/types';

	let pilgrims: Pilgrim[] = $state([]);

	onMount(async () => {
		pilgrims = await loadPilgrims();
	});
</script>

<svelte:head>
	<title>The journeys — Journeys to the West</title>
</svelte:head>

<div class="journeys">
	<h1>Three pilgrims, three centuries</h1>
	<p class="prose">
		Three Chinese monks made the long journey to India between 399 and 695 CE, to study at its
		monasteries and carry home its books. Each left a record. Follow each, stop by stop.
	</p>

	<div class="cards">
		{#each pilgrims as p (p.id)}
			<a class="card" href="{base}/journeys/{p.id}/" style:--pc={PILGRIM_COLOURS[p.id]}>
				<span class="years">{p.journey.startYear}–{p.journey.endYear} CE</span>
				<h2>{p.name}</h2>
				<p class="bio">{p.bio}</p>
				<span class="cta">Follow the journey →</span>
			</a>
		{/each}
	</div>
</div>

<style>
	.journeys {
		max-width: 64rem;
		margin: 0 auto;
		padding: var(--space-5) var(--space-3) var(--space-6);
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--space-3);
		margin-top: var(--space-4);
	}

	.card {
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

	.card:hover {
		transform: translateY(-3px);
		box-shadow: var(--shadow-panel);
		color: var(--ink);
	}

	.years {
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		color: var(--pc);
		font-weight: 700;
	}

	.card h2 {
		margin: 0;
	}

	.bio {
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
</style>
