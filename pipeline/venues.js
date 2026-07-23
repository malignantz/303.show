// Venue registry for the Denver / Front Range metro.
//
// The source sheet is typed by a human, so venue names arrive spelled three
// different ways ("Hi-Dive", "hi dive", "The Hi-Dive"). We key off a normalized
// alias -> canonical venue. Unknown venues still render (we synthesize a slug),
// they just won't get an address/neighborhood until added here. Log, never drop.

/** @typedef {{ name:string, slug:string, neighborhood:string, city:string, address:string, aliases:string[] }} Venue */

/** @type {Venue[]} */
export const VENUES = [
	v('Red Rocks Amphitheatre', 'red-rocks', 'Morrison', 'Morrison', '18300 W Alameda Pkwy, Morrison, CO 80465', ['red rocks', 'red rocks amphitheater']),
	v('Ball Arena', 'ball-arena', 'Auraria', 'Denver', '1000 Chopper Cir, Denver, CO 80204', ['pepsi center']),
	v('Mission Ballroom', 'mission-ballroom', 'RiNo', 'Denver', '4242 Wynkoop St, Denver, CO 80216', ['mission']),
	v('Fillmore Auditorium', 'fillmore-auditorium', 'Capitol Hill', 'Denver', '1510 Clarkson St, Denver, CO 80218', ['fillmore', 'the fillmore']),
	v('Ogden Theatre', 'ogden-theatre', 'Capitol Hill', 'Denver', '935 E Colfax Ave, Denver, CO 80218', ['ogden', 'the ogden', 'ogden theater']),
	v('Gothic Theatre', 'gothic-theatre', 'Englewood', 'Englewood', '3263 S Broadway, Englewood, CO 80113', ['gothic', 'the gothic', 'gothic theater']),
	v('Bluebird Theater', 'bluebird-theater', 'Bluebird District', 'Denver', '3317 E Colfax Ave, Denver, CO 80206', ['bluebird', 'the bluebird', 'bluebird theatre']),
	v("Cervantes' Masterpiece Ballroom", 'cervantes-masterpiece', 'Five Points', 'Denver', '2637 Welton St, Denver, CO 80205', ['cervantes', 'cervantes masterpiece', "cervantes' masterpiece"]),
	v("Cervantes' Other Side", 'cervantes-other-side', 'Five Points', 'Denver', '2635 Welton St, Denver, CO 80205', ['other side', 'cervantes other side', 'otherside', 'cervantes otherside']),
	v('Marquis Theater', 'marquis-theater', 'LoDo', 'Denver', '2009 Larimer St, Denver, CO 80205', ['marquis', 'the marquis', 'marquis theatre']),
	v('Summit Music Hall', 'summit-music-hall', 'Ballpark', 'Denver', '1902 Blake St, Denver, CO 80202', ['summit', 'the summit']),
	v('Larimer Lounge', 'larimer-lounge', 'RiNo', 'Denver', '2721 Larimer St, Denver, CO 80205', ['larimer', 'the larimer lounge']),
	v('Hi-Dive', 'hi-dive', 'South Broadway', 'Denver', '7 S Broadway, Denver, CO 80209', ['hidive', 'hi dive', 'the hi-dive']),
	v('Globe Hall', 'globe-hall', 'Globeville', 'Denver', '4483 Logan St, Denver, CO 80216', ['globe', 'the globe hall']),
	v("Lion's Lair", 'lions-lair', 'City Park West', 'Denver', '2022 E Colfax Ave, Denver, CO 80206', ['lions lair', 'the lions lair', "lion's lair lounge"]),
	v('Lost Lake Lounge', 'lost-lake', 'Bluebird District', 'Denver', '3602 E Colfax Ave, Denver, CO 80206', ['lost lake', 'lost lake lounge']),
	v('Skylark Lounge', 'skylark-lounge', 'South Broadway', 'Denver', '140 S Broadway, Denver, CO 80209', ['skylark', 'the skylark']),
	v('Meow Wolf Denver', 'meow-wolf', 'Sun Valley', 'Denver', '1338 1st St, Denver, CO 80204', ['meow wolf', 'meowwolf', 'convergence station']),
	v('Levitt Pavilion Denver', 'levitt-pavilion', 'Ruby Hill', 'Denver', '1380 W Florida Ave, Denver, CO 80223', ['levitt', 'levitt pavilion']),
	v('Boulder Theater', 'boulder-theater', 'Downtown Boulder', 'Boulder', '2032 14th St, Boulder, CO 80302', ['boulder theatre', 'the boulder theater']),
	v('Fox Theatre', 'fox-theatre-boulder', 'The Hill', 'Boulder', '1135 13th St, Boulder, CO 80302', ['fox', 'the fox', 'fox theater', 'fox theatre boulder']),
	v('Aggie Theatre', 'aggie-theatre', 'Old Town', 'Fort Collins', '204 S College Ave, Fort Collins, CO 80524', ['aggie', 'the aggie', 'aggie theater']),
	v('Washingtons', 'washingtons', 'Old Town', 'Fort Collins', '132 Laporte Ave, Fort Collins, CO 80521', ["washington's", 'washingtons fort collins']),
	v('The Black Buzzard', 'black-buzzard', 'Ballpark', 'Denver', '1644 Platte St, Denver, CO 80202', ['black buzzard', 'buzzard']),
	v('Roxy Theatre', 'roxy-theatre', 'Five Points', 'Denver', '2549 Welton St, Denver, CO 80205', ['roxy', 'the roxy']),
	v('Oriental Theater', 'oriental-theater', 'Berkeley', 'Denver', '4335 W 44th Ave, Denver, CO 80212', ['oriental', 'the oriental theater', 'oriental theatre']),
	v('Paramount Theatre', 'paramount-theatre', 'Downtown', 'Denver', '1621 Glenarm Pl, Denver, CO 80202', ['paramount', 'the paramount', 'paramount theater']),
	v('The Black Box', 'black-box', 'Capitol Hill', 'Denver', '314 E 13th Ave, Denver, CO 80203', ['black box', 'the black box denver']),
	v('7th Circle Music Collective', '7th-circle', 'Villa Park', 'Denver', '2935 W 7th Ave, Denver, CO 80204', ['7th circle', 'seventh circle', '7th circle music collective']),
	v('Goosetown Tavern', 'goosetown-tavern', 'Congress Park', 'Denver', '3242 E Colfax Ave, Denver, CO 80206', ['goosetown', 'goosetown taven']),
	v("Moe's Original BBQ", 'moes-original-bbq', 'Englewood', 'Englewood', '3295 S Broadway, Englewood, CO 80113', ["moe's bbq", 'moes bbq', "moe's original bbq", "moe's"]),
	v('HQ', 'hq-denver', 'Baker', 'Denver', '60 S Broadway, Denver, CO 80209', ['hq denver', 'hq']),
	v('Bar 404', 'bar-404', 'Baker', 'Denver', '404 Broadway, Denver, CO 80203', ['bar404', 'bar 404']),
	v('The Federal Theatre', 'federal-theatre', 'Chaffee Park', 'Denver', '', ['federal theatre', 'the federal', 'federal theater']),
	v('Ante Up Lounge', 'ante-up', 'Elyria-Swansea', 'Denver', '', ['ante up', 'ante up lounge']),
	v('Junkyard', 'junkyard', 'Denver', 'Denver', '', ['junkyard social', 'the junkyard']),
	v("Fiddler's Green Amphitheatre", 'fiddlers-green', 'Greenwood Village', 'Greenwood Village', '6350 Greenwood Plaza Blvd, Greenwood Village, CO 80111', ['fiddlers green', "fiddler's green", 'fiddlers green amphitheatre']),
	v('Ford Amphitheater', 'ford-amphitheater', 'Colorado Springs', 'Colorado Springs', '', ['ford amphitheater', 'ford amphitheatre']),
	v('The Black Sheep', 'black-sheep', 'Colorado Springs', 'Colorado Springs', '2106 E Platte Ave, Colorado Springs, CO 80909', ['black sheep', 'the black sheep'])
];

function v(name, slug, neighborhood, city, address, aliases) {
	return { name, slug, neighborhood, city, address, aliases };
}

/** Normalize a raw venue string for alias lookup. */
export function normKey(s) {
	return String(s || '')
		.toLowerCase()
		.replace(/^the\s+/, '')
		.replace(/[^a-z0-9]+/g, ' ')
		.trim();
}

const INDEX = new Map();
for (const venue of VENUES) {
	INDEX.set(normKey(venue.name), venue);
	for (const a of venue.aliases) INDEX.set(normKey(a), venue);
}

/**
 * Resolve a raw venue string to a canonical venue. Unknown venues are returned
 * as a minimal record (name + synthesized slug) so nothing is dropped.
 * @param {string} raw
 * @returns {{ name:string, slug:string, neighborhood?:string, city?:string, address?:string, known:boolean }}
 */
export function resolveVenue(raw) {
	const key = normKey(raw);
	const hit = INDEX.get(key);
	if (hit) {
		return { name: hit.name, slug: hit.slug, neighborhood: hit.neighborhood, city: hit.city, address: hit.address, known: true };
	}
	const name = String(raw || '').trim() || 'TBA';
	return { name, slug: key ? key.replace(/\s+/g, '-') : 'tba', city: 'Denver', known: false };
}
