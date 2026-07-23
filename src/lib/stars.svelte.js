// Starred shows, persisted to localStorage. No accounts — this IS the account.
// Svelte 5 runes: a single reactive Set exposed through a small API.

import { browser } from '$app/environment';

const KEY = '303-stars';

function load() {
	if (!browser) return new Set();
	try {
		return new Set(JSON.parse(localStorage.getItem(KEY) || '[]'));
	} catch {
		return new Set();
	}
}

let ids = $state(load());

export const stars = {
	get size() {
		return ids.size;
	},
	has(id) {
		return ids.has(id);
	},
	toggle(id) {
		const next = new Set(ids);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		ids = next;
		persist();
	},
	/** reactive list of starred ids */
	get ids() {
		return [...ids];
	}
};

function persist() {
	if (!browser) return;
	try {
		localStorage.setItem(KEY, JSON.stringify([...ids]));
	} catch {
		/* quota / private mode — starring just won't persist */
	}
}
