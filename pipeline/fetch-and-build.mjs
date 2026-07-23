// Orchestrator: fetch the sheet's monthly tabs (or mock) -> normalize ->
// compute "just added" against the previous committed JSON -> write shows.json.
//
// Fail-safe contract (context doc): if validation fails, exit non-zero and do
// NOT overwrite shows.json. The site keeps serving yesterday's known-good data.
//
// The real sheet is one Google Spreadsheet with twelve monthly GRID tabs
// (venues × days). We fetch each tab's CSV, flatten it to rows, then normalize.
//
// Env:
//   SHEET_ID        spreadsheet id (default: the known 303 sheet)
//   SHEET_GIDS      comma-separated tab gids to fetch (default: the 12 months)
//   SHEET_YEAR      year to stamp on dates (the sheet stores none; default: now)
// Flags:
//   --mock          ignore the sheet, generate realistic Denver data

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeRow } from './normalize.mjs';
import { mockRows } from './mock.mjs';
import { gridToRows } from './parse-matrix.mjs';
import { readWorkbook } from './xlsx.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const OUT_JSON = path.join(DATA_DIR, 'shows.json');
const RAW_DIR = path.join(DATA_DIR, 'raw');
const LIB_COPY = path.join(ROOT, 'src', 'lib', 'data', 'shows.json');

const DEFAULT_SHEET_ID = '19Dq2O2ee7raAis5rwkqYr22DVgIGlB7ylrKQNkka-pk';
const USE_MOCK = process.argv.includes('--mock');

// Run only when invoked directly (not when imported for its exports/tests).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	main().catch((err) => {
		console.error('✗ build failed:', err.message);
		process.exit(1);
	});
}

async function main() {
	fs.mkdirSync(DATA_DIR, { recursive: true });
	fs.mkdirSync(path.dirname(LIB_COPY), { recursive: true });
	const now = new Date();

	// The sheet's embedded years are unreliable (all stamped 2025). Assign years
	// by month for a rolling forward calendar: any month from the current month
	// onward is this year; earlier months roll to next year (so mid-2026, Jul-Dec
	// = 2026 and Jan-Jun = 2027). SHEET_YEAR forces a single year for every month.
	const forcedYear = process.env.SHEET_YEAR ? parseInt(process.env.SHEET_YEAR, 10) : null;
	const curMonth = now.getMonth() + 1;
	const curYear = now.getFullYear();
	const yearFor = (month) => forcedYear ?? (month >= curMonth ? curYear : curYear + 1);
	const yearDesc = forcedYear ? String(forcedYear) : `rolling (${curYear}/${curYear + 1})`;

	let rows;
	let source;
	if (USE_MOCK) {
		console.log('• source: MOCK (dev data)');
		rows = mockRows(now);
		source = 'mock';
	} else {
		source = 'sheet';
		rows = await fetchSheetRows(yearFor);
	}

	const shows = [];
	const skipped = [];
	for (const row of rows) {
		const res = normalizeRow(row, now);
		if (res.ok) shows.push(res.show);
		else skipped.push({ reason: res.reason, artist: row.Artist || row.artist || '?' });
	}

	// De-dupe by id (same artist+venue+date typed twice); keep the richer record.
	const byId = new Map();
	for (const s of shows) {
		const prev = byId.get(s.id);
		if (!prev || score(s) > score(prev)) byId.set(s.id, s);
	}
	let merged = [...byId.values()].sort(cmp);

	if (source === 'sheet' && merged.length === 0) {
		throw new Error('0 valid shows parsed from the sheet — refusing to overwrite known-good data.');
	}

	// Ship only what the site can use: today onward (with a 1-day grace so a show
	// doesn't vanish the instant midnight passes). Past months stay in data/raw
	// for debugging but never bloat the client bundle or the prerender count.
	const parsedTotal = merged.length;
	const cutoff = isoDate(new Date(now.getTime() - 24 * 3600 * 1000));
	merged = merged.filter((s) => s.date >= cutoff);
	const dropped = parsedTotal - merged.length;

	// "Just added": carry addedAt forward; seed the first-ever build so the whole
	// calendar isn't flagged NEW (real: backdate; mock: spread for the demo).
	const prior = readPrior();
	const priorAddedAt = new Map(prior.map((s) => [s.id, s.addedAt]));
	const today = isoDate(now);
	const isSeed = prior.length === 0;
	for (const s of merged) {
		const carried = priorAddedAt.get(s.id);
		if (carried) s.addedAt = carried;
		else if (!isSeed) s.addedAt = today;
		else s.addedAt = seedAddedAt(s, source, now);
	}

	const payload = {
		generatedAt: now.toISOString(),
		source,
		year: yearDesc,
		count: merged.length,
		shows: merged
	};

	fs.writeFileSync(OUT_JSON, JSON.stringify(payload, null, '\t') + '\n');
	fs.writeFileSync(LIB_COPY, JSON.stringify(payload) + '\n'); // compact copy the app imports
	if (source === 'sheet') writeDebugCsv(merged);

	const added = merged.filter((s) => s.addedAt === today).length;
	const withTix = merged.filter((s) => s.ticketUrl).length;
	console.log(
		`✓ ${merged.length} shows written (year ${yearDesc}, ${added} new today, ${withTix} with tickets), ${dropped} past dropped, ${skipped.length} skipped`
	);
	if (skipped.length) {
		for (const s of skipped.slice(0, 15)) console.warn(`  ⟂ skipped [${s.artist}]: ${s.reason}`);
		if (skipped.length > 15) console.warn(`  … and ${skipped.length - 15} more`);
	}
}

/**
 * Fetch the whole workbook as XLSX (one request = every tab, WITH the per-cell
 * ticket hyperlinks the CSV export drops), flatten each monthly grid to rows.
 */
async function fetchSheetRows(yearFor) {
	const id = process.env.SHEET_ID || DEFAULT_SHEET_ID;
	const url = `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`;
	const buf = await fetchBuffer(url);
	console.log(`• fetched workbook (${(buf.byteLength / 1024).toFixed(0)} KB)`);

	const sheets = await readWorkbook(buf);
	const allRows = [];
	let ok = 0;
	let linkedTotal = 0;
	for (const sheet of sheets) {
		const { rows, stats, skip } = gridToRows(sheet.grid, yearFor, sheet.linkAt);
		if (skip) {
			console.log(`  · "${sheet.name}": not a monthly grid — skipped`);
			continue;
		}
		ok++;
		linkedTotal += stats.linked;
		const pct = stats.cells ? Math.round((stats.linked / stats.cells) * 100) : 0;
		console.log(`  · "${sheet.name}": ${stats.shows} shows / ${stats.venues} venues (${pct}% ticket-linked)`);
		allRows.push(...rows);
	}
	if (ok === 0) throw new Error('no monthly tabs parsed — refusing to overwrite known-good data.');
	console.log(`• ${ok} tabs → ${allRows.length} raw rows, ${linkedTotal} with ticket links`);
	return allRows;
}

function score(s) {
	return (s.time ? 1 : 0) + (s.price ? 1 : 0) + (s.ticketUrl ? 1 : 0) + s.support.length;
}

function cmp(a, b) {
	if (a.date !== b.date) return a.date < b.date ? -1 : 1;
	const at = a.time || '99:99', bt = b.time || '99:99';
	if (at !== bt) return at < bt ? -1 : 1;
	return a.artist.localeCompare(b.artist);
}

function readPrior() {
	try {
		return JSON.parse(fs.readFileSync(OUT_JSON, 'utf8')).shows || [];
	} catch {
		return [];
	}
}

async function fetchBuffer(url) {
	const res = await fetch(url, { redirect: 'follow' });
	if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
	return Buffer.from(await res.arrayBuffer());
}

/** A flat, diffable debug artifact of exactly what we parsed. */
function writeDebugCsv(shows) {
	fs.mkdirSync(RAW_DIR, { recursive: true });
	const esc = (v) => {
		const s = String(v ?? '');
		return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
	};
	const header = 'date,time,artist,support,venue,city,platform,ticketUrl';
	const lines = shows.map((s) =>
		[s.date, s.time || '', s.artist, s.support.join(' | '), s.venue.name, s.venue.city || '', s.ticketPlatform || '', s.ticketUrl || '']
			.map(esc)
			.join(',')
	);
	fs.writeFileSync(path.join(RAW_DIR, 'parsed.csv'), header + '\n' + lines.join('\n') + '\n');
}

function isoDate(d) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** addedAt to assign on the first-ever build so the calendar isn't all "NEW". */
function seedAddedAt(show, source, now) {
	if (source !== 'mock') {
		const d = new Date(now);
		d.setDate(d.getDate() - 14);
		return isoDate(d);
	}
	const n = parseInt(show.id.slice(0, 6), 16) % 18;
	const d = new Date(now);
	d.setDate(d.getDate() - n);
	return isoDate(d);
}
