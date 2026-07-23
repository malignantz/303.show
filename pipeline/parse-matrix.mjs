// Parse the real 303 sheet's monthly tabs.
//
// Each tab is a GRID: the header row is venue names (columns), column 0 of each
// data row is a date (M/D), and every other cell holds that venue's show(s) on
// that day, formatted roughly as:
//
//     Headliner | Opener One | Opener Two 8PM
//
// A single cell can hold MULTIPLE shows, separated by a run of 3+ spaces (and
// the maintainer sometimes bumps a time by a minute — "9:00 PM ... 9:01 PM" —
// to keep two same-night shows distinct). Each show ends with its time.
//
// We convert the grid into flat row objects ({ Date, Artist, Support, Venue,
// Time }) so they flow through the SAME normalizer the row format would use.

import { parseCsvGrid } from './csv.mjs';
import { classifyTicketUrl } from './xlsx.mjs';

// Discovered tab layout (gid -> month). New tabs the maintainer adds must be
// registered here (or passed via SHEET_GIDS). Non-matrix tabs are skipped by
// the header/date validation below, so an unknown gid is harmless.
export const GID_MONTHS = {
	'0': 1,
	'548059773': 2,
	'444719313': 3,
	'1906861576': 4,
	'450225962': 5,
	'1704945807': 6,
	'988709397': 7,
	'1189156237': 8,
	'331812377': 9,
	'1912107412': 10,
	'764962522': 11,
	'721866170': 12
};

/** Every monthly-tab gid, in calendar order. */
export const MONTH_GIDS = Object.entries(GID_MONTHS)
	.sort((a, b) => a[1] - b[1])
	.map(([gid]) => gid);

/** Strip a trailing ticketing tag: "Red Rocks (AXS)" -> "Red Rocks". */
export function stripTicketTag(name) {
	return String(name || '')
		.replace(/\s*\((?:AXS|Ticketmaster|TM|Live\s?Nation|Eventbrite|DICE|Etix|see\s?tickets)[^)]*\)\s*$/i, '')
		.trim();
}

// Time at (or near) the end of a show string: 8PM, 8:30 PM, 7:15pm, 9Pm.
const TIME_RE = /(\d{1,2})(?::(\d{2}))?\s*([AaPp])\.?\s?[Mm]\.?/;
const TRAILING_TIME_RE = new RegExp(TIME_RE.source + '\\s*$');

/**
 * Split a cell into individual show strings. Shows are separated by a run of
 * 3+ spaces or a newline. As a fallback, a time immediately followed by more
 * text also starts a new show.
 */
export function splitShowsInCell(cell) {
	const raw = String(cell || '').trim();
	if (!raw) return [];
	let parts = raw.split(/\s{3,}|\n+/).map((p) => p.trim()).filter(Boolean);

	// Fallback: a single part that still contains an internal "…8PM  Artist…"
	// boundary (time followed by capitalized text) gets split there too.
	const out = [];
	for (const p of parts) {
		const boundary = new RegExp(TIME_RE.source + '(?=\\s+[A-Z0-9])', 'g');
		let last = 0;
		let m;
		let pieces = [];
		while ((m = boundary.exec(p)) !== null) {
			pieces.push(p.slice(last, m.index + m[0].length).trim());
			last = m.index + m[0].length;
		}
		if (pieces.length) {
			if (last < p.length) pieces.push(p.slice(last).trim());
			out.push(...pieces.filter(Boolean));
		} else {
			out.push(p);
		}
	}
	return out;
}

/**
 * Pull the acts + time out of one show string.
 * @returns {{ acts: string[], time: string }} time is 24h HH:MM or ''.
 */
export function parseShowCell(str) {
	let s = String(str || '').trim();
	let time = '';
	const tm = s.match(TRAILING_TIME_RE);
	if (tm) {
		time = to24h(tm[1], tm[2], tm[3]);
		s = s.slice(0, tm.index).trim();
	}
	// Acts: primarily pipe-separated; fall back to " w/ " when no pipes.
	let acts;
	if (s.includes('|')) acts = s.split(/\s*\|\s*/);
	else if (/\sw\/\s/i.test(s)) acts = s.split(/\s+w\/\s+/i);
	else acts = [s];
	acts = acts.map((a) => a.trim()).filter(Boolean);
	return { acts, time };
}

function to24h(h, m, ap) {
	let hh = parseInt(h, 10);
	const mm = m ? parseInt(m, 10) : 0;
	const p = ap.toLowerCase();
	if (p === 'p' && hh < 12) hh += 12;
	if (p === 'a' && hh === 12) hh = 0;
	if (hh > 23 || mm > 59) return '';
	return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/**
 * Parse a date cell into { m, d } (year ignored — the pipeline stamps its own).
 * Handles both the CSV text form "5/1" and the XLSX Date-typed form, which
 * ExcelJS surfaces as an ISO string like "2025-05-01T00:00:00.000Z".
 */
export function parseMonthDay(cell) {
	const s = String(cell || '').trim();
	let mo, d;
	let m = s.match(/^(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?$/);
	if (m) {
		mo = +m[1];
		d = +m[2];
	} else if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})/))) {
		mo = +m[2];
		d = +m[3];
	} else return null;
	if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
	return { m: mo, d };
}

/**
 * Convert one monthly-tab GRID into flat row objects for the normalizer.
 * `linkAt(r, c)` returns the ticket hyperlink for a cell (from the XLSX), or
 * null — for a multi-show cell every show inherits the cell's single link.
 * @param {string[][]} grid
 * @param {number} year  year to stamp (the sheet stores none)
 * @param {(r:number,c:number)=>string|null} [linkAt]
 * @returns {{ rows: object[], stats: { cells:number, shows:number, venues:number, linked:number }, skip?: boolean }}
 */
export function gridToRows(grid, year, linkAt = () => null) {
	const rows = [];
	if (grid.length < 2) return { rows, stats: { cells: 0, shows: 0, venues: 0, linked: 0 } };

	const header = grid[0];
	const venues = header.map(stripTicketTag);
	// Validate this really is a matrix tab: some venues, and at least one data
	// row whose first cell is a date. (The "My Shows" tab fails this → skipped.)
	const hasDates = grid.slice(1).some((r) => parseMonthDay(r[0]));
	if (!hasDates || venues.filter(Boolean).length < 3) {
		return { rows, stats: { cells: 0, shows: 0, venues: 0, linked: 0 }, skip: true };
	}

	let cells = 0;
	let linked = 0;
	for (let r = 1; r < grid.length; r++) {
		const rec = grid[r];
		const md = parseMonthDay(rec[0]);
		if (!md) continue;
		const dateISO = `${year}-${String(md.m).padStart(2, '0')}-${String(md.d).padStart(2, '0')}`;
		for (let c = 1; c < rec.length; c++) {
			const cell = (rec[c] || '').trim();
			const venue = venues[c];
			if (!cell || !venue) continue;
			cells++;
			const ticket = classifyTicketUrl(linkAt(r, c));
			if (ticket) linked++;
			for (const showStr of splitShowsInCell(cell)) {
				const { acts, time } = parseShowCell(showStr);
				if (!acts.length) continue;
				rows.push({
					Date: dateISO,
					Artist: acts[0],
					Support: acts.slice(1).join(', '),
					Venue: venue,
					Time: time,
					Tickets: ticket ? ticket.url : '',
					TicketPlatform: ticket ? ticket.platform : ''
				});
			}
		}
	}
	return {
		rows,
		stats: { cells, shows: rows.length, venues: venues.filter(Boolean).length, linked }
	};
}

/** CSV convenience wrapper (no hyperlinks available in CSV). */
export function matrixToRows(csv, year) {
	return gridToRows(parseCsvGrid(csv), year);
}
