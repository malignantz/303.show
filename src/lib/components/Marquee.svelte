<script>
	/** @type {{ count:number, dateLabel:string }} */
	let { count, dateLabel } = $props();
</script>

<div class="marquee" role="banner">
	<div class="bulbs" aria-hidden="true">
		{#each Array(9) as _, i}<i style="--i:{i}"></i>{/each}
	</div>
	<p class="kicker label">Now showing · {dateLabel}</p>
	<h1>
		<span class="big">TONIGHT</span>
	</h1>
	<p class="count mono">
		{#if count > 0}
			<strong>{count}</strong> {count === 1 ? 'show' : 'shows'} across the Front Range
		{:else}
			No shows listed tonight — scroll for what's coming
		{/if}
	</p>
	<div class="bulbs bottom" aria-hidden="true">
		{#each Array(9) as _, i}<i style="--i:{i}"></i>{/each}
	</div>
</div>

<style>
	.marquee {
		position: relative;
		margin: 1.25rem 0 0.5rem;
		padding: 1.4rem 1.25rem 1.5rem;
		border: 1px solid var(--line-strong);
		border-radius: 6px;
		background:
			radial-gradient(120% 140% at 50% 0%, color-mix(in srgb, var(--acid-amber) 9%, transparent), transparent 55%),
			linear-gradient(180deg, var(--surface-2), var(--surface));
		box-shadow: var(--shadow), inset 0 1px 0 var(--metal-hi);
		text-align: center;
		overflow: hidden;
	}
	.kicker {
		margin-bottom: 0.5rem;
	}
	h1 {
		margin: 0;
		line-height: 0.9;
	}
	.big {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(3.2rem, 17vw, 6rem);
		letter-spacing: 0.02em;
		background: linear-gradient(180deg, var(--ink) 20%, color-mix(in srgb, var(--ink) 55%, var(--acid-amber)) 120%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		text-shadow: 0 1px 0 var(--metal-hi);
	}
	.count {
		margin-top: 0.7rem;
		color: var(--ink-dim);
		font-size: 0.82rem;
	}
	.count strong {
		color: var(--acid-amber);
	}
	.bulbs {
		display: flex;
		justify-content: center;
		gap: clamp(0.6rem, 3.4vw, 1.1rem);
		margin-bottom: 0.7rem;
	}
	.bulbs.bottom {
		margin: 0.9rem 0 0;
	}
	.bulbs i {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--acid-amber);
		box-shadow: 0 0 8px color-mix(in srgb, var(--acid-amber) 70%, transparent);
		animation: chase 1.6s ease-in-out infinite;
		animation-delay: calc(var(--i) * 0.12s);
		opacity: 0.35;
	}
	@keyframes chase {
		0%,
		100% {
			opacity: 0.25;
		}
		50% {
			opacity: 1;
		}
	}
</style>
