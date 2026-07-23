<script>
	import ShowRow from './ShowRow.svelte';

	/** @type {{ groups: Array<{date:string,label:string,sublabel:string,soon?:boolean,shows:any[]}> }} */
	let { groups } = $props();
</script>

<div class="list">
	{#each groups as g (g.date)}
		<section class="day">
			<header class="day-head" class:soon={g.soon}>
				<h2 class="day-label">{g.label}</h2>
				<span class="day-date mono">{g.sublabel}</span>
				<span class="day-count mono">{g.shows.length}</span>
			</header>
			{#each g.shows as show (show.id)}
				<ShowRow {show} />
			{/each}
		</section>
	{/each}
</div>

<style>
	.day-head {
		position: sticky;
		top: 0;
		z-index: 5;
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		padding: 0.85rem 0 0.5rem;
		margin-top: 0.4rem;
		background: linear-gradient(180deg, var(--bg) 62%, transparent);
		backdrop-filter: blur(2px);
		border-bottom: 1px solid var(--line-strong);
	}
	.day-label {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 1.5rem;
		letter-spacing: 0.01em;
		text-transform: uppercase;
		color: var(--ink);
	}
	.day-head.soon .day-label {
		color: var(--acid-amber);
	}
	.day-date {
		color: var(--ink-faint);
		letter-spacing: 0.06em;
	}
	.day-count {
		margin-left: auto;
		color: var(--ink-faint);
		font-size: 0.72rem;
	}
	.day-count::before {
		content: '';
	}
</style>
