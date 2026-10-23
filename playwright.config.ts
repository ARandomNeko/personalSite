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
	webServer: externalUrl
		? undefined
		: {
				command: 'npm run build && npm run preview -- --host 127.0.0.1',
				url: 'http://127.0.0.1:4173',
				timeout: 300_000
			},

	testDir: 'e2e'
});
