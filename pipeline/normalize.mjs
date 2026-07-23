// Turn a dirty, human-typed sheet row into a clean show record — or reject it
// loudly. The spreadsheet is maintained by hand, so every field is defensive.
//
// Rule from the context doc: key off header NAMES, validate the header set,
// log unparseable rows, never drop silently, never guess a date we can't parse.

import crypto from 'node:crypto';
import { resolveVenue } from './venues.js';

const MONTHS = {
	jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8,
	sep: 9, sept: 9, oct: 10, nov: 11, dec: 12
};

/**
 * Parse a human date string into an ISO `YYYY-MM-DD`, choosing the next
 * occurrence when no year is given (a sheet says "Feb 3", meaning the coming
 * Feb 3). Returns null when we genuinely can't tell — caller logs + skips.
 * @param {string} raw
 * @param {Date} [now]
 */
export function parseDate(raw, now = new Date()) {
	if (!raw) return null;
	const s = String(raw).trim().toLowerCase();
	if (!s || s === 'tba' || s === 'tbd') return null;

	// Try the whole string first (so ISO/numeric hyphens aren't mistaken for a
	// range). Only if that fails do we treat it as a range and take the start.
	return matchSingleDate(s, now) ?? matchSingleDate(splitRangeStart(s), now);
}

/** For "2/3-2/4", "Feb 3-4", "Feb 3 – Feb 5": return the first date's text. */
function splitRangeStart(s) {
	return s.split(/\s*(?:-|–|—|through|thru|\bto\b)\s*/)[0].trim();
}

function matchSingleDate(s, now) {
	if (!s) return null;

	// ISO: 2026-02-03
	let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
	if (m) return iso(+m[1], +m[2], +m[3]);

	// Numeric: 2/3 or 2/3/26 or 02-03-2026
	m = s.match(/^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?$/);
	if (m) {
		const mo = +m[1], d = +m[2];
		let yr = m[3] ? +m[3] : null;
		if (yr && yr < 100) yr += 2000;
		return resolveYear(mo, d, yr, now);
	}

	// Wordy: "feb 3", "february 3", "3 feb", "feb 3 2026", optional weekday prefix
	const w = s.replace(/^(mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun)[a-z]*[,\s]+/, '');
	m = w.match(/^([a-z]+)\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:[,\s]+(\d{4}))?$/);
	if (m && monthNum(m[1])) return resolveYear(monthNum(m[1]), +m[2], m[3] ? +m[3] : null, now);
	m = w.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\.?(?:[,\s]+(\d{4}))?$/);
	if (m && monthNum(m[2])) return resolveYear(monthNum(m[2]), +m[1], m[3] ? +m[3] : null, now);

	return null;
}

/** "feb", "february", "sept" -> month number, or 0. */
function monthNum(word) {
	return MONTHS[word] || MONTHS[word.slice(0, 4)] || MONTHS[word.slice(0, 3)] || 0;
}

function resolveYear(mo, d, yr, now) {
	if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
	if (yr) return iso(yr, mo, d);
	// No year: pick the occurrence not in the past (allow a small grace window).
	const y = now.getFullYear();
	const candidate = iso(y, mo, d);
	if (!candidate) return null;
	const graceMs = 24 * 3600 * 1000;
	if (new Date(candidate + 'T23:59:59') >= new Date(now.getTime() - graceMs)) return candidate;
	return iso(y + 1, mo, d);
}

function iso(y, mo, d) {
	// Validate real calendar date (rejects Feb 30 etc.)
	const dt = new Date(Date.UTC(y, mo - 1, d));
	if (dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
	return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/**
 * Parse a time like "8pm", "8:30 PM", "20:00", "doors 7 / show 8" into 24h HH:MM.
 * @param {string} raw
 */
export function parseTime(raw) {
	if (!raw) return null;
	let s = String(raw).trim().toLowerCase();
	// If it mentions show/set vs doors, prefer show time.
	const showPart = s.match(/(?:show|set)[:\s]*([0-9: apm]+)/);
	if (showPart) s = showPart[1].trim();
	const m = s.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
	if (!m) return null;
	let h = +m[1];
	const min = m[2] ? +m[2] : 0;
	const ap = m[3];
	if (ap === 'pm' && h < 12) h += 12;
	if (ap === 'am' && h === 12) h = 0;
	if (!ap && h >= 1 && h <= 11) h += 12; // bare "8"/"9" for a show ≈ evening
	if (h > 23 || min > 59) return null;
	return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

/**
 * Parse price text into {min,max,text,free}. Keeps the display text verbatim.
 * @param {string} raw
 */
export function parsePrice(raw) {
	const text = String(raw || '').trim();
	if (!text) return { text: '' };
	if (/free|no cover|\$0\b/i.test(text)) return { min: 0, max: 0, text: 'Free', free: true };
	const nums = (text.match(/\$?\s?(\d+(?:\.\d{2})?)/g) || []).map((n) => parseFloat(n.replace(/[^0-9.]/g, '')));
	if (!nums.length) return { text };
	return { min: Math.min(...nums), max: Math.max(...nums), text };
}

/** Slugify to a URL-safe token. */
export function slugify(s) {
	return String(s || '')
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 60) || 'show';
}

/** Stable id from the identity fields, so "just added" diffing is reliable. */
export function showId(artist, venueSlug, date) {
	return crypto.createHash('sha1').update(`${slugify(artist)}|${venueSlug}|${date}`).digest('hex').slice(0, 10);
}

/**
 * Normalize one raw row (already keyed by header name) into a show record.
 * @param {Record<string,string>} row  header-name -> cell value
 * @param {Date} now
 * @returns {{ ok:true, show:object } | { ok:false, reason:string, row:object }}
 */
export function normalizeRow(row, now = new Date()) {
	const get = (...keys) => {
		for (const k of keys) {
			const found = Object.keys(row).find((h) => h.toLowerCase().trim() === k);
			if (found && row[found] != null && String(row[found]).trim() !== '') return String(row[found]).trim();
		}
		return '';
	};

	const artist = get('artist', 'artists', 'headliner', 'act', 'band', 'event', 'show');
	const venueRaw = get('venue', 'location', 'where');
	const dateRaw = get('date', 'day', 'when');

	if (!artist) return { ok: false, reason: 'missing artist', row };
	if (!venueRaw) return { ok: false, reason: 'missing venue', row };

	const date = parseDate(dateRaw, now);
	if (!date) return { ok: false, reason: `unparseable date: "${dateRaw}"`, row };

	const venue = resolveVenue(venueRaw);
	const supportRaw = get('support', 'openers', 'opener', 'with', 'guests');
	const support = supportRaw
		? supportRaw.split(/\s*(?:,|\/|\band\b|\+|w\/|with)\s*/i).map((x) => x.trim()).filter(Boolean)
		: [];
	const time = parseTime(get('time', 'show', 'set time', 'showtime'));
	const doorTime = parseTime(get('doors', 'door', 'door time'));
	const price = parsePrice(get('price', 'cost', 'tickets price', 'ticket price', '$'));
	const ticketUrl = firstUrl(get('tickets', 'ticket', 'link', 'url', 'ticket link'));
	const age = get('age', 'ages', 'age restriction');
	const notesRaw = get('notes', 'note', 'info');
	const flags = `${artist} ${notesRaw} ${get('status')}`.toLowerCase();

	const show = {
		id: showId(artist, venue.slug, date),
		slug: `${slugify(artist)}-${date}`,
		artist,
		support,
		venue,
		date,
		...(time ? { time } : {}),
		...(doorTime ? { doorTime } : {}),
		...(price.text ? { price } : {}),
		...(age ? { age } : {}),
		...(ticketUrl ? { ticketUrl } : {}),
		...(notesRaw ? { notes: notesRaw } : {}),
		soldOut: /sold\s?out/.test(flags),
		cancelled: /cancel/.test(flags),
		free: !!price.free
	};
	return { ok: true, show };
}

function firstUrl(s) {
	const m = String(s || '').match(/https?:\/\/\S+/);
	return m ? m[0].replace(/[),.]+$/, '') : '';
}
