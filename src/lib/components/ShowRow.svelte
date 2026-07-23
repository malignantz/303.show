<script>
	import { fmtTime, daysBetween, localISO } from '$lib/shows.js';
	import StarButton from './StarButton.svelte';

	/** @type {{ show: any, showDate?: boolean }} */
	let { show, showDate = false } = $props();

	let isNew = $derived(show.addedAt && daysBetween(show.addedAt, localISO()) <= 4);
	let meta = $derived(
		[
			show.venue.name,
			show.time && fmtTime(show.time),
			show.free ? 'Free' : show.price?.text
		].filter(Boolean)
	);
</script>

<a class="row" href="/show/{show.slug}" data-sveltekit-preload-data="tap">
	<div class="body">
		<h3 class="artist">
			{show.artist}{#if show.support?.length}<span class="support"
					>&nbsp;+ {show.support.join(', ')}</span
				>{/if}
		</h3>
		<p class="meta mono">
			{#each meta as bit, i}{#if i > 0}<span class="dot">·</span>{/if}<span>{bit}</span>{/each}
			{#if show.age}<span class="dot">·</span><span class="age">{show.age}</span>{/if}
		</p>
	</div>

	<div class="marks">
		{#if isNew}<span class="tag tag--new">New</span>{/if}
		{#if show.soldOut}<span class="tag tag--soldout">Sold out</span>{/if}
	</div>

	<StarButton id={show.id} />
</a>

<style>
	.row {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		gap: 0.5rem;
		min-height: var(--row-h);
		padding: 0.6rem 0;
		border-bottom: 1px solid var(--line);
		transition: background 0.12s;
	}
	.row:hover {
		background: linear-gradient(90deg, transparent, var(--metal-hi) 30%, transparent);
	}
	.body {
		min-width: 0;
	}
	.artist {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 1.06rem;
		line-height: 1.15;
		letter-spacing: -0.01em;
		color: var(--ink);
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
	.support {
		font-weight: 400;
		color: var(--ink-dim);
	}
	.meta {
		margin-top: 0.2rem;
		color: var(--ink-dim);
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.05rem;
	}
	.dot {
		margin: 0 0.4em;
		color: var(--ink-faint);
	}
	.age {
		color: var(--ink-faint);
	}
	.marks {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		align-items: flex-end;
	}
</style>
