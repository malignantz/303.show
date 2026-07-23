// Client-side helpers over shows.json. Pure date math on ISO `YYYY-MM-DD`
// strings, evaluated in the viewer's local time so "Tonight" means their tonight.

import data from '$data/shows.json';

/** @typedef {typeof data.shows[number]} Show */

export const GENERATED_AT = data.generatedAt;
export const SOURCE = data.source;
/** @type {Show[]} */
export const ALL_SHOWS = data.shows;

/** Local YYYY-MM-DD for a Date. */
export function localISO(d = new Date()) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Parse an ISO date string as a local Date (midnight). */
export function parseISO(iso) {
	const [y, m, d] = iso.split('-').map(Number);
	return new Date(y, m - 1, d);
}

/** Whole-day difference (b - a) ignoring time. */
export function daysBetween(aISO, bISO) {
	return Math.round((parseISO(bISO) - parseISO(aISO)) / 86400000);
}

/** Shows today-or-later, already sorted by the pipeline. */
export function upcoming(now = new Date()) {
	const today = localISO(now);
	return ALL_SHOWS.filter((s) => s.date >= today && !s.cancelled);
}

export function tonight(now = new Date()) {
	const today = localISO(now);
	return ALL_SHOWS.filter((s) => s.date === today && !s.cancelled);
}

/** Fri/Sat/Sun of the current (or upcoming) weekend. */
export function weekend(now = new Date()) {
	const dow = now.getDay(); // 0 Sun .. 6 Sat
	const friOffset = dow === 0 ? -2 : 5 - dow; // if Sun, weekend is the just-passed one's Sun only → treat as this
	const fri = new Date(now);
	fri.setDate(now.getDate() + (dow === 0 ? -2 : friOffset));
	const days = new Set([0, 1, 2].map((i) => {
		const d = new Date(fri);
		d.setDate(fri.getDate() + i);
		return localISO(d);
	}));
	const today = localISO(now);
	return ALL_SHOWS.filter((s) => days.has(s.date) && s.date >= today && !s.cancelled);
}

/** Shows first seen within the last `days` days (git-diff "just added"). */
export function justAdded(now = new Date(), days = 4) {
	const today = localISO(now);
	return upcoming(now)
		.filter((s) => s.addedAt && daysBetween(s.addedAt, today) <= days && daysBetween(s.addedAt, today) >= 0)
		.sort((a, b) => (a.addedAt < b.addedAt ? 1 : a.addedAt > b.addedAt ? -1 : 0));
}

/** Group an array of shows into [{ date, label, sublabel, shows }]. */
export function groupByDay(shows, now = new Date()) {
	const today = localISO(now);
	const map = new Map();
	for (const s of shows) {
		if (!map.has(s.date)) map.set(s.date, []);
		map.get(s.date).push(s);
	}
	return [...map.entries()]
		.sort((a, b) => (a[0] < b[0] ? -1 : 1))
		.map(([date, list]) => ({ date, ...dayLabel(date, today), shows: list }));
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Human label for a date header relative to today. */
export function dayLabel(iso, today = localISO()) {
	const diff = daysBetween(today, iso);
	const d = parseISO(iso);
	const sublabel = `${MONTHS[d.getMonth()]} ${d.getDate()}`;
	if (diff === 0) return { label: 'Tonight', sublabel, soon: true };
	if (diff === 1) return { label: 'Tomorrow', sublabel, soon: true };
	if (diff > 1 && diff < 7) return { label: WEEKDAYS[d.getDay()], sublabel, soon: false };
	return { label: `${WEEKDAYS[d.getDay()]}`, sublabel, soon: false };
}

/** Compact time like "8pm" / "8:30pm" from 24h HH:MM. */
export function fmtTime(t) {
	if (!t) return '';
	const [h, m] = t.split(':').map(Number);
	const ap = h >= 12 ? 'pm' : 'am';
	const h12 = h % 12 === 0 ? 12 : h % 12;
	return m ? `${h12}:${String(m).padStart(2, '0')}${ap}` : `${h12}${ap}`;
}

/** CashOrTrade face-value resale search for an artist (works for any name). */
export function cashOrTradeUrl(artist) {
	return `https://cashortrade.org/search?q=${encodeURIComponent(artist)}`;
}

/** Google Maps search URL for a venue. */
export function mapUrl(venue) {
	const q = encodeURIComponent(venue.address || `${venue.name}, ${venue.city || 'Denver'}, CO`);
	return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/** Build a downloadable .ics blob URL for one show. */
export function icsFor(show) {
	const dt = show.date.replace(/-/g, '');
	const start = show.time ? show.time.replace(':', '') + '00' : '190000';
	const uid = `${show.id}@303.show`;
	const title = show.artist + (show.support?.length ? ` + ${show.support.join(', ')}` : '');
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//303.show//EN',
		'BEGIN:VEVENT',
		`UID:${uid}`,
		`DTSTART:${dt}T${start}`,
		`SUMMARY:${escICS(title)}`,
		`LOCATION:${escICS(show.venue.address || show.venue.name)}`,
		`DESCRIPTION:${escICS(`${title} at ${show.venue.name}. via 303.show`)}`,
		'END:VEVENT',
		'END:VCALENDAR'
	];
	return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(lines.join('\r\n'));
}

function escICS(s) {
	return String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
}
