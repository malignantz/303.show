import { error } from '@sveltejs/kit';
import { ALL_SHOWS } from '$lib/shows.js';

export function entries() {
	const seen = new Set();
	const out = [];
	for (const s of ALL_SHOWS) {
		if (!seen.has(s.venue.slug)) {
			seen.add(s.venue.slug);
			out.push({ slug: s.venue.slug });
		}
	}
	return out;
}

export function load({ params }) {
	const shows = ALL_SHOWS.filter((s) => s.venue.slug === params.slug);
	if (!shows.length) throw error(404, 'Venue not found');
	return { venue: shows[0].venue, shows };
}
