<script>
	import '../app.css';
	import { page } from '$app/stores';
	import Wordmark from '$lib/components/Wordmark.svelte';
	import { stars } from '$lib/stars.svelte.js';
	import { browser } from '$app/environment';

	let { children } = $props();

	let theme = $state('dark');
	if (browser) theme = document.documentElement.dataset.theme || 'dark';

	function toggleTheme() {
		theme = theme === 'dark' ? 'light' : 'dark';
		document.documentElement.dataset.theme = theme;
		try {
			localStorage.setItem('303-theme', theme);
		} catch {}
	}

	const nav = [
		{ href: '/', label: 'Tonight', match: (p) => p === '/' },
		{ href: '/weekend', label: 'Weekend', match: (p) => p.startsWith('/weekend') },
		{ href: '/added', label: 'Just Added', match: (p) => p.startsWith('/added') },
		{ href: '/my', label: 'My Shows', match: (p) => p.startsWith('/my') }
	];
	let path = $derived($page.url.pathname);
</script>

<header class="topbar">
	<div class="wrap bar">
		<Wordmark />
		<div class="right">
			<a class="denver mono" href="/about">Denver &amp; the Front Range</a>
			<button class="theme" onclick={toggleTheme} aria-label="Toggle light / dark">
				{#if theme === 'dark'}☾{:else}☀{/if}
			</button>
		</div>
	</div>
</header>

<main class="wrap">
	{@render children()}
</main>

<footer class="wrap foot">
	<p class="mono">
		303.show — an independent, ad-free listing for the Denver live-music scene.
		<a href="/about">About &amp; credits →</a>
	</p>
</footer>

<nav class="bottomnav" aria-label="Primary">
	{#each nav as item}
		<a href={item.href} class="navlink" class:active={item.match(path)}>
			<span>{item.label}</span>
			{#if item.href === '/my' && stars.size}<i class="badge">{stars.size}</i>{/if}
		</a>
	{/each}
</nav>

<style>
	.topbar {
		position: sticky;
		top: 0;
		z-index: 20;
		background: linear-gradient(180deg, var(--bg) 70%, transparent);
		backdrop-filter: blur(8px);
		border-bottom: 1px solid var(--line);
	}
	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 3.5rem;
	}
	.right {
		display: flex;
		align-items: center;
		gap: 0.85rem;
	}
	.denver {
		color: var(--ink-faint);
		font-size: 0.66rem;
		letter-spacing: 0.04em;
	}
	@media (max-width: 480px) {
		.denver {
			display: none;
		}
	}
	.theme {
		display: grid;
		place-items: center;
		width: 2.1rem;
		height: 2.1rem;
		border: 1px solid var(--line-strong);
		border-radius: 50%;
		color: var(--ink-dim);
		font-size: 0.9rem;
		transition: color 0.15s, border-color 0.15s;
	}
	.theme:hover {
		color: var(--acid-amber);
		border-color: var(--acid-amber);
	}

	main {
		min-height: 60vh;
		padding-bottom: 6rem;
	}

	.foot {
		padding: 2rem 0 7rem;
		color: var(--ink-faint);
		font-size: 0.72rem;
		line-height: 1.7;
	}
	.foot a {
		color: var(--ink-dim);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.bottomnav {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 30;
		display: flex;
		justify-content: center;
		gap: 0.15rem;
		padding: 0.4rem 0.5rem calc(0.4rem + env(safe-area-inset-bottom));
		background: color-mix(in srgb, var(--surface) 88%, transparent);
		backdrop-filter: blur(16px) saturate(1.2);
		border-top: 1px solid var(--line-strong);
	}
	.navlink {
		position: relative;
		flex: 1;
		max-width: 8rem;
		text-align: center;
		padding: 0.55rem 0.4rem;
		border-radius: var(--radius);
		font-family: var(--font-mono);
		font-size: 0.68rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--ink-faint);
		transition: color 0.15s, background 0.15s;
	}
	.navlink:hover {
		color: var(--ink-dim);
	}
	.navlink.active {
		color: var(--ink);
		background: var(--surface-2);
	}
	.navlink.active::after {
		content: '';
		position: absolute;
		left: 50%;
		bottom: 0.25rem;
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: var(--acid-red);
		transform: translateX(-50%);
	}
	.badge {
		position: absolute;
		top: 0.15rem;
		right: 0.65rem;
		min-width: 1.05rem;
		height: 1.05rem;
		padding: 0 0.2rem;
		display: grid;
		place-items: center;
		font-style: normal;
		font-size: 0.6rem;
		color: #0b0b0d;
		background: var(--acid-amber);
		border-radius: 999px;
	}
</style>
