import adapter from '@sveltejs/adapter-vercel'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		csrf: {
			checkOrigin: false,
		},
		adapter: adapter({
			// Pin the serverless runtime so builds are deterministic regardless
			// of the local Node version. The site is fully prerendered, so this
			// only matters for the SvelteKit fallback/routing layer.
			runtime: 'nodejs22.x',
		}),
	},
}

export default config
