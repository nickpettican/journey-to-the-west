<script lang="ts">
	let {
		label,
		colour = null,
		muted = false,
		title = undefined
	}: {
		label: string;
		colour?: string | null;
		muted?: boolean;
		title?: string;
	} = $props();
</script>

<span class="chip" class:muted {title} style:--chip-colour={colour ?? 'var(--ink-faint)'}>
	{label}
</span>

<style>
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.72rem;
		font-weight: 500;
		letter-spacing: 0.03em;
		padding: 0.1rem 0.55rem;
		border-radius: 999px;
		border: 1px solid var(--chip-colour);
		color: var(--ink-soft);
		background: color-mix(in srgb, var(--chip-colour) 12%, var(--paper-card));
		white-space: nowrap;
	}

	.chip::before {
		content: '';
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 50%;
		background: var(--chip-colour);
	}

	.chip.muted {
		border-style: dashed;
		color: var(--ink-faint);
	}

	.chip.muted::before {
		background: transparent;
		border: 1px solid var(--ink-faint);
	}
</style>
