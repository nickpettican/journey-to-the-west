<script lang="ts">
	import { base } from '$app/paths';
	import TourExperience from '$lib/components/tour/TourExperience.svelte';
	import PlaceDetailPanel from '$lib/components/place/PlaceDetailPanel.svelte';
	import { STATIONS } from './tour';

	let { data } = $props();

	const loadScene = () =>
		import('$lib/tour/bodhgayaScene').then(
			(m) => (canvas: HTMLCanvasElement) =>
				m.createBodhgayaTour(canvas, {
					sitting: `${base}/models/sitting-buddha.glb`,
					standing: `${base}/models/standing-buddha.glb`,
					nicheA: `${base}/models/niche-buddha-a.glb`,
					nicheB: `${base}/models/niche-buddha-b.glb`,
					bodhiTree: `${base}/models/bodhi-tree.glb`,
					banyan: `${base}/models/banyan.glb`,
					bodhisattva: `${base}/models/bodhisattva.glb`,
					dancingBodhisattva: `${base}/models/bodhisattva-dancing.glb`,
					fastingBuddha: `${base}/models/buddha-fasting.glb`,
					scatterTrees: [
						`${base}/models/plain-tree.glb`,
						`${base}/models/willow-far.glb`,
						`${base}/models/mango.glb`,
						`${base}/models/oak.glb`
					],
					bones: `${base}/models/bone-pile.glb`
				})
		);
</script>

<svelte:head>
	<title>Bodh Gayā — a 3D tour | Journeys to the West</title>
	<meta
		name="description"
		content="Walk through a reconstruction of the Mahābodhi complex built from the pilgrims' own descriptions — the stone tower over the diamond seat, the bodhi tree, the seven stations, and the Sinhalese monastery."
	/>
</svelte:head>

<header class="hero">
	<p class="eyebrow">A reconstruction from the pilgrims’ words</p>
	<h1>Bodh Gayā</h1>
	<p class="lede">
		Under this tree the Buddha attained awakening. Faxian found it ringed with towers around 404;
		Xuanzang walked monument to monument in 637, writing each one down by its bearing from the
		tree; Yijing laid a silk robe on the statue in 674. What follows is their Mahābodhi — the
		walled enclosure and its stone tower, the diamond seat, the stations of the seven weeks, and
		the great monastery of the Sinhalese kings — with Cunningham’s excavation underfoot and the
		satellite’s findings drawn sand-pale. Scroll to walk it, from the western fields to the
		monastery court.
	</p>
	<p class="hint" aria-hidden="true">scroll ↓</p>
</header>

<TourExperience stations={STATIONS} {loadScene} />

<section class="afterword">
	<h2>About this reconstruction</h2>
	<p class="prose">
		The layout follows Xuanzang’s bearings — he places every monument by its cardinal direction
		from the bodhi tree — checked against Cunningham’s measured survey of 1892 (the excavated
		temple, railing, Buddha’s Walk, throne and monastery block) and the tanks that still hold
		water where the texts put them: the flower pool four hundred feet south of the temple,
		Indra’s pool beyond it, Mucilinda’s in its wood. The Great Temple is drawn in the grey stone
		of the building as it stands today; Xuanzang records its fabric as brick plastered with lime,
		and its height as one hundred and sixty or seventy feet on a base of twenty paces. The
		pot-shaped finial with its umbrellas follows his gilt-copper “precious pot”, and the curved
		towers follow the standing building. The tree, the terrace and the courtyard are ringed by
		three stone railings drawn to the vedikā design whose Aśokan pillars Cunningham excavated;
		Xuanzang’s “high and strong” brick wall is drawn as the outermost enclosure, taking in the
		courtyard and the flower pool. The seven-week stations are his monuments; the week
		numbers attached to them are later tradition and are badged as such. Structures known only
		from satellite survey — the monastery’s outer square and moat, the Sujātā stupa across the
		river — are translucent and sand-pale: read from imagery, not yet excavated. Where the
		sources disagree, the cards say so — Xuanzang puts the jewel house west of the tree where the
		modern complex shows it north-west, and the Saffron Stupa west where Cunningham read
		north-west. North-west of the tree, between the railings and the brick wall, a patch of
		ash-grey ground strewn with bone is the charnel ground that lies there today — a present-day
		feature none of the three pilgrims record, drawn only as the site is now found.
	</p>
	<p class="prose">
		The statues are 3D scans: the seated image inside the temple is posed as the pilgrims
		describe it — facing east, right hand touching the earth, its back against the wall the tree
		stands behind (at that station the solid temple thins to a faint translucent ghost of itself,
		its own stepped outline redrawn in fine lines, so the chamber shows through the building
		rather than a boxy stand-in);
		the brass image of the jewel house stands facing east; and two smaller scans are repeated
		through the tower’s niches for the “golden images” Xuanzang saw in every tier. The plates on
		the cards are Cunningham’s measured drawings and a photograph of the tower in ruin before its
		restoration, all public domain. The full testimony of all three pilgrims, with verbatim
		quotations, is below.
	</p>
	<p class="prose credits">
		3D models are used under Creative Commons Attribution (CC BY 4.0): the standing Buddha of the
		jewel house is
		<a href="https://skfb.ly/oUCYO" rel="noopener">“Gautama Buddha Standing”</a> by jamenng0724;
		the bodhi tree is <a href="https://skfb.ly/6SQuU" rel="noopener">“Bodhi Tree”</a> by Ashim
		Shakya; the banyan is
		<a href="https://skfb.ly/o7XxS" rel="noopener">“Chinese Banyan (Ficus Microcarpa)”</a> by
		Valery.Li; the two silver figures at the door are
		<a href="https://skfb.ly/Tqst" rel="noopener">“Bodhisattva B Low Poly”</a> by Francesco
		Coldesina; and the charnel-ground bones are
		<a href="https://skfb.ly/BKnU" rel="noopener">“Low Poly Bone Pile (Downloadable)”</a> by
		3dsauce.
	</p>
</section>

<section class="records">
	<h2>The records</h2>
	<PlaceDetailPanel detail={data.detail} mode="page" viewOnMapHref="{base}/map/?place=bodh-gaya" />
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
