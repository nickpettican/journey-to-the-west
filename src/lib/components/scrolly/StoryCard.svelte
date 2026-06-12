<script lang="ts">
	import type { JourneyStop } from '$lib/types';
	import { YANA_LABELS } from '$lib/data/labels';
	import { YANA_COLOURS } from '$lib/data/colours';
	import Chip from '$lib/components/ui/Chip.svelte';

	let {
		stop,
		onexplore
	}: {
		stop: JourneyStop;
		onexplore: (canonicalId: string) => void;
	} = $props();

	const KIND_LABELS: Record<string, string> = {
		jataka: 'a jātaka told here',
		miracle: 'a miracle recorded here',
		relic: 'a relic kept here',
		historical: 'history remembered here',
		legend: 'a legend of this place',
		other: 'a story of this place'
	};
</script>

<article class="story-card" data-stop-id={stop.id}>
	<div class="year-plaque">{stop.year} CE{stop.yearInterpolated ? '·est.' : ''}</div>
	<h3>{stop.name}</h3>

	{#if !stop.firsthand}
		<p class="hearsay">described from report — the pilgrim did not travel here</p>
	{/if}

	<div class="chips">
		{#each stop.yanaAll.filter((y) => y !== 'unknown') as y (y)}
			<Chip label={YANA_LABELS[y] ?? y} colour={YANA_COLOURS[y] ?? null} />
		{/each}
		{#if stop.monks}
			<Chip
				label="≈{stop.monks.toLocaleString('en-GB')} monks"
				muted
				title={stop.monksEstimated && stop.monksText
					? `The pilgrim writes “${stop.monksText}”`
					: undefined}
			/>
		{/if}
	</div>

	{#if stop.activity}
		<p class="activity">{stop.activity}</p>
	{/if}

	{#if stop.bestAnecdote}
		<div class="anecdote">
			<span class="anecdote-kind">{KIND_LABELS[stop.bestAnecdote.kind] ?? KIND_LABELS.other}</span>
			<strong>{stop.bestAnecdote.title}.</strong>
			{stop.bestAnecdote.summary}
		</div>
	{/if}

	<blockquote>
		{stop.quote.length > 200 ? stop.quote.slice(0, 200).trimEnd() + '…' : stop.quote}
		<cite>{stop.ref}</cite>
	</blockquote>

	<button class="explore" onclick={() => onexplore(stop.canonicalId)}>
		Explore this place {stop.anecdoteCount > 1 ? `(${stop.anecdoteCount} stories)` : ''} →
	</button>
</article>

<style>
	.story-card {
		background: var(--paper-card);
		border: 1px solid color-mix(in srgb, var(--gold) 50%, transparent);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-card);
		padding: var(--space-3);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.year-plaque {
		align-self: flex-start;
		font-family: var(--font-display);
		font-size: 0.85rem;
		color: var(--paper);
		background: var(--maroon);
		padding: 0.1rem 0.6rem;
		border-radius: 3px;
		letter-spacing: 0.05em;
	}

	h3 {
		margin: 0;
		font-size: 1.45rem;
	}

	.hearsay {
		margin: 0;
		font-size: 0.78rem;
		font-style: italic;
		color: var(--maroon);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}

	.activity {
		font-family: var(--font-narrative);
		font-size: 0.98rem;
		margin: 0;
	}

	.anecdote {
		font-family: var(--font-narrative);
		font-size: 0.92rem;
		background: color-mix(in srgb, var(--saffron) 8%, var(--paper-card));
		border-left: 3px solid var(--saffron);
		border-radius: 0 var(--radius) var(--radius) 0;
		padding: var(--space-2);
	}

	.anecdote-kind {
		display: block;
		font-family: var(--font-ui);
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--ochre);
		margin-bottom: 0.2rem;
	}

	blockquote {
		font-size: 0.88rem;
		margin: 0;
	}

	.explore {
		align-self: flex-start;
		border: none;
		background: none;
		padding: 0;
		color: var(--maroon);
		font-size: 0.85rem;
		text-decoration: underline;
		text-decoration-color: var(--gold);
		text-underline-offset: 3px;
	}

	.explore:hover {
		color: var(--saffron);
	}
</style>
