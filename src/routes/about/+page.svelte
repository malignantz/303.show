<script>
	import { GENERATED_AT, SOURCE, ALL_SHOWS } from '$lib/shows.js';
	let updated = new Date(GENERATED_AT).toLocaleString('en-US', {
		dateStyle: 'medium',
		timeStyle: 'short'
	});
</script>

<svelte:head>
	<title>About 303.show</title>
	<meta name="description" content="What 303.show is, where the data comes from, and who to thank for it." />
</svelte:head>

<article class="about">
	<a class="back mono" href="/">← all shows</a>
	<h1>About</h1>

	<p class="lede">
		<strong>303.show</strong> is the fastest way to see what's playing tonight in Denver and along
		the Front Range. One list. No ads, no login, no algorithm deciding what you see.
	</p>

	<h2>Where the data comes from</h2>
	<p>
		The listings are built from a community-maintained spreadsheet kept up to date by hand by a
		local live-music obsessive. This site is a labor of love built on top of that labor of love —
		all credit for the data goes to them.
	</p>
	<p class="credit mono">
		{#if SOURCE === 'mock'}
			⚠ Currently showing sample data for development. Real listings land once the source sheet is
			wired in.
		{:else}
			Data maintained by the community. Spreadsheet credit + link goes here.
		{/if}
	</p>

	<h2>How it works</h2>
	<p>
		Once a day, an automated job reads the sheet, cleans it up, and rebuilds this site as plain,
		fast files served from a CDN. There's no database and nothing to sign into. Star a show and it's
		saved on your device only.
	</p>

	<h2>The name</h2>
	<p>
		303 is Denver's area code — and the Roland TB-303, the little silver synth that invented acid
		house. Tap the logo up top if your sound's on.
	</p>

	<dl class="stats mono">
		<div><dt>Shows listed</dt><dd>{ALL_SHOWS.length}</dd></div>
		<div><dt>Last updated</dt><dd>{updated}</dd></div>
		<div><dt>Cost to run</dt><dd>≈ $0</dd></div>
	</dl>

	<p class="foot mono">
		Not affiliated with any venue, promoter, or Roland. Show info can change — always confirm with
		the venue before you head out.
	</p>
</article>

<style>
	.about {
		padding-top: 1.2rem;
		max-width: 40rem;
	}
	.back {
		color: var(--ink-faint);
		font-size: 0.72rem;
	}
	.back:hover {
		color: var(--acid-amber);
	}
	h1 {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(2.4rem, 10vw, 3.4rem);
		margin: 0.8rem 0 1rem;
	}
	h2 {
		font-weight: 700;
		font-size: 1.1rem;
		margin: 1.8rem 0 0.5rem;
	}
	.lede {
		font-size: 1.15rem;
		line-height: 1.6;
		color: var(--ink);
	}
	p {
		color: var(--ink-dim);
		line-height: 1.7;
		margin-bottom: 0.6rem;
	}
	.credit {
		font-size: 0.78rem;
		color: var(--acid-amber);
		border-left: 2px solid var(--acid-amber);
		padding-left: 0.8rem;
	}
	.stats {
		display: grid;
		gap: 0;
		margin: 1.6rem 0;
		border-top: 1px solid var(--line-strong);
	}
	.stats > div {
		display: flex;
		justify-content: space-between;
		padding: 0.6rem 0;
		border-bottom: 1px solid var(--line);
	}
	.stats dt {
		color: var(--ink-faint);
		font-size: 0.72rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.stats dd {
		color: var(--ink);
	}
	.foot {
		font-size: 0.72rem;
		color: var(--ink-faint);
		margin-top: 1.5rem;
	}
</style>
