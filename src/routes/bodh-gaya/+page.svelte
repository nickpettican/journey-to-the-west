<script lang="ts">
	import SitePagePlaceholder from '$lib/components/place/SitePagePlaceholder.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Bodh Gayā — Journeys to the West</title>
	<meta
		name="description"
		content="The Bodhi Tree and the Mahābodhi temple as three Chinese pilgrims saw them, 408–674 CE. A 3D tour is in preparation."
	/>
</svelte:head>

<SitePagePlaceholder
	detail={data.detail}
	intro="Under this tree the Buddha attained awakening. Faxian found it surrounded by towers in 408; Xuanzang measured its walls, shrines and the diamond seat in 637; Yijing offered a robe from Shantung before 'the image of the real face' in 674. Their descriptions are detailed enough to walk through — and one day soon, you will."
/>
