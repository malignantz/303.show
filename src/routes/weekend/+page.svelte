<script>
	import { onMount } from 'svelte';
	import ShowList from '$lib/components/ShowList.svelte';
	import { weekend, groupByDay } from '$lib/shows.js';

	let now = $state(new Date());
	onMount(() => (now = new Date()));
	let groups = $derived(groupByDay(weekend(now), now));
	let total = $derived(groups.reduce((n, g) => n + g.shows.length, 0));
</script>

<svelte:head>
	<title>This weekend in Denver | 303.show</title>
	<meta name="description" content="Every show this Friday, Saturday, and Sunday across Denver and the Front Range." />
</svelte:head>

<header class="page-head">
	<p class="label">The weekend list</p>
	<h1>THIS WEEKEND</h1>
	<p class="sub mono">{total} {total === 1 ? 'show' : 'shows'} · Fri–Sun</p>
</header>

{#if groups.length}
	<ShowList {groups} />
{:else}
	<p class="empty mono">Nothing listed for this weekend yet — check back midweek.</p>
{/if}

<style>
	.page-head {
		padding: 1.4rem 0 0.5rem;
	}
	h1 {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(2.6rem, 12vw, 4.2rem);
		letter-spacing: 0.01em;
		line-height: 0.95;
		margin: 0.3rem 0;
	}
	.sub {
		color: var(--ink-dim);
	}
	.empty {
		color: var(--ink-faint);
		padding: 2rem 0;
	}
</style>
