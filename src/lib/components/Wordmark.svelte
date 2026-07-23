<script>
	import { playAcidLine, toggleMute, isMuted } from '$lib/sequencer.js';

	let pulsing = $state(false);
	let muted = $state(false);

	async function tap() {
		muted = isMuted();
		if (muted) return;
		pulsing = true;
		await playAcidLine();
		pulsing = false;
	}
</script>

<a href="/" class="wm" onclick={tap} aria-label="303.show — home">
	<span class="three" class:pulse={pulsing}>303</span><span class="dot">.</span><span class="show"
		>show</span
	>
</a>

<style>
	.wm {
		display: inline-flex;
		align-items: baseline;
		font-family: var(--font-mono);
		font-weight: 700;
		font-size: 1.3rem;
		letter-spacing: -0.02em;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}
	.three {
		color: var(--ink);
		display: inline-block;
		transition: transform 0.1s;
	}
	.three.pulse {
		animation: acid 0.5s steps(4) infinite;
		color: var(--acid-amber);
	}
	.dot {
		color: var(--acid-red);
	}
	.show {
		color: var(--ink-dim);
	}
	@keyframes acid {
		0% {
			transform: translateY(0) skewX(0);
			text-shadow: none;
		}
		50% {
			transform: translateY(-1px) skewX(-4deg);
			text-shadow: 0 0 12px var(--acid-amber);
		}
		100% {
			transform: translateY(0) skewX(0);
		}
	}
</style>
