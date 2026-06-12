<script lang="ts">
	import type { JourneyChapter } from '$lib/types';

	let {
		chapters,
		activeIndex,
		colour
	}: {
		chapters: JourneyChapter[];
		activeIndex: number;
		colour: string;
	} = $props();

	function jump(id: string) {
		document.querySelector(`[data-chapter-id="${id}"]`)?.scrollIntoView({ block: 'start' });
	}
</script>

<nav class="rail" aria-label="Chapters">
	<ol>
		{#each chapters as ch, i (ch.id)}
			<li>
				<button
					class:active={i === activeIndex}
					style:--rail-colour={colour}
					onclick={() => jump(ch.id)}
					aria-current={i === activeIndex ? 'step' : undefined}
					title={ch.title}
				>
					<span class="tick" aria-hidden="true"></span>
					<span class="label">{i + 1}</span>
				</button>
			</li>
		{/each}
	</ol>
</nav>

<style>
	.rail {
		position: fixed;
		left: 0.6rem;
		top: 50%;
		transform: translateY(-50%);
		z-index: 30;
	}

	ol {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	button {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		border: none;
		background: none;
		padding: 0.1rem;
		color: var(--ink-faint);
		font-size: 0.65rem;
	}

	.tick {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		border: 1.5px solid var(--ink-faint);
		background: transparent;
		transition: all var(--transition);
	}

	button.active .tick {
		background: var(--rail-colour);
		border-color: var(--rail-colour);
		transform: scale(1.25);
	}

	button.active {
		color: var(--rail-colour);
		font-weight: 700;
	}

	.label {
		opacity: 0;
		transition: opacity var(--transition);
	}

	button:hover .label,
	button.active .label,
	button:focus-visible .label {
		opacity: 1;
	}

	@media (max-width: 900px) {
		.rail {
			display: none;
		}
	}
</style>
