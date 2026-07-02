<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import type { TourStation } from '../../../routes/nalanda/tour';
	import type { SceneTour } from '$lib/tour/types';

	let {
		stations,
		loadScene
	}: {
		stations: TourStation[];
		/** Lazily imports the route's scene module and builds the tour. */
		loadScene: () => Promise<(canvas: HTMLCanvasElement) => SceneTour>;
	} = $props();

	let canvasEl: HTMLCanvasElement;
	let rootEl: HTMLElement;
	let active = $state(0);
	let webglFailed = $state(false);

	onMount(() => {
		let tour: SceneTour | null = null;
		let killed = false;
		const cleanups: (() => void)[] = [];
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		Promise.all([loadScene(), import('gsap'), import('gsap/ScrollTrigger')]).then(
			([createTour, { gsap }, { ScrollTrigger }]) => {
			if (killed) return;
			try {
				tour = createTour(canvasEl);
			} catch {
				webglFailed = true;
				return;
			}
			gsap.registerPlugin(ScrollTrigger);
			const triggers: globalThis.ScrollTrigger[] = [];

			// Measure where each card's centre really sits in the scroll, so the
			// scene's camera/path keyframes land exactly on the cards.
			let measured: number[] = [];
			const calibrate = () => {
				const els = Array.from(rootEl.querySelectorAll<HTMLElement>('.station'));
				const rootTop = rootEl.getBoundingClientRect().top + window.scrollY;
				const scrollable = Math.max(1, rootEl.offsetHeight - window.innerHeight);
				measured = els.map((el) => {
					const centre = el.getBoundingClientRect().top + window.scrollY + el.offsetHeight / 2;
					return Math.min(1, Math.max(0, (centre - window.innerHeight / 2 - rootTop) / scrollable));
				});
				tour?.calibrate(measured);
			};
			calibrate();

			const onResize = () => {
				tour?.resize();
				calibrate();
			};
			window.addEventListener('resize', onResize);
			cleanups.push(() => window.removeEventListener('resize', onResize));

			// card images (lazily loaded, often not the declared aspect) grow the
			// cards after mount — remeasure so the camera stays on its keyframes
			rootEl.querySelectorAll('img').forEach((img) => {
				if (img.complete) return;
				img.addEventListener(
					'load',
					() => {
						ScrollTrigger.refresh();
						calibrate();
					},
					{ once: true }
				);
			});

			if (!reduced) {
				triggers.push(
					ScrollTrigger.create({
						trigger: rootEl,
						start: 'top top',
						end: 'bottom bottom',
						scrub: true,
						onUpdate: (self) => tour?.setProgress(self.progress)
					})
				);
			}

			const cards = Array.from(rootEl.querySelectorAll<HTMLElement>('.station'));
			cards.forEach((el, i) => {
				triggers.push(
					ScrollTrigger.create({
						trigger: el,
						start: 'top 60%',
						end: 'bottom 40%',
						onEnter: () => {
							active = i;
							tour?.setStation(i);
							// reduced motion: jump straight to this station's viewpoint
							if (reduced) tour?.setProgress(measured[i] ?? (i + 0.5) / cards.length);
						},
						onEnterBack: () => {
							active = i;
							tour?.setStation(i);
							if (reduced) tour?.setProgress(measured[i] ?? (i + 0.5) / cards.length);
						}
					})
				);
			});

			cleanups.push(() => triggers.forEach((t) => t.kill()));
		});

		return () => {
			killed = true;
			cleanups.forEach((fn) => fn());
			tour?.dispose();
		};
	});
</script>

<section class="tour" bind:this={rootEl} style:--n={stations.length}>
	<div class="stage" aria-hidden="true">
		<canvas bind:this={canvasEl} class:hidden={webglFailed}></canvas>
		{#if webglFailed}
			<div class="no-webgl">
				<p>The 3D reconstruction needs WebGL — the tour text below still tells the whole story.</p>
			</div>
		{/if}
		<div class="progress" role="presentation">
			{#each stations as s, i (s.id)}
				<span class="tick" class:on={i <= active}></span>
			{/each}
		</div>
	</div>

	<ol class="stations">
		{#each stations as s, i (s.id)}
			<li class="station" class:active={i === active}>
				<article class="card">
					<p class="kicker">{s.kicker}</p>
					<h2>{s.title}</h2>
					{#if s.badge}
						<p class="badge">{s.badge}</p>
					{/if}
					<p class="body">{s.body}</p>
					{#if s.quote}
						<blockquote>
							{s.quote.text}
							<cite>{s.quote.cite}</cite>
						</blockquote>
					{/if}
					{#if s.photo}
						<figure>
							<img
								src="{base}/img/{s.photo.src}"
								alt={s.photo.alt}
								loading="lazy"
								width="1200"
								height="900"
							/>
							<figcaption>{s.photo.label ?? 'The same place today'} — {s.photo.credit}</figcaption>
						</figure>
					{/if}
				</article>
			</li>
		{/each}
	</ol>
</section>

<style>
	.tour {
		position: relative;
	}

	.stage {
		position: sticky;
		top: 0;
		height: 100vh;
		height: 100svh;
		overflow: hidden;
	}

	canvas {
		width: 100%;
		height: 100%;
		display: block;
		/* the sky: cream at the page edge easing into a pastel blue, then a
		   green-tinged haze where it meets the land (the scene fog matches) */
		background: linear-gradient(
			180deg,
			#f8f2e4 0%,
			#dde9ee 26%,
			#c5dbe4 46%,
			#dfe2d0 60%,
			#b6c39c 100%
		);
	}

	canvas.hidden {
		display: none;
	}

	.no-webgl {
		height: 100%;
		display: grid;
		place-items: center;
		color: var(--ink-soft);
		font-style: italic;
		padding: var(--space-4);
		text-align: center;
	}

	.progress {
		position: absolute;
		left: 50%;
		bottom: 14px;
		transform: translateX(-50%);
		display: flex;
		gap: 7px;
	}

	.tick {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: color-mix(in srgb, var(--ink) 18%, transparent);
		transition: background 0.4s;
	}

	.tick.on {
		background: var(--saffron);
	}

	.stations {
		position: relative;
		margin: -100vh 0 0;
		margin-top: -100svh;
		padding: 0;
		list-style: none;
		z-index: 2;
		pointer-events: none;
	}

	.station {
		min-height: 138vh;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding: 0 clamp(var(--space-2), 5vw, var(--space-6));
	}

	.station:first-child {
		min-height: 100vh;
	}

	.card {
		pointer-events: auto;
		width: min(420px, 92vw);
		background: color-mix(in srgb, var(--paper-card) 94%, transparent);
		backdrop-filter: blur(3px);
		border: 1px solid color-mix(in srgb, var(--gold) 50%, transparent);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-card);
		padding: var(--space-3);
		opacity: 0.55;
		transform: translateY(8px);
		transition:
			opacity 0.45s ease,
			transform 0.45s ease;
	}

	.station.active .card {
		opacity: 1;
		transform: none;
	}

	.kicker {
		margin: 0 0 var(--space-1);
		font-size: 0.68rem;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: var(--ochre);
	}

	h2 {
		margin: 0 0 var(--space-2);
		font-size: 1.6rem;
	}

	.badge {
		display: inline-block;
		margin: 0 0 var(--space-2);
		font-size: 0.72rem;
		font-style: italic;
		color: var(--maroon);
		border: 1px dashed color-mix(in srgb, var(--maroon) 55%, transparent);
		border-radius: var(--radius);
		padding: 0.2rem 0.55rem;
	}

	.body {
		margin: 0 0 var(--space-2);
		font-family: var(--font-narrative);
		font-size: 0.95rem;
		line-height: 1.55;
	}

	blockquote {
		margin: 0;
		font-size: 0.88rem;
	}

	figure {
		margin: var(--space-2) 0 0;
	}

	img {
		display: block;
		width: auto;
		max-width: 100%;
		max-height: 42vh;
		height: auto;
		margin-inline: auto;
		border-radius: var(--radius);
		border: 1px solid color-mix(in srgb, var(--ink) 15%, transparent);
	}

	figcaption {
		font-size: 0.68rem;
		color: var(--ink-faint);
		margin-top: 0.3rem;
	}

	@media (max-width: 720px) {
		.station {
			align-items: flex-end;
			justify-content: center;
			padding: 0 var(--space-2) 9vh;
		}

		.card {
			width: 100%;
			max-height: 52vh;
			overflow-y: auto;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card {
			opacity: 1;
			transform: none;
			transition: none;
		}
	}
</style>
