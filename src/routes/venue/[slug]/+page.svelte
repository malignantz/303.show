<script>
	import { onMount } from 'svelte';
	import ShowList from '$lib/components/ShowList.svelte';
	import { groupByDay, upcoming, mapUrl } from '$lib/shows.js';

	let { data } = $props();
	let now = $state(new Date());
	onMount(() => (now = new Date()));

	let venue = $derived(data.venue);
	let upcomingHere = $derived(
		data.shows.filter((s) => upcoming(now).some((u) => u.id === s.id))
	);
	let groups = $derived(groupByDay(upcomingHere, now));
</script>

<svelte:head>
	<title>{venue.name} — upcoming shows | 303.show</title>
	<meta
		name="description"
		content={`Upcoming concerts at ${venue.name}${venue.neighborhood ? `, ${venue.neighborhood}` : ''} in ${venue.city || 'Denver'}.`}
	/>
</svelte:head>

<div class="venue">
	<a class="back mono" href="/">← all shows</a>
	<header class="head">
		<p class="label">Venue</p>
		<h1>{venue.name}</h1>
		{#if venue.address}
			<a class="addr mono" href={mapUrl(venue)} target="_blank" rel="noopener">
				{venue.address} ↗
			</a>
		{:else if venue.neighborhood}
			<p class="addr mono">{venue.neighborhood}, {venue.city}</p>
		{/if}
	</header>

	{#if groups.length}
		<ShowList {groups} />
	{:else}
		<p class="empty mono">No upcoming shows listed here right now.</p>
	{/if}
</div>

<style>
	.venue {
		padding-top: 1.2rem;
	}
	.back {
		color: var(--ink-faint);
		font-size: 0.72rem;
	}
	.back:hover {
		color: var(--acid-amber);
	}
	.head {
		margin: 1.1rem 0 1rem;
	}
	h1 {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(2.2rem, 9vw, 3.4rem);
		letter-spacing: 0.01em;
		text-transform: uppercase;
		margin: 0.3rem 0;
	}
	.addr {
		color: var(--ink-dim);
		font-size: 0.78rem;
	}
	.addr:hover {
		color: var(--acid-amber);
	}
	.empty {
		color: var(--ink-faint);
		padding: 2rem 0;
	}
</style>
