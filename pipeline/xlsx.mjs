// Read the sheet's XLSX export (one download = all tabs) and, crucially, the
// per-cell ticket hyperlinks the CSV export throws away. ~85-90% of shows carry
// an exact deep link to AXS / Ticketmaster / Etix / DICE / HoldMyTicket / etc.

import ExcelJS from 'exceljs';

/** Flatten an ExcelJS cell to plain text across its possible value shapes. */
export function cellText(cell) {
	const v = cell.value;
	if (v == null) return '';
	if (typeof v === 'string') return v;
	if (typeof v === 'number' || typeof v === 'boolean') return String(v);
	if (v instanceof Date) return v.toISOString();
	if (typeof v === 'object') {
		if (Array.isArray(v.richText)) return v.richText.map((r) => r.text).join('');
		if (typeof v.text === 'string') return v.text;
		if (v.result != null) return String(v.result);
	}
	return String(v);
}

/** The whole-cell hyperlink, if any. */
export function cellUrl(cell) {
	if (cell.hyperlink) return cell.hyperlink;
	const v = cell.value;
	if (v && typeof v === 'object' && typeof v.hyperlink === 'string') return v.hyperlink;
	return null;
}

/**
 * Parse an XLSX buffer into per-worksheet grids with a link lookup.
 * @param {Buffer|ArrayBuffer} buf
 * @returns {Promise<Array<{ name:string, grid:string[][], linkAt:(r:number,c:number)=>string|null }>>}
 */
export async function readWorkbook(buf) {
	const wb = new ExcelJS.Workbook();
	await wb.xlsx.load(buf);
	const out = [];
	wb.eachSheet((ws) => {
		const rows = ws.rowCount;
		const cols = ws.columnCount;
		const grid = [];
		const links = new Map();
		for (let r = 0; r < rows; r++) {
			const rowArr = [];
			const row = ws.getRow(r + 1);
			for (let c = 0; c < cols; c++) {
				const cell = row.getCell(c + 1);
				rowArr.push(cellText(cell).trim());
				const url = cellUrl(cell);
				if (url) links.set(`${r},${c}`, url);
			}
			grid.push(rowArr);
		}
		out.push({ name: ws.name, grid, linkAt: (r, c) => links.get(`${r},${c}`) || null });
	});
	return out;
}

const HOSTS = [
	[/(^|\.)axs\.com$/, 'AXS'],
	[/(^|\.)ticketmaster\.com$/, 'Ticketmaster'],
	[/(^|\.)livenation\.com$/, 'Live Nation'],
	[/(^|\.)etix\.com$/, 'Etix'],
	[/(^|\.)dice\.fm$/, 'DICE'],
	[/(^|\.)ticketweb\.com$/, 'TicketWeb'],
	[/holdmyticket\.com$/, 'HoldMyTicket'],
	[/(^|\.)eventbrite\.com$/, 'Eventbrite'],
	[/(^|\.)tixr\.com$/, 'Tixr'],
	[/(^|\.)venuepilot\.com$/, 'VenuePilot'],
	[/meowwolf\.com$/, 'Meow Wolf'],
	[/seetickets\.us$/, 'See Tickets'],
	[/frontgatetickets\.com$/, 'Front Gate']
];

/**
 * Friendly platform name from a ticket URL. Spotify/social links return null so
 * they aren't mistaken for a ticket seller. Unknown hosts fall back to the bare
 * domain, so a "Tickets via bluebird.com" still reads sensibly.
 * @param {string|null} url
 * @returns {{ url:string, platform:string } | null}
 */
export function classifyTicketUrl(url) {
	if (!url) return null;
	let host;
	try {
		host = new URL(url).hostname.toLowerCase();
	} catch {
		return null;
	}
	if (/(^|\.)spotify\.com$/.test(host) || /(^|\.)(instagram|facebook|twitter|x)\.com$/.test(host)) {
		return null; // not a ticket link
	}
	for (const [re, name] of HOSTS) if (re.test(host)) return { url, platform: name };
	// Unknown host → use the registrable-ish domain as the label, but only if it
	// actually looks like a domain. A malformed link keeps the URL, drops the
	// label (button reads "Get tickets" with no bogus platform pill).
	const label = host.replace(/^www\./, '');
	return { url, platform: label.includes('.') ? label : '' };
}
