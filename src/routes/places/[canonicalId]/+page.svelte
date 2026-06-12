<script lang="ts">
	import { base } from '$app/paths';
	import PlaceDetailPanel from '$lib/components/place/PlaceDetailPanel.svelte';

	let { data } = $props();

	const canonical = $derived(data.detail.canonical);
</script>

<svelte:head>
	<title>{canonical.name} — Journeys to the West</title>
	<meta
		name="description"
		content="What the Chinese pilgrims found at {canonical.name}{canonical.modernName
			? ` (modern ${canonical.modernName})`
			: ''}, in their own words."
	/>
</svelte:head>

<div class="place-page">
	<PlaceDetailPanel
		detail={data.detail}
		mode="page"
		viewOnMapHref="{base}/map/?place={canonical.canonicalId}"
	/>
</div>

<style>
	.place-page {
		max-width: 52rem;
		margin: 0 auto;
		padding: var(--space-4) var(--space-3) var(--space-6);
	}

	.place-page :global(.panel) {
		background: transparent;
	}
</style>
