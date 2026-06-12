<script lang="ts">
	import type { ExplorerState } from '$lib/state/explorer.svelte';
	import { SECT_LABELS, PILGRIM_NAMES } from '$lib/data/labels';
	import { PILGRIM_COLOURS } from '$lib/data/colours';
	import type { PilgrimId } from '$lib/types';

	let { state: s, sects }: { state: ExplorerState; sects: string[] } = $props();

	const pilgrimIds: PilgrimId[] = ['faxian', 'xuanzang', 'yijing'];
</script>

<section class="controls" aria-label="Map layers and filters">
	<fieldset>
		<legend>Pilgrims</legend>
		{#each pilgrimIds as pid (pid)}
			<label>
				<input type="checkbox" bind:checked={s.pilgrims[pid]} />
				<span class="swatch" style:background={PILGRIM_COLOURS[pid]}></span>
				{PILGRIM_NAMES[pid]}
			</label>
		{/each}
	</fieldset>

	<fieldset>
		<legend>Layers</legend>
		<label><input type="checkbox" bind:checked={s.yanaFields} /> Yāna dominance</label>
		<label><input type="checkbox" bind:checked={s.routes} /> Routes</label>
		<label><input type="checkbox" bind:checked={s.testimony} /> Yijing’s testimony</label>
		<label><input type="checkbox" bind:checked={s.showHearsay} /> Reported places (hearsay)</label>
		<label><input type="checkbox" bind:checked={s.modernNames} /> Modern names</label>
	</fieldset>

	<fieldset>
		<legend>School (sect)</legend>
		<select bind:value={s.sect} aria-label="Filter by school">
			<option value={null}>All schools</option>
			{#each sects as key (key)}
				<option value={key}>{SECT_LABELS[key] ?? key}</option>
			{/each}
		</select>
	</fieldset>
</section>

<style>
	.controls {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		font-size: 0.85rem;
	}

	fieldset {
		border: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	legend {
		font-family: var(--font-display);
		font-size: 0.95rem;
		color: var(--maroon);
		padding: 0;
		margin-bottom: var(--space-1);
	}

	label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		cursor: pointer;
	}

	input[type='checkbox'] {
		accent-color: var(--maroon);
	}

	.swatch {
		display: inline-block;
		width: 0.8rem;
		height: 0.25rem;
		border-radius: 2px;
	}

	select {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		padding: var(--space-1) var(--space-2);
		border: 1px solid var(--ink-faint);
		border-radius: var(--radius);
		background: var(--paper-card);
		color: var(--ink);
		max-width: 100%;
	}
</style>
