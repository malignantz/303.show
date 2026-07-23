<script>
	import { onMount } from 'svelte';
	import ShowList from '$lib/components/ShowList.svelte';
	import { stars } from '$lib/stars.svelte.js';
	import { ALL_SHOWS, upcoming, groupByDay, daysBetween, localISO, fmtTime } from '$lib/shows.js';

	let now = $state(new Date());
	onMount(() => (now = new Date()));

	let mine = $derived(upcoming(now).filter((s) => stars.has(s.id)));
	let groups = $derived(groupByDay(mine, now));
	let next = $derived(mine[0]);
	let countdown = $derived(next ? daysBetween(localISO(now), next.date) : null);
</script>

<svelte:head>
	<title>My shows | 303.show</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<header class="page-head">
	<p class="label">Saved locally · no account needed</p>
	<h1>MY SHOWS</h1>
</header>

{#if mine.length}
	{#if next}
		<div class="next">
			<p class="mono next-label">Your next show</p>
			<p class="next-line">
				<a href="/show/{next.slug}"><strong>{next.artist}</strong></a>
				<span class="mono next-meta"
					>{next.venue.name}{#if next.time} · {fmtTime(next.time)}{/if}</span
				>
			</p>
			<p class="countdown mono">
				{#if countdown === 0}Tonight ●{:else if countdown === 1}Tomorrow{:else}in {countdown} days{/if}
			</p>
		</div>
	{/if}
	<ShowList {groups} />
{:else}
	<div class="empty">
		<p class="big mono">☆</p>
		<h2>No saved shows yet</h2>
		<p class="hint">
			Tap the ☆ on any show to save it here. Your list lives on this device — no login, no
			tracking. Great for planning a weekend or remembering that one Tuesday gig.
		</p>
		<a class="cta mono" href="/">Browse tonight's shows →</a>
	</div>
{/if}

<style>
	.page-head {
		padding: 1.4rem 0 0.8rem;
	}
	h1 {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(2.6rem, 12vw, 4.2rem);
		line-height: 0.95;
		margin: 0.3rem 0;
	}
	.next {
		border: 1px solid var(--line-strong);
		border-left: 3px solid var(--acid-amber);
		border-radius: 5px;
		padding: 0.9rem 1rem;
		margin-bottom: 1.4rem;
		background: linear-gradient(180deg, var(--surface-2), var(--surface));
	}
	.next-label {
		color: var(--ink-faint);
		font-size: 0.66rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}
	.next-line {
		margin-top: 0.3rem;
		font-size: 1.15rem;
	}
	.next-line strong {
		font-weight: 800;
	}
	.next-meta {
		color: var(--ink-dim);
		margin-left: 0.5rem;
		font-size: 0.8rem;
	}
	.countdown {
		margin-top: 0.35rem;
		color: var(--acid-amber);
		font-size: 0.85rem;
	}
	.empty {
		text-align: center;
		padding: 3rem 1rem;
	}
	.empty .big {
		font-size: 3rem;
		color: var(--ink-faint);
	}
	.empty h2 {
		margin: 0.5rem 0;
		font-weight: 700;
	}
	.hint {
		max-width: 30rem;
		margin: 0 auto 1.4rem;
		color: var(--ink-dim);
		font-size: 0.92rem;
		line-height: 1.6;
	}
	.cta {
		color: var(--acid-amber);
		border-bottom: 1px solid currentColor;
		padding-bottom: 2px;
	}
</style>
