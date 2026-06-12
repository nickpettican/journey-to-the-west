<script lang="ts">
	import type { GeoConfidence } from '$lib/types';

	let { confidence }: { confidence: GeoConfidence } = $props();

	const COPY: Record<GeoConfidence, { label: string; explain: string }> = {
		high: {
			label: 'location: confident',
			explain: 'Scholars identify this place with a known modern site.'
		},
		medium: {
			label: 'location: probable',
			explain: 'A likely identification, with some scholarly disagreement or imprecision.'
		},
		low: {
			label: 'location: approximate',
			explain: 'Only the general region is known; the pin marks a best-effort centroid.'
		},
		unknown: {
			label: 'location: uncertain',
			explain: 'No accepted identification; the pin is indicative only.'
		}
	};

	const c = $derived(COPY[confidence] ?? COPY.unknown);
</script>

<span class="badge {confidence}" title={c.explain}>
	<svg viewBox="0 0 12 12" aria-hidden="true">
		<circle cx="6" cy="6" r="2.2" />
		<circle cx="6" cy="6" r="4.6" class="ring" />
	</svg>
	{c.label}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.72rem;
		color: var(--ink-soft);
		border: 1px solid color-mix(in srgb, var(--ink-faint) 60%, transparent);
		border-radius: 999px;
		padding: 0.1rem 0.55rem;
		background: var(--paper-card);
	}

	svg {
		width: 0.75rem;
		height: 0.75rem;
		fill: var(--ink-soft);
	}

	.ring {
		fill: none;
		stroke: var(--ink-faint);
		stroke-width: 1;
	}

	.low .ring,
	.unknown .ring {
		stroke-dasharray: 2 2;
	}
</style>
