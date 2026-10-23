import { defineConfig } from '@playwright/test';

const externalUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
	use: {
		baseURL: externalUrl || 'http://127.0.0.1:4173',
		launchOptions: {
			executablePath: process.env.CHROMIUM_PATH,
			args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader']
		}
	},
	projects: [
		{ name: 'chromium' },
		...(process.env.FIREFOX_PATH
			? [
					{
						name: 'firefox-text',
						grep: /snapshot glyphs/,
						use: {
							browserName: 'firefox' as const,
							launchOptions: {
								executablePath: process.env.FIREFOX_PATH,
								args: [],
								firefoxUserPrefs: { 'font.minimum-size.x-western': 20 }
							}
						}
					}
				]
			: [])
	],
	webServer: externalUrl
		? undefined
		: {
				command: 'npm run build && npm run preview -- --host 127.0.0.1',
				url: 'http://127.0.0.1:4173',
				timeout: 300_000
			},

	testDir: 'e2e'
});
