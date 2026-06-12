<script lang="ts">
	import { YANA_LABELS } from '$lib/data/labels';
	import { YANA_COLOURS } from '$lib/data/colours';

	const entries = ['Mahayana', 'Sravakayana', 'mixed', 'Vajrayana', 'non-Buddhist', 'unknown'];
	const suffix: Record<string, string> = { unknown: ' (as recorded)', Vajrayana: ' ring (derived)' };
</script>

<details class="legend" open>
	<summary>Legend</summary>
	<ul>
		{#each entries as key (key)}
			<li>
				<span
					class="dot"
					class:hollow={false}
					class:vajra={key === 'Vajrayana'}
					style:background={key === 'Vajrayana' ? YANA_COLOURS.Mahayana : YANA_COLOURS[key]}
					style:border-color={key === 'unknown'
						? 'var(--sage)'
						: key === 'Vajrayana'
							? YANA_COLOURS.Vajrayana
							: 'transparent'}
				></span>
				{YANA_LABELS[key]}{suffix[key] ?? ''}
			</li>
		{/each}
		<li><span class="dot hollow"></span> Reported, not visited (hearsay)</li>
		<li><span class="dot halo"></span> Wide halo = uncertain location</li>
		<li>
			<span class="size"><i></i><i></i></span> Size = monks recorded (phrases like “several
			thousand” shown at representative size)
		</li>
	</ul>
</details>

<style>
	.legend {
		font-size: 0.78rem;
		background: color-mix(in srgb, var(--paper) 92%, transparent);
		border: 1px solid color-mix(in srgb, var(--ink-faint) 40%, transparent);
		border-radius: var(--radius);
		padding: var(--space-1) var(--space-2);
		max-width: 15rem;
	}

	summary {
		font-family: var(--font-display);
		font-size: 0.9rem;
		color: var(--maroon);
		cursor: pointer;
	}

	ul {
		list-style: none;
		margin: var(--space-1) 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	li {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.dot {
		flex: 0 0 auto;
		width: 0.7rem;
		height: 0.7rem;
		border-radius: 50%;
		border: 1.5px solid transparent;
	}

	.dot.hollow {
		background: transparent;
		border-color: var(--maroon);
	}

	.dot.vajra {
		border-width: 2px;
	}

	.dot.halo {
		background: var(--sage);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--sage) 35%, transparent);
	}

	.size {
		display: inline-flex;
		align-items: center;
		gap: 2px;
	}

	.size i {
		display: inline-block;
		border-radius: 50%;
		background: var(--ink-faint);
	}

	.size i:first-child {
		width: 0.4rem;
		height: 0.4rem;
	}

	.size i:last-child {
		width: 0.8rem;
		height: 0.8rem;
	}
</style>
