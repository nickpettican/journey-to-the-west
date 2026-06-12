<script lang="ts">
	import { scaleLinear } from 'd3-scale';
	import { rollup } from 'd3-array';
	import { PILGRIM_COLOURS } from '$lib/data/colours';
	import type { Pilgrim, StopProperties } from '$lib/types';

	let {
		pilgrims,
		stops = [],
		year = $bindable(645),
		height = 84
	}: {
		pilgrims: Pilgrim[];
		stops?: StopProperties[];
		year?: number;
		height?: number;
	} = $props();

	let width = $state(600);
	let playing = $state(false);
	let raf = 0;

	const PAD = { l: 14, r: 14, top: 8 };

	// Polylinear compressed-gap scale: each journey window gets real width, the
	// empty centuries between them are honestly marked but compressed.
	const windows = $derived(
		pilgrims
			.map((p) => ({ id: p.id, name: p.name, start: p.journey.startYear, end: p.journey.endYear }))
			.sort((a, b) => a.start - b.start)
	);

	const scale = $derived.by(() => {
		const w = width - PAD.l - PAD.r;
		const domain: number[] = [];
		const range: number[] = [];
		const gapShare = 0.05;
		const winShare = (1 - gapShare * (windows.length - 1)) / windows.length;
		let x = 0;
		windows.forEach((win, i) => {
			domain.push(win.start - 1, win.end + 1);
			range.push(PAD.l + x * w, PAD.l + (x + winShare) * w);
			x += winShare;
			if (i < windows.length - 1) x += gapShare;
		});
		return scaleLinear().domain(domain).range(range).clamp(true);
	});

	const histogram = $derived(
		rollup(
			stops,
			(v) => v.length,
			(s) => s.pilgrim,
			(s) => s.year
		)
	);

	const maxCount = $derived(
		Math.max(1, ...[...histogram.values()].flatMap((m) => [...m.values()]))
	);

	const bandH = $derived(height - PAD.top - 30);

	function windowFor(y: number) {
		return windows.find((w) => y >= w.start && y <= w.end);
	}

	/** Snap a raw year into the nearest journey window. */
	function snap(y: number): number {
		if (windowFor(y)) return Math.round(y);
		let best = windows[0].start;
		let bestDist = Infinity;
		for (const w of windows) {
			for (const edge of [w.start, w.end]) {
				const d = Math.abs(edge - y);
				if (d < bestDist) {
					bestDist = d;
					best = edge;
				}
			}
		}
		return best;
	}

	function seek(clientX: number, svg: SVGSVGElement) {
		const rect = svg.getBoundingClientRect();
		year = snap(scale.invert(clientX - rect.left));
	}

	let dragging = $state(false);
	let svgEl: SVGSVGElement;

	function onPointerDown(e: PointerEvent) {
		dragging = true;
		(e.target as Element).setPointerCapture?.(e.pointerId);
		seek(e.clientX, svgEl);
	}
	function onPointerMove(e: PointerEvent) {
		if (dragging) seek(e.clientX, svgEl);
	}
	function onPointerUp() {
		dragging = false;
	}

	function onKey(e: KeyboardEvent) {
		const win = windowFor(year);
		if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
			year = snap(year + 1) === year ? nextEdge(1) : snap(year + 1);
			e.preventDefault();
		} else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
			year = snap(year - 1) === year ? nextEdge(-1) : snap(year - 1);
			e.preventDefault();
		} else if (e.key === 'PageDown' || e.key === 'PageUp') {
			const dir = e.key === 'PageDown' ? 1 : -1;
			const i = windows.findIndex((w) => w === win);
			const target = windows[Math.max(0, Math.min(windows.length - 1, (i === -1 ? 0 : i) + dir))];
			year = dir > 0 ? target.start : target.end;
			e.preventDefault();
		} else if (e.key === 'Home') {
			year = windows[0].start;
			e.preventDefault();
		} else if (e.key === 'End') {
			year = windows[windows.length - 1].end;
			e.preventDefault();
		}
	}

	function nextEdge(dir: 1 | -1): number {
		const win = windowFor(year);
		if (!win) return snap(year);
		if (dir === 1 && year >= win.end) {
			const i = windows.indexOf(win);
			return windows[i + 1]?.start ?? year;
		}
		if (dir === -1 && year <= win.start) {
			const i = windows.indexOf(win);
			return windows[i - 1]?.end ?? year;
		}
		return year + dir;
	}

	function togglePlay() {
		playing = !playing;
		if (playing) tick();
		else cancelAnimationFrame(raf);
	}

	let lastTick = 0;
	function tick(t = 0) {
		if (!playing) return;
		if (t - lastTick > 120) {
			lastTick = t;
			const next = nextEdge(1);
			if (next === year) {
				playing = false;
				return;
			}
			year = next;
		}
		raf = requestAnimationFrame(tick);
	}

	const valueText = $derived.by(() => {
		const win = windowFor(year);
		return win ? `${year} CE, during ${win.name}'s journey` : `${year} CE`;
	});

	const gaps = $derived(
		windows.slice(0, -1).map((w, i) => ({
			x1: scale(w.end + 1),
			x2: scale(windows[i + 1].start - 1),
			label: `${windows[i + 1].start - w.end} years`
		}))
	);
</script>

<div class="scrubber" style:--h="{height}px">
	<button
		class="play"
		onclick={togglePlay}
		aria-label={playing ? 'Pause the timeline' : 'Play the timeline'}
	>
		{#if playing}❚❚{:else}▶{/if}
	</button>
	<div class="track" bind:clientWidth={width}>
		<svg
			bind:this={svgEl}
			{height}
			width="100%"
			role="presentation"
			onpointerdown={onPointerDown}
			onpointermove={onPointerMove}
			onpointerup={onPointerUp}
		>
			<!-- journey bands with visit histograms -->
			{#each windows as win (win.id)}
				{@const x1 = scale(win.start - 1)}
				{@const x2 = scale(win.end + 1)}
				<rect
					x={x1}
					y={PAD.top}
					width={x2 - x1}
					height={bandH}
					rx="3"
					fill={PILGRIM_COLOURS[win.id]}
					opacity="0.13"
				/>
				{#each [...(histogram.get(win.id) ?? new Map())] as [y, count] (y)}
					{@const bw = Math.max(2, (x2 - x1) / (win.end - win.start + 2) - 1)}
					<rect
						x={scale(y) - bw / 2}
						y={PAD.top + bandH - (count / maxCount) * (bandH - 4)}
						width={bw}
						height={(count / maxCount) * (bandH - 4)}
						fill={PILGRIM_COLOURS[win.id]}
						opacity="0.55"
					/>
				{/each}
				<text x={(x1 + x2) / 2} y={height - 16} class="win-label" text-anchor="middle">
					{win.name}
				</text>
				<text x={x1} y={height - 4} class="tick" text-anchor="start">{win.start}</text>
				<text x={x2} y={height - 4} class="tick" text-anchor="end">{win.end}</text>
			{/each}

			<!-- compressed gaps: hatched, labelled, honest -->
			{#each gaps as gap (gap.x1)}
				<rect
					x={gap.x1}
					y={PAD.top}
					width={gap.x2 - gap.x1}
					height={bandH}
					fill="url(#hatch)"
					opacity="0.5"
				/>
				<text x={(gap.x1 + gap.x2) / 2} y={height - 16} class="gap-label" text-anchor="middle">
					~{gap.label}~
				</text>
			{/each}

			<defs>
				<pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
					<line x1="0" y1="0" x2="0" y2="6" stroke="#8b7b5e" stroke-width="1" />
				</pattern>
			</defs>

			<!-- handle -->
			<g
				class="handle"
				role="slider"
				tabindex="0"
				aria-label="Year"
				aria-valuemin={windows[0].start}
				aria-valuemax={windows[windows.length - 1].end}
				aria-valuenow={year}
				aria-valuetext={valueText}
				onkeydown={onKey}
				transform="translate({scale(year)},0)"
			>
				<line y1={PAD.top - 3} y2={PAD.top + bandH + 3} stroke="var(--maroon)" stroke-width="2" />
				<circle cy={PAD.top - 3} r="6" fill="var(--maroon)" stroke="var(--paper)" stroke-width="1.5" />
				<text y={PAD.top + bandH + 14} text-anchor="middle" class="year-label">{year} CE</text>
			</g>
		</svg>
	</div>
	<span class="visually-hidden" role="status" aria-live="polite">{valueText}</span>
</div>

<style>
	.scrubber {
		display: flex;
		align-items: stretch;
		gap: var(--space-2);
		width: 100%;
	}

	.play {
		flex: 0 0 auto;
		width: 2.2rem;
		border: 1px solid var(--ink-faint);
		border-radius: var(--radius);
		background: var(--paper-card);
		color: var(--maroon);
		font-size: 0.7rem;
	}

	.play:hover {
		background: var(--paper-deep);
	}

	.track {
		flex: 1;
		min-width: 0;
	}

	svg {
		display: block;
		touch-action: none;
		cursor: pointer;
	}

	.handle {
		cursor: ew-resize;
		outline-offset: 4px;
	}

	.win-label {
		font-family: var(--font-display);
		font-size: 12px;
		fill: var(--ink-soft);
	}

	.tick,
	.gap-label {
		font-size: 9.5px;
		fill: var(--ink-faint);
	}

	.year-label {
		font-size: 11px;
		font-weight: 600;
		fill: var(--maroon);
		paint-order: stroke;
		stroke: var(--paper);
		stroke-width: 3px;
	}
</style>
