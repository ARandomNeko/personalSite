import tailwindcss from '@tailwindcss/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapterCloudflare from '@sveltejs/adapter-cloudflare';
import adapterNode from '@sveltejs/adapter-node';
import { mdsvex } from 'mdsvex';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			extensions: ['.svelte', '.md'],
			preprocess: [
				vitePreprocess(),
				mdsvex({
					extensions: ['.md'],
					layout: { _: path.resolve('./src/lib/components/MarkdownLayout.svelte') }
				})
			],
			paths: { origin: process.env.SITE_ORIGIN || 'https://rituparan.com' },
			adapter:
				process.env.NODE_ENV === 'production' && process.env.SITE_ADAPTER !== 'node'
					? adapterCloudflare({
							routes: {
								include: ['/*'],
								exclude: [
									'<build>',
									'<prerendered>',
									'/paintings/*',
									'/fonts/*',
									'/favicon.ico',
									'/resume.pdf'
								]
							}
						})
					: adapterNode({ precompress: true, envPrefix: 'MY_APP_' })
		})
	],

	test: {
		projects: [
			{
				extends: './vite.config.ts',
				plugins: [svelteTesting()],

				test: {
					name: 'client',
					environment: 'jsdom',
					clearMocks: true,
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',

				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
