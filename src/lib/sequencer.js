// The easter egg: tap the wordmark, hear a TB-303 acid line.
// A resonant low-pass sweep over a sawtooth with per-step accent + slide —
// the three ingredients that make a 303 sound like a 303. Pure Web Audio,
// zero bytes of sample data. SSR-safe (all access guarded to the browser).

const MUTE_KEY = '303-muted';

// A classic 16-step acid pattern in semitone offsets from A1 (~55Hz).
// null = rest. `s` = slide into next note, `a` = accent (louder + brighter).
const PATTERN = [
	{ n: 0, a: true },
	{ n: 12, s: true },
	{ n: 0 },
	{ n: 15, a: true },
	{ n: 0, s: true },
	{ n: 3 },
	null,
	{ n: 12, a: true },
	{ n: 0 },
	{ n: 10, s: true },
	{ n: 12 },
	{ n: 0, a: true },
	{ n: 7, s: true },
	{ n: 3 },
	{ n: 12, a: true },
	{ n: 10 }
];

const ROOT = 55; // A1
const STEP = 0.14; // ~107 BPM sixteenths

let ctx = null;
let playing = false;

export function isMuted() {
	try {
		return localStorage.getItem(MUTE_KEY) === '1';
	} catch {
		return false;
	}
}

export function toggleMute() {
	const next = !isMuted();
	try {
		localStorage.setItem(MUTE_KEY, next ? '1' : '0');
	} catch {
		/* ignore */
	}
	return next;
}

function hz(semi) {
	return ROOT * Math.pow(2, semi / 12);
}

/** Play the full 16-step line once. Resolves when it finishes. */
export async function playAcidLine() {
	if (typeof window === 'undefined' || isMuted() || playing) return;
	const AC = window.AudioContext || window.webkitAudioContext;
	if (!AC) return;
	ctx = ctx || new AC();
	if (ctx.state === 'suspended') await ctx.resume();
	playing = true;

	const t0 = ctx.currentTime + 0.03;

	// Shared output chain: distortion-ish drive → master gain.
	const master = ctx.createGain();
	master.gain.value = 0.0;
	master.connect(ctx.destination);
	// gentle fade in/out so it doesn't click
	master.gain.setValueAtTime(0.0001, t0);
	master.gain.exponentialRampToValueAtTime(0.9, t0 + 0.04);

	PATTERN.forEach((step, i) => {
		if (!step) return;
		const start = t0 + i * STEP;
		const slide = step.s;
		const accent = step.a;
		const dur = STEP * (slide ? 1.9 : 1.05);

		const osc = ctx.createOscillator();
		osc.type = 'sawtooth';
		const f = hz(step.n);
		osc.frequency.setValueAtTime(f, start);
		if (slide) {
			const next = PATTERN[(i + 1) % PATTERN.length];
			if (next) osc.frequency.exponentialRampToValueAtTime(hz(next.n), start + STEP * 0.9);
		}

		// The 303 filter: resonant low-pass with a fast decaying envelope.
		const filter = ctx.createBiquadFilter();
		filter.type = 'lowpass';
		filter.Q.value = accent ? 14 : 9;
		const base = accent ? 1100 : 500;
		const peak = accent ? 5200 : 2600;
		filter.frequency.setValueAtTime(peak, start);
		filter.frequency.exponentialRampToValueAtTime(base, start + dur * 0.9);

		const amp = ctx.createGain();
		const vol = accent ? 0.9 : 0.55;
		amp.gain.setValueAtTime(0.0001, start);
		amp.gain.exponentialRampToValueAtTime(vol, start + 0.006);
		amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);

		osc.connect(filter);
		filter.connect(amp);
		amp.connect(master);
		osc.start(start);
		osc.stop(start + dur + 0.02);
	});

	const total = t0 + PATTERN.length * STEP;
	master.gain.setValueAtTime(0.9, total - 0.05);
	master.gain.exponentialRampToValueAtTime(0.0001, total + 0.1);

	await new Promise((r) => setTimeout(r, PATTERN.length * STEP * 1000 + 120));
	playing = false;
}
