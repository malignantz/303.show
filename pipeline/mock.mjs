// Generates realistic mock rows in the same shape the Google Sheet CSV produces,
// so the whole pipeline + site can run before the real sheet is wired in.
// Dates are relative to "now" so Tonight is always populated in dev.

import { VENUES } from './venues.js';

const HEADLINERS = [
	'Neon Prairie', 'The Front Range', 'Cassette Sunday', 'Molly & the Ringtails',
	'Acidwash', 'Paper Lanterns', 'Sable Youth', 'The Ute Mountain Boys',
	'Velvet Teeth', 'Dry Ice', 'Marigold Static', 'Pale Blue Dot',
	'The Colfax Coyotes', 'Silver Plume', 'Honeywater', 'Bijou',
	'Ramona Falls Revival', 'Tumbleweed Choir', 'Lunar Module', 'Fever Cascade',
	'The Mile High Club', 'Slow Caves', 'Wildermiss', 'iZCALLi',
	'Post Paradise', 'The Still Tide', 'Kid Astronaut', 'Danielle Ate the Sandwich',
	'Flobots', 'Nathaniel Rateliff', 'The Lumineers', 'Big Gigantic',
	'Pretty Lights', 'SunSquabi', 'The Motet', 'DeVotchKa',
	'Gasoline Lollipops', 'Dragondeer', 'The Sweet Lillies', 'Trout Steak Revival'
];

const OPENERS = [
	'Cherry Spit', 'Low Gods', 'Baby Teeth', 'The Understudy', 'Glass Delphian',
	'Motel Radio', 'Sunboy', 'Palehound', 'Foothills', 'Wax Future', 'The Gold Room',
	'Ivory Circle', 'Retrofette', 'Plume Varia', 'Chess at Breakfast', 'Turvy Organ'
];

const GENRES = ['indie', 'rock', 'folk', 'electronic', 'punk', 'hip-hop', 'jam', 'americana', 'metal', 'jazz'];

// Deterministic-ish PRNG so a rebuild without sheet changes is stable-ish.
function mulberry32(a) {
	return function () {
		a |= 0; a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * Produce ~N days of mock rows starting today. Returns array of header-keyed
 * objects (same shape as CSV parse output).
 * @param {Date} now
 * @param {number} days
 */
export function mockRows(now = new Date(), days = 45) {
	const rand = mulberry32(20260722);
	const pick = (arr) => arr[Math.floor(rand() * arr.length)];
	const rows = [];
	const usedHeadliners = new Set();

	for (let d = 0; d < days; d++) {
		const day = new Date(now);
		day.setDate(now.getDate() + d);
		const dow = day.getDay(); // 0 Sun .. 6 Sat
		// More shows on weekends, fewer early week.
		const base = dow === 5 || dow === 6 ? 6 : dow === 0 || dow === 4 ? 4 : 2;
		const count = Math.max(1, base + Math.floor(rand() * 3) - 1);
		const venuesToday = shuffle([...VENUES], rand).slice(0, count);

		for (const venue of venuesToday) {
			let artist = pick(HEADLINERS);
			let guard = 0;
			while (usedHeadliners.has(artist + d) && guard++ < 5) artist = pick(HEADLINERS);
			usedHeadliners.add(artist + d);

			const nOpeners = Math.floor(rand() * 3);
			const support = shuffle([...OPENERS], rand).slice(0, nOpeners);
			const showHour = 19 + Math.floor(rand() * 3); // 7-9pm
			const time = `${((showHour + 11) % 12) + 1}:${rand() > 0.5 ? '00' : '30'}pm`;
			const doors = `${((showHour + 10) % 12) + 1}pm`;
			const isFree = rand() < 0.08;
			const lo = 12 + Math.floor(rand() * 6) * 5;
			const hi = lo + Math.floor(rand() * 4) * 5;
			const price = isFree ? 'Free' : hi > lo ? `$${lo}-${hi}` : `$${lo}`;
			const age = rand() < 0.5 ? '16+' : rand() < 0.6 ? '21+' : 'All Ages';

			rows.push({
				Date: fmt(day),
				Artist: artist,
				Support: support.join(', '),
				Venue: venue.name,
				Time: time,
				Doors: doors,
				Price: price,
				Age: age,
				Genre: pick(GENRES),
				Tickets: rand() < 0.85 ? `https://tickets.example.com/${venue.slug}/${d}` : '',
				Notes: rand() < 0.05 ? 'SOLD OUT' : ''
			});
		}
	}
	return rows;
}

function shuffle(arr, rand) {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(rand() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

function fmt(d) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
