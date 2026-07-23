<script>
	import { fmtTime, mapUrl, icsFor, dayLabel, parseISO } from '$lib/shows.js';
	import StarButton from '$lib/components/StarButton.svelte';

	let { data } = $props();
	let show = $derived(data.show);

	let d = $derived(parseISO(show.date));
	let longDate = $derived(
		d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
	);
	let title = $derived(show.artist + (show.support?.length ? ` + ${show.support.join(', ')}` : ''));

	// Event schema for Google (the SEO backbone from the plan).
	let jsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'MusicEvent',
			name: title,
			startDate: show.time ? `${show.date}T${show.time}:00-06:00` : show.date,
			eventStatus: show.cancelled
				? 'https://schema.org/EventCancelled'
				: 'https://schema.org/EventScheduled',
			eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
			location: {
				'@type': 'MusicVenue',
				name: show.venue.name,
				address: show.venue.address || `${show.venue.name}, Denver, CO`
			},
			performer: [show.artist, ...(show.support || [])].map((n) => ({
				'@type': 'MusicGroup',
				name: n
			})),
			...(show.ticketUrl
				? { offers: { '@type': 'Offer', url: show.ticketUrl, availability: show.soldOut ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock' } }
				: {})
		})
	);

	function share() {
		const url = `https://303.show/show/${show.slug}`;
		if (navigator.share) navigator.share({ title, text: `${title} · ${show.venue.name}`, url }).catch(() => {});
		else navigator.clipboard?.writeText(url);
	}
</script>

<svelte:head>
	<title>{title} at {show.venue.name} — {longDate} | 303.show</title>
	<meta
		name="description"
		content={`${title} plays ${show.venue.name} in ${show.venue.city || 'Denver'} on ${longDate}.`}
	/>
	{@html `<script type="application/ld+json">${jsonLd}<\/script>`}
</svelte:head>

<article class="show">
	<a class="back mono" href="/">← all shows</a>

	<header class="head">
		<p class="when label">{dayLabel(show.date).label} · {longDate}</p>
		<div class="titlerow">
			<h1>{show.artist}</h1>
			<StarButton id={show.id} size={26} />
		</div>
		{#if show.support?.length}
			<p class="support">with {show.support.join(', ')}</p>
		{/if}
		<div class="badges">
			{#if show.free}<span class="tag tag--free">Free</span>{/if}
			{#if show.soldOut}<span class="tag tag--soldout">Sold out</span>{/if}
			{#if show.cancelled}<span class="tag tag--soldout">Cancelled</span>{/if}
		</div>
	</header>

	<dl class="facts">
		<div><dt>Venue</dt><dd><a href="/venue/{show.venue.slug}">{show.venue.name}</a></dd></div>
		{#if show.venue.neighborhood || show.venue.city}
			<div><dt>Where</dt><dd>{[show.venue.neighborhood, show.venue.city].filter((x, i, a) => x && a.indexOf(x) === i).join(', ')}</dd></div>
		{/if}
		{#if show.time}<div><dt>Show</dt><dd>{fmtTime(show.time)}{#if show.doorTime}{' · doors '}{fmtTime(show.doorTime)}{/if}</dd></div>{/if}
		{#if show.price?.text}<div><dt>Price</dt><dd>{show.price.text}</dd></div>{/if}
		{#if show.age}<div><dt>Ages</dt><dd>{show.age}</dd></div>{/if}
	</dl>

	<div class="cta">
		{#if show.ticketUrl && !show.cancelled}
			<a class="btn btn--primary" href={show.ticketUrl} target="_blank" rel="noopener nofollow">
				{show.soldOut ? 'Ticket info' : 'Get tickets'}{#if show.ticketPlatform}<span class="plat"
						>{show.ticketPlatform}</span
					>{/if} ↗
			</a>
		{/if}
		<a class="btn" href={mapUrl(show.venue)} target="_blank" rel="noopener">Map ↗</a>
		<a class="btn" href={icsFor(show)} download={`${show.slug}.ics`}>Add to calendar</a>
		<button class="btn" onclick={share}>Share</button>
	</div>

	{#if data.alsoAtVenue.length}
		<section class="also">
			<h2 class="label">More at {show.venue.name}</h2>
			<ul>
				{#each data.alsoAtVenue as s (s.id)}
					<li>
						<a href="/show/{s.slug}">
							<span class="also-artist">{s.artist}</span>
							<span class="also-date mono">{dayLabel(s.date).sublabel}</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</article>

<style>
	.show {
		padding-top: 1.2rem;
		max-width: 640px;
	}
	.back {
		color: var(--ink-faint);
		font-size: 0.72rem;
	}
	.back:hover {
		color: var(--acid-amber);
	}
	.head {
		margin: 1.2rem 0 1.4rem;
	}
	.when {
		color: var(--acid-amber);
		margin-bottom: 0.5rem;
	}
	.titlerow {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.5rem;
	}
	h1 {
		font-family: var(--font-body);
		font-weight: 800;
		font-size: clamp(1.9rem, 8vw, 3rem);
		line-height: 1.02;
		letter-spacing: -0.02em;
	}
	.support {
		margin-top: 0.4rem;
		color: var(--ink-dim);
		font-size: 1.02rem;
	}
	.badges {
		margin-top: 0.7rem;
		display: flex;
		gap: 0.4rem;
	}
	.facts {
		display: grid;
		gap: 0;
		border-top: 1px solid var(--line-strong);
		margin-bottom: 1.4rem;
	}
	.facts > div {
		display: grid;
		grid-template-columns: 6.5rem 1fr;
		gap: 0.5rem;
		padding: 0.7rem 0;
		border-bottom: 1px solid var(--line);
	}
	.facts dt {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-faint);
		padding-top: 0.15rem;
	}
	.facts dd {
		font-size: 1.02rem;
	}
	.facts dd a {
		color: var(--ink);
		text-decoration: underline;
		text-underline-offset: 3px;
		text-decoration-color: var(--line-strong);
	}
	.facts dd a:hover {
		text-decoration-color: var(--acid-amber);
	}

	.cta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		margin-bottom: 2rem;
	}
	.btn {
		display: inline-flex;
		align-items: center;
		padding: 0.7rem 1.1rem;
		border: 1px solid var(--line-strong);
		border-radius: 4px;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--ink);
		background: var(--surface);
		transition: border-color 0.15s, transform 0.12s, background 0.15s;
	}
	.btn:hover {
		border-color: var(--ink-dim);
		transform: translateY(-1px);
	}
	.btn--primary {
		background: var(--acid-red);
		border-color: var(--acid-red);
		color: #fff;
		font-weight: 700;
	}
	.btn--primary:hover {
		filter: brightness(1.08);
		border-color: var(--acid-red);
	}
	.plat {
		margin-left: 0.45rem;
		padding-left: 0.45rem;
		border-left: 1px solid rgba(255, 255, 255, 0.35);
		font-weight: 400;
		opacity: 0.9;
	}

	.also {
		border-top: 1px solid var(--line-strong);
		padding-top: 1rem;
	}
	.also ul {
		list-style: none;
		margin-top: 0.5rem;
	}
	.also li a {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.6rem 0;
		border-bottom: 1px solid var(--line);
	}
	.also li a:hover .also-artist {
		color: var(--acid-amber);
	}
	.also-artist {
		font-weight: 700;
	}
	.also-date {
		color: var(--ink-faint);
	}
</style>
