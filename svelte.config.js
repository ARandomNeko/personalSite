// svelte.config.js
import adapterNode from '@sveltejs/adapter-node'; // Use Node adapter for local development
import adapterCloudflare from '@sveltejs/adapter-cloudflare'; // Keep Cloudflare for production builds
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
		// Use Node adapter for local development (better for NixOS and native dependencies)
		adapter: process.env.NODE_ENV === 'production' ? adapterCloudflare({
			// Cloudflare adapter for production builds
			routes: {
				include: ['/*'],
				exclude: ['<all>']
			}
		}) : adapterNode({
			// Node adapter for development - handles native dependencies better
			mode: 'standalone',
			precompress: false,
			envPrefix: 'MY_APP_'
		})
	}
};

export default config;
