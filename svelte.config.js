import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			fallback: '404.html'
		}),
		prerender: {
			handleHttpError: 'warn',
			entries: ['*']
		},
		alias: {
			$components: 'src/lib/components',
			$data: 'src/lib/data'
		}
	}
};

export default config;
