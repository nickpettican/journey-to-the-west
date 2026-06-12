<script lang="ts">
	import type { Anecdote } from '$lib/types';

	let { anecdote }: { anecdote: Anecdote } = $props();

	const KIND_LABELS: Record<string, string> = {
		jataka: 'Jātaka',
		miracle: 'Miracle',
		relic: 'Relic',
		historical: 'Historical',
		legend: 'Legend',
		other: 'Story'
	};

	const KIND_COLOURS: Record<string, string> = {
		jataka: 'var(--saffron)',
		miracle: 'var(--yana-vajrayana, #5b4b8a)',
		relic: 'var(--gold)',
		historical: 'var(--ink-soft)',
		legend: 'var(--ochre)',
		other: 'var(--sage)'
	};
</script>

<article class="anecdote">
	<header>
		<span class="kind" style:--kind-colour={KIND_COLOURS[anecdote.kind] ?? 'var(--sage)'}>
			{KIND_LABELS[anecdote.kind] ?? 'Story'}
		</span>
		<h4>{anecdote.title}</h4>
	</header>
	<p>{anecdote.summary}</p>
	{#if anecdote.figures.length}
		<footer>
			{#each anecdote.figures as figure (figure)}
				<span class="figure">{figure}</span>
			{/each}
		</footer>
	{/if}
</article>

<style>
	.anecdote {
		background: var(--paper-card);
		border: 1px solid color-mix(in srgb, var(--gold) 45%, transparent);
		border-radius: var(--radius-lg);
		padding: var(--space-3);
		box-shadow: var(--shadow-card);
	}

	header {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.kind {
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--kind-colour);
		border: 1px solid color-mix(in srgb, var(--kind-colour) 55%, transparent);
		border-radius: 3px;
		padding: 0.05rem 0.4rem;
	}

	h4 {
		margin: 0;
		font-size: 1.05rem;
	}

	p {
		font-family: var(--font-narrative);
		margin: var(--space-2) 0 0;
		font-size: 0.95rem;
	}

	footer {
		margin-top: var(--space-2);
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}

	.figure {
		font-size: 0.72rem;
		color: var(--ink-faint);
		border-bottom: 1px dotted var(--gold);
	}
</style>
