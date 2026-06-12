<script lang="ts">
	import type { PlaceDetail } from '$lib/types';
	import VisitDetail from './VisitDetail.svelte';
	import WitnessComparison from './WitnessComparison.svelte';

	let {
		detail,
		mode = 'panel',
		onclose = undefined,
		viewOnMapHref = undefined,
		permalinkHref = undefined
	}: {
		detail: PlaceDetail;
		mode?: 'panel' | 'page';
		onclose?: () => void;
		viewOnMapHref?: string;
		permalinkHref?: string;
	} = $props();

	const visits = $derived(detail.visits);
	const multi = $derived(visits.length >= 2);
	let tab = $state<'compare' | number>(0);

	$effect(() => {
		// reset tab when the place changes; default to the comparison when 2+
		void detail.canonical.canonicalId;
		tab = multi ? 'compare' : 0;
	});

	let panelEl: HTMLElement | undefined = $state();

	$effect(() => {
		if (mode === 'panel') panelEl?.focus();
	});

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && onclose) onclose();
	}
</script>

<svelte:window onkeydown={mode === 'panel' ? onKeydown : undefined} />

<aside
	bind:this={panelEl}
	class="panel {mode}"
	role={mode === 'panel' ? 'dialog' : undefined}
	aria-label="Details for {detail.canonical.name}"
	tabindex="-1"
>
	<header class="panel-header">
		<div class="titles">
			<h2>{detail.canonical.name}</h2>
			<p class="subtitle">
				{#if visits[0] && visits[0].names.asGiven !== detail.canonical.name}
					<span class="as-given">“{visits[0].names.asGiven}”</span>
				{/if}
				{#if detail.canonical.modernName}
					<span>modern {detail.canonical.modernName}</span>
				{/if}
				{#if detail.canonical.pilgrimCount >= 3}
					<span class="all-three">✦ visited by all three pilgrims</span>
				{/if}
			</p>
		</div>
		<div class="actions">
			{#if permalinkHref}
				<a class="action" href={permalinkHref}>Page</a>
			{/if}
			{#if viewOnMapHref}
				<a class="action" href={viewOnMapHref}>View on map</a>
			{/if}
			{#if onclose}
				<button class="close" onclick={onclose} aria-label="Close panel">×</button>
			{/if}
		</div>
	</header>

	{#if multi}
		<nav class="tabs" aria-label="Witnesses">
			<button class:active={tab === 'compare'} onclick={() => (tab = 'compare')}>
				{visits.length === 3 ? 'Three witnesses' : 'Compare'}
			</button>
			{#each visits as v, i (v.id)}
				<button class:active={tab === i} onclick={() => (tab = i)}>
					{v.pilgrim}
					{#if v.date.year}<span class="tab-year">{v.date.year}</span>{/if}
				</button>
			{/each}
		</nav>
	{/if}

	<div class="body">
		{#if tab === 'compare' && multi}
			<WitnessComparison {detail} />
		{:else if typeof tab === 'number' && visits[tab]}
			<VisitDetail visit={visits[tab]} />
		{/if}
	</div>
</aside>

<style>
	.panel {
		background: var(--paper);
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}

	.panel.panel {
		box-shadow: var(--shadow-panel);
	}

	.panel:focus {
		outline: none;
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-2);
		padding: var(--space-3);
		border-bottom: 1px solid color-mix(in srgb, var(--gold) 50%, transparent);
		position: sticky;
		top: 0;
		background: var(--paper);
		z-index: 2;
	}

	h2 {
		margin: 0;
		font-size: 1.5rem;
	}

	.subtitle {
		margin: var(--space-1) 0 0;
		font-size: 0.8rem;
		color: var(--ink-faint);
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.as-given {
		font-style: italic;
	}

	.all-three {
		color: var(--saffron);
		font-weight: 600;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex: 0 0 auto;
	}

	.action {
		font-size: 0.78rem;
	}

	.close {
		border: none;
		background: none;
		font-size: 1.5rem;
		line-height: 1;
		color: var(--ink-soft);
		padding: 0 var(--space-1);
	}

	.close:hover {
		color: var(--maroon);
	}

	.tabs {
		display: flex;
		gap: var(--space-1);
		padding: var(--space-2) var(--space-3) 0;
		border-bottom: 1px solid color-mix(in srgb, var(--ink-faint) 30%, transparent);
		flex-wrap: wrap;
	}

	.tabs button {
		border: 1px solid transparent;
		border-bottom: none;
		background: none;
		font-size: 0.85rem;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius) var(--radius) 0 0;
		color: var(--ink-soft);
	}

	.tabs button.active {
		background: var(--paper-card);
		border-color: color-mix(in srgb, var(--ink-faint) 40%, transparent);
		color: var(--maroon);
		font-weight: 600;
	}

	.tab-year {
		font-size: 0.7rem;
		color: var(--ink-faint);
		margin-left: 0.25rem;
	}

	.body {
		padding: var(--space-3);
	}
</style>
