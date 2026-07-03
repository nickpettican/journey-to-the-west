<script lang="ts">
	import '@fontsource/eb-garamond/400.css';
	import '@fontsource/eb-garamond/500.css';
	import '@fontsource/eb-garamond/400-italic.css';
	import '@fontsource/gentium-book-plus/400.css';
	import '@fontsource/gentium-book-plus/400-italic.css';
	import '@fontsource/gentium-book-plus/700.css';
	import '@fontsource/noto-sans/400.css';
	import '@fontsource/noto-sans/500.css';
	import '@fontsource/noto-sans/700.css';
	import '$lib/styles/tokens.css';
	import '$lib/styles/typography.css';
	import { base } from '$app/paths';
	import { page } from '$app/state';

	let { children } = $props();

	let menuOpen = $state(false);

	const nav = [
		{ href: `${base}/map/`, label: 'Map' },
		{ href: `${base}/journeys/`, label: 'Journeys' },
		{ href: `${base}/bodh-gaya/`, label: 'Bodh Gayā' },
		{ href: `${base}/nalanda/`, label: 'Nālandā' },
		{ href: `${base}/about/`, label: 'About' }
	];

	const external = [
		{ href: 'https://middlewaymusings.com', label: 'Blog' },
		{ href: 'https://offeringbowl.org', label: 'Donate' }
	];

	const isCurrent = (href: string) => page.url.pathname.startsWith(href.replace(/\/$/, ''));

	// close the menu on navigation
	$effect(() => {
		void page.url.pathname;
		menuOpen = false;
	});
</script>

<svelte:head>
	<link rel="icon" href="{base}/img/favicon.ico" sizes="32x32" />
	<link rel="icon" type="image/png" href="{base}/img/favicon.png" />
	<link rel="apple-touch-icon" href="{base}/img/apple-touch-icon.png" />
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>

<header class="site-header">
	<a class="brand" href="{base}/">
		<img class="monk" src="{base}/img/monk-pilgrim.svg" alt="" width="28" height="40" />
		<span>Journeys to the West</span>
	</a>

	<nav class="desktop-nav" aria-label="Main">
		{#each nav as item (item.href)}
			<a href={item.href} aria-current={isCurrent(item.href) ? 'page' : undefined}>
				{item.label}
			</a>
		{/each}
		{#each external as item (item.href)}
			<a class="ext" href={item.href} rel="noopener">{item.label}<span aria-hidden="true"></span></a>
		{/each}
	</nav>

	<button
		class="burger"
		aria-expanded={menuOpen}
		aria-controls="mobile-menu"
		aria-label={menuOpen ? 'Close menu' : 'Open menu'}
		onclick={() => (menuOpen = !menuOpen)}
	>
		<svg viewBox="0 0 24 24" aria-hidden="true">
			{#if menuOpen}
				<path d="M6 6 L18 18 M18 6 L6 18" />
			{:else}
				<path d="M4 7 H20 M4 12 H20 M4 17 H20" />
			{/if}
		</svg>
	</button>
</header>

{#if menuOpen}
	<nav id="mobile-menu" class="mobile-menu" aria-label="Main">
		{#each nav as item (item.href)}
			<a href={item.href} aria-current={isCurrent(item.href) ? 'page' : undefined}>
				{item.label}
			</a>
		{/each}
		<hr />
		{#each external as item (item.href)}
			<a class="ext" href={item.href} rel="noopener">{item.label}<span aria-hidden="true"> ↗</span></a>
		{/each}
	</nav>
{/if}

<main id="main">
	{@render children()}
</main>

<footer class="site-footer">
	<p class="colophon">
		Made by Tenpa Bhikshu, sponsored by
		<a href="https://offeringbowl.org" rel="noopener">Offering Bowl</a>. If you would like to see
		more projects like this, please
		<a href="https://offeringbowl.org" rel="noopener">join Offering Bowl</a>.
	</p>
	<p>
		Built from the records of Faxian (tr. James Legge, 1886), Xuanzang (tr. Li Rongxi, 1996) and
		Yijing (tr. Junjirō Takakusu, 1896). <a href="{base}/about/">Sources &amp; methodology</a>
	</p>
	<p class="credits">
		<a href="https://www.vecteezy.com/free-vector/monk" rel="noopener">Monk illustration by Vecteezy</a>
		· Basemap: Natural Earth
	</p>
</footer>

<style>
	.skip-link {
		position: absolute;
		left: -999px;
		top: 0;
		z-index: 100;
		background: var(--ink);
		color: var(--paper);
		padding: var(--space-2) var(--space-3);
	}

	.skip-link:focus {
		left: 0;
	}

	.site-header {
		position: sticky;
		top: 0;
		z-index: 50;
		height: var(--header-h);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		padding: 0 var(--space-3);
		background: color-mix(in srgb, var(--paper) 88%, transparent);
		backdrop-filter: blur(6px);
		border-bottom: 1px solid color-mix(in srgb, var(--ink-faint) 35%, transparent);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-display);
		font-size: 1.1rem;
		color: var(--ink);
		text-decoration: none;
		white-space: nowrap;
		min-width: 0;
	}

	.brand span {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.monk {
		height: 2.4rem;
		width: auto;
		flex: 0 0 auto;
	}

	.desktop-nav {
		display: flex;
		gap: var(--space-3);
		align-items: center;
	}

	.desktop-nav a {
		font-size: 0.9rem;
		color: var(--ink-soft);
		text-decoration: none;
		padding: var(--space-1) 0;
		border-bottom: 2px solid transparent;
		white-space: nowrap;
	}

	.desktop-nav a:hover {
		color: var(--maroon);
	}

	.desktop-nav a[aria-current='page'] {
		color: var(--maroon);
		border-bottom-color: var(--saffron);
	}

	.desktop-nav .ext {
		color: var(--ochre);
	}

	.burger {
		display: none;
		border: none;
		background: none;
		padding: var(--space-1);
		color: var(--ink);
	}

	.burger svg {
		width: 1.6rem;
		height: 1.6rem;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		fill: none;
	}

	.mobile-menu {
		display: none;
	}

	@media (max-width: 800px) {
		.desktop-nav {
			display: none;
		}

		.burger {
			display: block;
		}

		.mobile-menu {
			display: flex;
			flex-direction: column;
			position: sticky;
			top: var(--header-h);
			z-index: 49;
			background: var(--paper);
			border-bottom: 1px solid color-mix(in srgb, var(--ink-faint) 35%, transparent);
			box-shadow: var(--shadow-panel);
			padding: var(--space-2) var(--space-3) var(--space-3);
		}

		.mobile-menu a {
			font-family: var(--font-display);
			font-size: 1.15rem;
			color: var(--ink);
			text-decoration: none;
			padding: var(--space-2) 0;
			border-bottom: 1px solid color-mix(in srgb, var(--ink-faint) 20%, transparent);
		}

		.mobile-menu a[aria-current='page'] {
			color: var(--maroon);
		}

		.mobile-menu .ext {
			color: var(--ochre);
			font-size: 1rem;
		}

		.mobile-menu hr {
			border: none;
			border-top: 1px solid var(--gold);
			margin: var(--space-2) 0 0;
		}
	}

	main {
		min-height: calc(100vh - var(--header-h));
	}

	.site-footer {
		padding: var(--space-3) var(--space-4);
		border-top: 1px solid color-mix(in srgb, var(--ink-faint) 35%, transparent);
		background: var(--paper-deep);
	}

	.site-footer p {
		margin: 0;
		font-size: 0.85rem;
		color: var(--ink-soft);
		text-align: center;
	}

	.site-footer .colophon {
		max-width: 44rem;
		margin: var(--space-2) auto var(--space-3);
		font-family: var(--font-narrative);
		font-size: 1rem;
		color: var(--ink);
	}

	.site-footer .colophon a {
		color: var(--maroon);
		text-decoration: none;
		border-bottom: 1px solid var(--saffron);
	}

	.site-footer .colophon a:hover {
		color: var(--ochre);
	}

	.site-footer .credits {
		margin-top: var(--space-3);
		margin-bottom: var(--space-3);
		font-size: 0.7rem;
		color: var(--ink-faint);
	}

	.site-footer .credits a {
		color: var(--ink-faint);
	}
</style>
