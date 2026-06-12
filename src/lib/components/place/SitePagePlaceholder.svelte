<script lang="ts">
	import { base } from '$app/paths';
	import PlaceDetailPanel from './PlaceDetailPanel.svelte';
	import type { PlaceDetail } from '$lib/types';

	// Reserved home for the future Three.js/GSAP 3D tours — useful today as a
	// rich page built from the pilgrims' descriptions.
	let { detail, intro }: { detail: PlaceDetail; intro: string } = $props();
</script>

<div class="site-page">
	<header class="site-hero">
		<p class="coming">3D tour — in preparation</p>
		<h1>{detail.canonical.name}</h1>
		<p class="prose intro">{intro}</p>
	</header>

	<PlaceDetailPanel
		{detail}
		mode="page"
		viewOnMapHref="{base}/map/?place={detail.canonical.canonicalId}"
	/>
</div>

<style>
	.site-page {
		max-width: 52rem;
		margin: 0 auto;
		padding: var(--space-4) var(--space-3) var(--space-6);
	}

	.site-hero {
		text-align: center;
		padding: var(--space-4) 0;
	}

	.coming {
		display: inline-block;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--ochre);
		border: 1px solid var(--gold);
		border-radius: 999px;
		padding: 0.2rem 0.8rem;
		margin-bottom: var(--space-2);
	}

	.intro {
		margin: 0 auto;
		color: var(--ink-soft);
	}

	.site-page :global(.panel) {
		background: transparent;
	}
</style>
