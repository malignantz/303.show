<script>
	import { stars } from '$lib/stars.svelte.js';

	/** @type {{ id: string, size?: number }} */
	let { id, size = 20 } = $props();
	let starred = $derived(stars.has(id));
</script>

<button
	class="star"
	class:on={starred}
	aria-pressed={starred}
	aria-label={starred ? 'Remove from your shows' : 'Save to your shows'}
	onclick={(e) => {
		e.preventDefault();
		e.stopPropagation();
		stars.toggle(id);
	}}
>
	<svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
		<path
			d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L12 16.9l-5.2 2.72.99-5.8-4.21-4.1 5.82-.85z"
			fill={starred ? 'currentColor' : 'none'}
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linejoin="round"
		/>
	</svg>
</button>

<style>
	.star {
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		color: var(--ink-faint);
		transition: color 0.15s, transform 0.15s;
		-webkit-tap-highlight-color: transparent;
	}
	.star:hover {
		color: var(--ink-dim);
	}
	.star.on {
		color: var(--acid-amber);
	}
	.star.on svg {
		filter: drop-shadow(0 0 6px color-mix(in srgb, var(--acid-amber) 60%, transparent));
		animation: pop 0.28s ease;
	}
	@keyframes pop {
		0% {
			transform: scale(0.7);
		}
		60% {
			transform: scale(1.22);
		}
		100% {
			transform: scale(1);
		}
	}
</style>
