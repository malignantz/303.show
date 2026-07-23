<script>
	import { onMount } from 'svelte';
	import ShowList from '$lib/components/ShowList.svelte';
	import { justAdded, groupByDay } from '$lib/shows.js';

	let now = $state(new Date());
	onMount(() => (now = new Date()));
	let added = $derived(justAdded(now, 7));
	let groups = $derived(groupByDay(added, now));
</script>

<svelte:head>
	<title>Just added — new Denver shows this week | 303.show</title>
	<meta name="description" content="Shows added to the Denver listings in the last week. The reason to check back." />
</svelte:head>

<header class="page-head">
	<p class="label"><span class="pip"></span> Fresh drops</p>
	<h1>JUST ADDED</h1>
	<p class="sub mono">{added.length} new in the last 7 days</p>
</header>

{#if groups.length}
	<ShowList {groups} />
{:else}
	<p class="empty mono">Nothing new in the last week — the calendar's steady for now.</p>
{/if}

<style>
	.page-head {
		padding: 1.4rem 0 0.5rem;
	}
	.pip {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--acid-red);
		box-shadow: 0 0 8px var(--acid-red);
		margin-right: 0.35rem;
	}
	h1 {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(2.6rem, 12vw, 4.2rem);
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
