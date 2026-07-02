<script lang="ts">
	import type { PlaceDetail } from '$lib/types';
	import { YANA_LABELS } from '$lib/data/labels';
	import { YANA_COLOURS, PILGRIM_COLOURS } from '$lib/data/colours';
	import { estimateMonksFromText } from '$lib/data/monkEstimates';
	import Chip from '$lib/components/ui/Chip.svelte';

	let { detail }: { detail: PlaceDetail } = $props();

	const visits = $derived(detail.visits);

	// Simple honest century axis 399–695: where the witnesses fall in time.
	const X0 = 399;
	const X1 = 695;
	const ax = (year: number) => ((year - X0) / (X1 - X0)) * 100;

	const yanaKey = (display: string) =>
		Object.entries(YANA_LABELS).find(([, v]) => v === display)?.[0] ?? display;

	const pilgrimId = (name: string) => name.toLowerCase() as 'faxian' | 'xuanzang' | 'yijing';
</script>

<div class="witness">
	<p class="intro">
		{visits.length === 3 ? 'Three witnesses across three centuries' : 'Two witnesses'} — what each
		pilgrim found here, in his own time.
	</p>

	<svg class="axis" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true">
		<line x1="0" y1="8" x2="100" y2="8" stroke="var(--ink-faint)" stroke-width="0.4" />
		{#each visits as v (v.id)}
			{#if v.date.year}
				<circle cx={ax(v.date.year)} cy="8" r="1.6" fill={PILGRIM_COLOURS[pilgrimId(v.pilgrim)]} />
			{/if}
		{/each}
	</svg>
	<div class="axis-labels" aria-hidden="true"><span>399 CE</span><span>695 CE</span></div>

	<div class="columns" style:--cols={visits.length}>
		{#each visits as v (v.id)}
			<section class="column" style:--pc={PILGRIM_COLOURS[pilgrimId(v.pilgrim)]}>
				<header>
					<h4>{v.pilgrim}</h4>
					<span class="year">{v.date.text ?? (v.date.year ? `c. ${v.date.year} CE` : 'date unknown')}</span>
				</header>

				{#if !v.firsthand}
					<p class="hearsay">from report, not visited</p>
				{/if}

				<div class="chips">
					{#each v.yana as y (y)}
						{@const key = yanaKey(y)}
						<Chip
							label={YANA_LABELS[key] ?? y}
							colour={key === 'unknown' ? null : (YANA_COLOURS[key] ?? null)}
							muted={key === 'unknown'}
						/>
					{/each}
					{#each v.yanaDerived ?? [] as y (y)}
						<Chip
							label={`${YANA_LABELS[y] ?? y} (derived)`}
							colour={YANA_COLOURS[y] ?? null}
							title="Not the pilgrim's word — inferred from his own testimony of mantra practice here, read with the later openly Vajrayāna evidence at this site. See About."
						/>
					{/each}
				</div>

				<dl>
					{#if v.monks.count !== null}
						<div>
							<dt>Monks</dt>
							<dd>
								{v.monks.approx ? '≈' : ''}{v.monks.count.toLocaleString('en-GB')}
								{#if v.monks.text}<span class="phrase">“{v.monks.text}”</span>{/if}
							</dd>
						</div>
					{:else if estimateMonksFromText(v.monks.text) !== null}
						<div>
							<dt>Monks</dt>
							<dd title="Representative value — the pilgrim gives no exact figure">
								≈{estimateMonksFromText(v.monks.text)?.toLocaleString('en-GB')}
								<span class="phrase">“{v.monks.text}”</span>
							</dd>
						</div>
					{:else if v.monks.text}
						<div><dt>Monks</dt><dd class="phrase-only">“{v.monks.text}”</dd></div>
					{/if}
					{#if v.monasteries.count !== null}
						<div>
							<dt>Monasteries</dt>
							<dd>
								{v.monasteries.approx ? '≈' : ''}{v.monasteries.count}
								{#if v.monasteries.text}<span class="phrase">“{v.monasteries.text}”</span>{/if}
							</dd>
						</div>
					{:else if v.monasteries.text}
						<div><dt>Monasteries</dt><dd class="phrase-only">“{v.monasteries.text}”</dd></div>
					{/if}
				</dl>

				{#if v.activity}
					<p class="activity">{v.activity}</p>
				{/if}

				<blockquote>
					{v.source.quote.length > 220 ? v.source.quote.slice(0, 220).trimEnd() + '…' : v.source.quote}
					<cite>{v.source.ref}</cite>
				</blockquote>
			</section>
		{/each}
	</div>

	{#if detail.canonical.traditionNote}
		<p class="tradition-note">{detail.canonical.traditionNote}</p>
	{/if}
</div>

<style>
	.witness {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.intro {
		font-family: var(--font-display);
		font-size: 1.05rem;
		color: var(--maroon);
		margin: 0;
	}

	.axis {
		width: 100%;
		height: 14px;
		display: block;
	}

	.axis-labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.65rem;
		color: var(--ink-faint);
		margin-top: -4px;
	}

	.columns {
		display: grid;
		grid-template-columns: repeat(var(--cols), minmax(1, 1fr));
		gap: var(--space-2);
	}

	@media (max-width: 640px) {
		.columns {
			grid-template-columns: 1fr;
		}
	}

	.column {
		background: var(--paper-card);
		border: 1px solid color-mix(in srgb, var(--pc) 40%, transparent);
		border-top: 3px solid var(--pc);
		border-radius: var(--radius);
		padding: var(--space-2);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-width: 0;
	}

	header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-1);
		flex-wrap: wrap;
	}

	h4 {
		margin: 0;
		font-size: 1.05rem;
		color: var(--pc);
	}

	.year {
		font-size: 0.75rem;
		color: var(--ink-faint);
	}

	.hearsay {
		margin: 0;
		font-size: 0.72rem;
		font-style: italic;
		color: var(--maroon);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	dl {
		display: flex;
		gap: var(--space-3);
		margin: 0;
	}

	dt {
		font-size: 0.62rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--ink-faint);
	}

	dd {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.1rem;
	}

	dd .phrase {
		display: block;
		font-family: var(--font-narrative);
		font-style: italic;
		font-size: 0.72rem;
		color: var(--ink-faint);
	}

	dd.phrase-only {
		font-family: var(--font-narrative);
		font-style: italic;
		font-size: 0.85rem;
		color: var(--ink-soft);
	}

	dl {
		flex-wrap: wrap;
	}

	.activity {
		font-family: var(--font-narrative);
		font-size: 0.85rem;
		margin: 0;
	}

	blockquote {
		font-size: 0.82rem;
		margin: 0;
		padding: var(--space-1) var(--space-2);
	}

	.tradition-note {
		font-size: 0.88rem;
		font-style: italic;
		color: var(--ink-soft);
		border-top: 1px solid color-mix(in srgb, var(--gold) 50%, transparent);
		padding-top: var(--space-2);
		margin: var(--space-1) 0 0;
	}
</style>
