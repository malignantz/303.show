// Minimal RFC-4180-ish CSV parser shared by the build + matrix parsers.
// Handles quoted fields, escaped quotes, and newlines inside quotes.

/** Parse CSV text into an array of string arrays (raw grid). */
export function parseCsvGrid(text) {
	const rows = [];
	let field = '';
	let record = [];
	let inQuotes = false;
	const s = String(text).replace(/\r\n?/g, '\n');
	for (let i = 0; i < s.length; i++) {
		const c = s[i];
		if (inQuotes) {
			if (c === '"') {
				if (s[i + 1] === '"') {
					field += '"';
					i++;
				} else inQuotes = false;
			} else field += c;
		} else if (c === '"') inQuotes = true;
		else if (c === ',') {
			record.push(field);
			field = '';
		} else if (c === '\n') {
			record.push(field);
			rows.push(record);
			record = [];
			field = '';
		} else field += c;
	}
	if (field !== '' || record.length) {
		record.push(field);
		rows.push(record);
	}
	return rows;
}

/** Parse CSV into objects keyed by the header row (row format). */
export function parseCsvObjects(text) {
	const grid = parseCsvGrid(text);
	if (!grid.length) return [];
	const headers = grid[0].map((h) => h.trim());
	return grid
		.slice(1)
		.filter((r) => r.some((c) => c.trim() !== ''))
		.map((r) => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? '').trim()])));
}
