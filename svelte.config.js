// svelte.config.js
// import adapterNode from '@sveltejs/adapter-node'; // Remove or comment out the old adapter
import adapterCloudflare from '@sveltejs/adapter-cloudflare'; // Import the Cloudflare adapter
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import path from 'path';

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	extensions: ['.md'],
	layout: {
		_: path.resolve('./src/lib/components/MarkdownLayout.svelte')
	}
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [
		vitePreprocess(),
		mdsvex(mdsvexOptions)
	],

	kit: {
		// Use the Cloudflare adapter
		adapter: adapterCloudflare({
			// See adapter options: https://svelte.dev/docs/adapter-cloudflare
			// routes: {
			//  include: ['/*'],
			//  exclude: ['<all>']
			// }
		})
		// Optional: Define platform specifics if needed for Cloudflare Workers environment
		// platform: {
		// 	envPrefix: 'MY_APP_' // Example prefix for environment variables
		// }
	}
};

export default config;
