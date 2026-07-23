/// <reference lib="webworker" />
// The "works in the basement at Larimer Lounge" hook: once you've opened
// 303.show, the shell + the show data are cached, so the list still loads on
// one bar of signal. SvelteKit auto-registers this file.

import { build, files, version } from '$service-worker';

const CACHE = `303-${version}`;
const PRECACHE = [...build, ...files]; // hashed app assets + everything in /static

const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

sw.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => sw.skipWaiting()));
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
			.then(() => sw.clients.claim())
	);
});

sw.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;
	const url = new URL(request.url);
	if (url.origin !== location.origin) return; // never intercept ticket links etc.

	// Hashed build assets: cache-first, they never change under a hash.
	if (PRECACHE.includes(url.pathname)) {
		event.respondWith(caches.match(request).then((c) => c || fetch(request)));
		return;
	}

	// Navigations & data: network-first, fall back to cache when offline, then
	// to a cached page as a last resort so the app shell always appears.
	event.respondWith(
		fetch(request)
			.then((res) => {
				if (res.ok && res.type === 'basic') {
					const copy = res.clone();
					caches.open(CACHE).then((c) => c.put(request, copy));
				}
				return res;
			})
			.catch(async () => {
				const cached = await caches.match(request);
				if (cached) return cached;
				if (request.mode === 'navigate') {
					const home = await caches.match('/');
					if (home) return home;
				}
				return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
			})
	);
});
