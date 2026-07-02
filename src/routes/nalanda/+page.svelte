<script lang="ts">
	import { base } from '$app/paths';
	import TourExperience from '$lib/components/tour/TourExperience.svelte';
	import PlaceDetailPanel from '$lib/components/place/PlaceDetailPanel.svelte';
	import { STATIONS } from './tour';

	let { data } = $props();

	const loadScene = () =>
		import('$lib/tour/nalandaScene').then(
			(m) => (canvas: HTMLCanvasElement) =>
				m.createNalandaTour(canvas, {
					standing: `${base}/models/standing-buddha.glb`,
					willow: `${base}/models/willow.glb`,
					mango: `${base}/models/mango.glb`,
					oak: `${base}/models/oak.glb`,
					plainTree: `${base}/models/plain-tree.glb`,
					banyan: `${base}/models/banyan-far.glb` // scatter-only here — hard-decimated
				})
		);
</script>

<svelte:head>
	<title>Nālandā — a 3D tour | Journeys to the West</title>
	<meta
		name="description"
		content="Walk through a reconstruction of Nālandā Mahāvihāra built from Xuanzang's and Yijing's own descriptions — the one gate, the courts of nine cells, Bālāditya's three-hundred-foot temple."
	/>
</svelte:head>

<header class="hero">
	<p class="eyebrow">A reconstruction from the pilgrims’ words</p>
	<h1>Nālandā</h1>
	<p class="lede">
		Xuanzang studied here for five years; Yijing lived here for ten. What follows is their
		monastery — the solid walls, courts and towers are taken from what the two of them wrote
		down, laid over the plan that archaeologists found in the ground at Bargaon; the translucent
		ones are the buried city that satellite surveys have since traced around it. Scroll to walk
		it, from Monastery 1 to the four-pointed mound of Begumpur.
	</p>
	<p class="hint" aria-hidden="true">scroll ↓</p>
</header>

<TourExperience stations={STATIONS} {loadScene} />

<section class="afterword">
	<h2>About this reconstruction</h2>
	<p class="prose">
		The solid buildings follow the excavated plan: Temple 3 amid its field of votive stupas, with
		Monasteries 18 and 1A at its side; Monasteries 1, 4, 6, 7, 8, 9, 10 and 11 in a line with
		their entrances to the west; Temple 2 and the Sarai temple east of the row; and the great
		domed Temple 12 with the śikhara towers of Temples 13 and 14 along the western axis. The translucent
		buildings are the satellite’s additions (M. B. Rajani, 2014; Das/Rajani 2016/19): the
		monastery row continuing south under the fields with one more temple and the circular
		field-mounds; two buried temples north of Temple 14 on the same axis — the larger drawn as
		Bālāditya’s unlocated “great temple, more than three hundred feet high” — with the Baragaon
		brick mound as a great stupa and a conjectured northern row of courts under the villages; the
		ring of tanks believed dug for brick-earth; and, at the far north, the four-pointed Begumpur
		quadrangle (~450 × 400 m), drawn in the manner of Somāpura. Translucency means exactly that:
		read from crop-marks, mounds and elevation, not yet excavated.
		Dimensions follow the pilgrims: walls “more than twenty feet high”, three-storeyed courts with
		nine cells to a row (Yijing), a copper Buddha of over eighty feet (Xuanzang). Where the
		witnesses differ from the spade — Xuanzang counts six royal monasteries, Yijing seven or
		eight, the archaeologists eleven — the scene follows the excavation and the cards quote the
		texts. Xuanzang knew one gate; the four cardinal gates of later Tibetan tradition are also
		drawn, the south gate remaining the gate of the texts. The library’s three halls appear only
		as saffron outlines in the northern mound cluster, because they appear in no pilgrim’s record
		and no record places them; buildings the pilgrims place far outside the walls (the Tārā
		temple, the villages) are drawn nearer than their true distance.
	</p>
	<p class="prose">
		Photographs of the site today are by their named photographers under Creative Commons
		licences (see captions). The full testimony of all three pilgrims, with verbatim quotations,
		is below.
	</p>
	<p class="prose credits">
		3D models are used under Creative Commons Attribution (CC BY 4.0): the copper colossus is
		<a href="https://skfb.ly/oUCYO" rel="noopener">“Gautama Buddha Standing”</a> by jamenng0724;
		the willow is <a href="https://skfb.ly/pAsxB" rel="noopener">“Silver willow tree”</a> by
		Georgeous; the mango is <a href="https://skfb.ly/osUzz" rel="noopener">“Mango Tree”</a> by
		stealth86; the oak is <a href="https://skfb.ly/oJCAA" rel="noopener">“Mighty Oak Trees”</a> by
		Jagobo; the plain trees are
		<a href="https://skfb.ly/oMXMs" rel="noopener">“Realistic Tree Models For Games”</a> by Mega
		Tree; and the banyan is
		<a href="https://skfb.ly/o7XxS" rel="noopener">“Chinese Banyan (Ficus Microcarpa)”</a> by
		Valery.Li.
	</p>
</section>

<section class="records">
	<h2>The records</h2>
	<PlaceDetailPanel detail={data.detail} mode="page" viewOnMapHref="{base}/map/?place=nalanda" />
</section>

<style>
	.hero {
		min-height: 72vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: var(--space-5) var(--space-3) var(--space-4);
	}

	.eyebrow {
		margin: 0 0 var(--space-1);
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.16em;
		color: var(--ochre);
	}

	h1 {
		margin: 0 0 var(--space-2);
		font-size: clamp(2.6rem, 7vw, 4.2rem);
	}

	.lede {
		max-width: 38rem;
		margin: 0;
		font-family: var(--font-narrative);
		font-size: 1.05rem;
		line-height: 1.6;
		color: var(--ink-soft);
	}

	.hint {
		margin-top: var(--space-4);
		color: var(--ink-faint);
		font-size: 0.85rem;
		animation: bob 2.2s ease-in-out infinite;
	}

	@keyframes bob {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(6px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hint {
			animation: none;
		}
	}

	.afterword,
	.records {
		max-width: 52rem;
		margin: 0 auto;
		padding: var(--space-5) var(--space-3) var(--space-2);
	}

	.records {
		padding-bottom: var(--space-6);
	}

	.afterword h2,
	.records h2 {
		margin: 0 0 var(--space-2);
	}

	.credits {
		margin-top: var(--space-2);
		font-size: 0.82rem;
		color: var(--ink-faint);
	}

	.credits a {
		color: inherit;
	}
</style>
