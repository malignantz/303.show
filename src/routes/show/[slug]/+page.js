import { error } from '@sveltejs/kit';
import { ALL_SHOWS } from '$lib/shows.js';

export function entries() {
	return ALL_SHOWS.map((s) => ({ slug: s.slug }));
}

export function load({ params }) {
	const show = ALL_SHOWS.find((s) => s.slug === params.slug);
	if (!show) throw error(404, 'Show not found');
	// A couple of other shows at the same venue, for the footer.
	const alsoAtVenue = ALL_SHOWS.filter(
		(s) => s.venue.slug === show.venue.slug && s.slug !== show.slug
	).slice(0, 4);
	return { show, alsoAtVenue };
}
