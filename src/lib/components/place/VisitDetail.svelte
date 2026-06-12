<script lang="ts">
	import type { PlaceEntry } from '$lib/types';
	import Chip from '$lib/components/ui/Chip.svelte';
	import AnecdoteCard from './AnecdoteCard.svelte';
	import GeoConfidenceBadge from './GeoConfidenceBadge.svelte';
	import { YANA_LABELS, SECT_LABELS } from '$lib/data/labels';
	import { YANA_COLOURS } from '$lib/data/colours';
	import { estimateMonksFromText } from '$lib/data/monkEstimates';

	let { visit }: { visit: PlaceEntry } = $props();

	const yanaKey = (display: string) =>
		Object.entries(YANA_LABELS).find(([, v]) => v === display)?.[0] ?? display;
</script>

<div class="visit">
	{#if !visit.firsthand}
		<p class="hearsay-note">
			{visit.pilgrim} did not visit this place — he records it from report.
		</p>
	{/if}

	<div class="chips">
		{#each visit.yana as y (y)}
			{@const key = yanaKey(y)}
			<Chip
				label={YANA_LABELS[key] ?? y}
				colour={key === 'unknown' ? null : (YANA_COLOURS[key] ?? null)}
				muted={key === 'unknown'}
				title={key === 'unknown' ? 'The pilgrim does not say' : undefined}
			/>
		{/each}
		{#each visit.yanaDerived ?? [] as y (y)}
			<Chip
				label={`${YANA_LABELS[y] ?? y} (derived)`}
				colour={YANA_COLOURS[y] ?? null}
				title="Not the pilgrim's word — inferred from his own testimony of mantra practice here, read with the later openly Vajrayāna evidence at this site. See About."
			/>
		{/each}
		{#each visit.sect as sect (sect)}
			<Chip label={SECT_LABELS[sect] ?? sect} colour="var(--gold)" />
		{/each}
		{#each visit.type as t (t)}
			<Chip label={t} muted />
		{/each}
	</div>

	{#if visit.monasteries.count !== null || visit.monasteries.text || visit.monks.count !== null || visit.monks.text}
		<dl class="counts">
			{#if visit.monasteries.count !== null || visit.monasteries.text}
				<div>
					<dt>Monasteries</dt>
					<dd>
						{#if visit.monasteries.count !== null}
							{visit.monasteries.approx ? '≈' : ''}{visit.monasteries.count}
							{#if visit.monasteries.text}<span class="orig">“{visit.monasteries.text}”</span>{/if}
						{:else}
							<span class="phrase">“{visit.monasteries.text}”</span>
						{/if}
					</dd>
				</div>
			{/if}
			{#if visit.monks.count !== null || visit.monks.text}
				{@const monksEstimate = estimateMonksFromText(visit.monks.text)}
				<div>
					<dt>Monks</dt>
					<dd>
						{#if visit.monks.count !== null}
							{visit.monks.approx ? '≈' : ''}{visit.monks.count.toLocaleString('en-GB')}
							{#if visit.monks.text}<span class="orig">“{visit.monks.text}”</span>{/if}
						{:else if monksEstimate !== null}
							<span title="Representative value — the pilgrim gives no exact figure">
								≈{monksEstimate.toLocaleString('en-GB')}
							</span>
							<span class="orig">“{visit.monks.text}”</span>
						{:else}
							<span class="phrase">“{visit.monks.text}”</span>
						{/if}
					</dd>
				</div>
			{/if}
		</dl>
	{/if}

	{#if visit.activity}
		<p class="prose activity">{visit.activity}</p>
	{/if}

	{#if visit.anecdotes.length}
		<h4 class="section-h">Stories told of this place</h4>
		<div class="anecdotes">
			{#each visit.anecdotes as anecdote (anecdote.title)}
				<AnecdoteCard {anecdote} />
			{/each}
		</div>
	{/if}

	<blockquote>
		{visit.source.quote}
		<cite>{visit.source.work}, {visit.source.ref}</cite>
	</blockquote>

	{#if visit.supplementarySources?.length}
		<div class="supplementary">
			<h4 class="section-h">Also in the pilgrim's writings</h4>
			{#each visit.supplementarySources as supp (supp.quote)}
				<blockquote class="supp">
					{supp.quote}
					<cite>{supp.work}, {supp.ref}</cite>
				</blockquote>
				{#if supp.note}<p class="supp-note">{supp.note}</p>{/if}
			{/each}
		</div>
	{/if}

	<div class="scholarly">
		<h4 class="section-h">Scholarly notes</h4>
		<p class="scholarly-meta">
			<GeoConfidenceBadge confidence={visit.scholarlyNotes.geoConfidence} />
			{#if visit.scholarlyNotes.modernName}
				<span>Modern: <strong>{visit.scholarlyNotes.modernName}</strong></span>
			{/if}
			{#if visit.date.text}
				<span>Visited {visit.date.text}</span>
			{/if}
		</p>
		{#if visit.scholarlyNotes.notes}
			<p class="notes">{visit.scholarlyNotes.notes}</p>
		{/if}
		<p class="notes disclaimer">
			These notes come from the translators and later scholarship — they are not the pilgrim’s
			words.
		</p>
	</div>
</div>

<style>
	.visit {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.hearsay-note {
		margin: 0;
		font-size: 0.85rem;
		font-style: italic;
		color: var(--maroon);
		border: 1px dashed color-mix(in srgb, var(--maroon) 50%, transparent);
		border-radius: var(--radius);
		padding: var(--space-2);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}

	.counts {
		display: flex;
		gap: var(--space-4);
		margin: 0;
		flex-wrap: wrap;
	}

	dt {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--ink-faint);
	}

	dd {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.3rem;
		color: var(--ink);
	}

	.orig {
		display: block;
		font-family: var(--font-narrative);
		font-style: italic;
		font-size: 0.8rem;
		color: var(--ink-faint);
	}

	.phrase {
		font-family: var(--font-narrative);
		font-style: italic;
		font-size: 1rem;
		color: var(--ink-soft);
	}

	.activity {
		margin: 0;
	}

	.section-h {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--ochre);
		margin: 0 0 var(--space-2);
	}

	.anecdotes {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.supplementary blockquote.supp {
		font-size: 0.82rem;
		margin: 0 0 var(--space-1);
	}

	.supp-note {
		font-size: 0.78rem;
		font-style: italic;
		color: var(--ink-faint);
		margin: 0 0 var(--space-2);
	}

	.scholarly-meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
		font-size: 0.85rem;
		margin: 0 0 var(--space-2);
	}

	.notes {
		font-size: 0.85rem;
		color: var(--ink-soft);
		margin: 0 0 var(--space-1);
	}

	.disclaimer {
		font-style: italic;
		color: var(--ink-faint);
	}
</style>
