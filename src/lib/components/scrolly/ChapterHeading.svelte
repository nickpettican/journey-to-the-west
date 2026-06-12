<script lang="ts">
	import type { JourneyChapter } from '$lib/types';

	let {
		chapter,
		index,
		onstop
	}: {
		chapter: JourneyChapter;
		index: number;
		onstop: (canonicalId: string) => void;
	} = $props();

	// the ribbon carries every stop that does not get a full story card, so the
	// whole route is represented without one card per stop
	const ribbonStops = $derived(chapter.stops.filter((s) => !s.featured));
</script>

<header class="chapter" data-chapter-id={chapter.id}>
	<span class="number">{index + 1}</span>
	<h2>{chapter.title}</h2>
	<p class="span-note">
		{chapter.stops.length}
		{chapter.stops.length === 1 ? 'place' : 'places'}
		· {chapter.stops[0]?.year}–{chapter.stops[chapter.stops.length - 1]?.year} CE
	</p>

	{#if ribbonStops.length}
		<ul class="ribbon" aria-label="Other places in this chapter">
			{#each ribbonStops as s (s.id)}
				<li>
					<button class="ribbon-stop" onclick={() => onstop(s.canonicalId)}>
						<span class="dot" class:hearsay={!s.firsthand} aria-hidden="true"></span>
						{s.name}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</header>

<style>
	.chapter {
		background: color-mix(in srgb, var(--paper-card) 96%, transparent);
		border: 1px solid color-mix(in srgb, var(--gold) 50%, transparent);
		border-top: 3px solid var(--gold);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-card);
		padding: var(--space-3);
	}

	.number {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		border: 1.5px solid var(--gold);
		font-family: var(--font-display);
		color: var(--ochre);
		margin-bottom: var(--space-2);
	}

	h2 {
		font-size: 1.5rem;
		margin: 0 0 var(--space-1);
	}

	.span-note {
		font-size: 0.78rem;
		color: var(--ink-faint);
		margin: 0 0 var(--space-2);
	}

	.ribbon {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem var(--space-2);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.ribbon-stop {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		border: none;
		background: none;
		padding: 0.1rem 0;
		font-size: 0.78rem;
		color: var(--ink-soft);
	}

	.ribbon-stop:hover {
		color: var(--maroon);
		text-decoration: underline;
		text-decoration-color: var(--gold);
	}

	.dot {
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 50%;
		background: var(--ink-faint);
	}

	.dot.hearsay {
		background: transparent;
		border: 1.2px solid var(--ink-faint);
	}
</style>
