<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Marquee from '$lib/components/Marquee.svelte';
	import ShowList from '$lib/components/ShowList.svelte';
	import ShowRow from '$lib/components/ShowRow.svelte';
	import { tonight, upcoming, justAdded, groupByDay, dayLabel, localISO } from '$lib/shows.js';

	// Evaluate "now" on the client so Tonight matches the viewer's clock, not
	// build time. Start from build-time values for first paint, refine on mount.
	let now = $state(new Date());
	onMount(() => {
		now = new Date();
	});

	let ton = $derived(tonight(now));
	let added = $derived(justAdded(now).slice(0, 8));
	let river = $derived(groupByDay(upcoming(now), now));
	let todayLabel = $derived(dayLabel(localISO(now)).sublabel);

	function pickForMe() {
		const pool = ton.length ? ton : upcoming(now).slice(0, 40);
		if (!pool.length) return;
		const show = pool[Math.floor(Math.random() * pool.length)];
		goto(`/show/${show.slug}`);
	}
</script>

<svelte:head>
	<title>303.show — what's playing in Denver tonight</title>
	<meta
		name="description"
		content="The fastest way to see live music in Denver and the Front Range. Every show, tonight and beyond. No ads, no login."
	/>
</svelte:head>

<Marquee count={ton.length} dateLabel={todayLabel} />

<div class="actions">
	<button class="pick" onclick={pickForMe}>
		<span class="die">⚄</span> Pick a show for me
	</button>
</div>

{#if ton.length}
	<section class="tonight-list">
		{#each ton as show (show.id)}
			<ShowRow {show} />
		{/each}
	</section>
{/if}

{#if added.length}
	<section class="added">
		<header class="strip-head">
			<h2 class="label"><span class="pip"></span> Just added</h2>
			<a href="/added" class="more mono">all →</a>
		</header>
		<div class="added-scroll">
			{#each added as show (show.id)}
				<a class="chip" href="/show/{show.slug}">
					<span class="chip-artist">{show.artist}</span>
					<span class="chip-meta mono">{show.venue.name}</span>
				</a>
			{/each}
		</div>
	</section>
{/if}

<section class="river">
	<header class="river-head">
		<h2 class="label">The full calendar</h2>
	</header>
	{#if river.length}
		<ShowList groups={river.slice(1)} />
	{:else}
		<p class="empty mono">No upcoming shows in the data right now.</p>
	{/if}
</section>

<style>
	.actions {
		display: flex;
		justify-content: center;
		margin: 0.9rem 0 1.4rem;
	}
	.pick {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 1.1rem;
		border: 1px solid var(--line-strong);
		border-radius: 999px;
		font-family: var(--font-mono);
		font-size: 0.78rem;
		letter-spacing: 0.03em;
		color: var(--ink-dim);
		background: var(--surface);
		transition: transform 0.12s, color 0.15s, border-color 0.15s;
	}
	.pick:hover {
		color: var(--ink);
		border-color: var(--acid-amber);
		transform: translateY(-1px);
	}
	.die {
		font-size: 1.15rem;
		color: var(--acid-amber);
	}

	.tonight-list {
		margin-bottom: 2rem;
		border-top: 1px solid var(--line-strong);
	}

	.strip-head,
	.river-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin: 1.6rem 0 0.5rem;
	}
	.pip {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--acid-red);
		box-shadow: 0 0 8px var(--acid-red);
		margin-right: 0.35rem;
		vertical-align: middle;
	}
	.more {
		color: var(--ink-faint);
		font-size: 0.7rem;
	}
	.added-scroll {
		display: flex;
		gap: 0.6rem;
		overflow-x: auto;
		padding: 0.3rem 0 0.6rem;
		scroll-snap-type: x mandatory;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
	}
	.added-scroll::-webkit-scrollbar {
		display: none;
	}
	.chip {
		flex: 0 0 auto;
		scroll-snap-align: start;
		min-width: 9.5rem;
		max-width: 12rem;
		padding: 0.7rem 0.85rem;
		border: 1px solid var(--line-strong);
		border-radius: 5px;
		background: linear-gradient(180deg, var(--surface-2), var(--surface));
		transition: border-color 0.15s, transform 0.12s;
	}
	.chip:hover {
		border-color: var(--acid-red);
		transform: translateY(-2px);
	}
	.chip-artist {
		display: block;
		font-weight: 700;
		font-size: 0.92rem;
		line-height: 1.2;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.chip-meta {
		display: block;
		margin-top: 0.25rem;
		color: var(--ink-faint);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.empty {
		color: var(--ink-faint);
		padding: 2rem 0;
	}
</style>
