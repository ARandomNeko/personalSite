import { expect, test } from '@playwright/test';

const newestFirst = [
	'rl-ppo-drone-sandbox',
	'polymarket-bot',
	'hexapod-robot',
	'web-development',
	'cloud-chamber',
	'ergonomic-keyboard'
].map((slug) => `/blog/${slug}`);

test('homepage, blog, and projects show the latest work first', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		'RL/PPO Drone Simulation Sandbox'
	);
	expect(
		await page
			.locator(
				'.journal-pages article h1 a, .journal-pages article h2 a, .further-work a[href^="/blog/"]'
			)
			.evaluateAll((links) => links.map((link) => link.getAttribute('href')))
	).toEqual(newestFirst);
	for (const path of ['/blog', '/projects']) {
		await page.goto(path);
		expect(
			await page
				.locator('a.card')
				.evaluateAll((links) => links.map((link) => link.getAttribute('href')))
		).toEqual(newestFirst);
	}
});

test('development pages and unused assets are absent from the public site', async ({
	page,
	request
}) => {
	await page.goto('/');
	await expect(page.getByRole('link', { name: /choose paintings|design moodboard/i })).toHaveCount(
		0
	);
	await expect(
		page.locator('a[href^="/workstation"], a[href^="/moodboard"], a[href^="/paintings"]')
	).toHaveCount(0);
	for (const path of [
		'/paintings',
		'/paintings?subject=knights',
		'/moodboard',
		'/moodboard/index.html',
		'/moodboard/previous.html',
		'/workstation/index.html',
		'/workstation/pkg/divine_workstation.js',
		'/paintings/catalogue.json',
		'/paintings/catalogue/nga-1225-1600.webp',
		'/design/moodboard/index.html'
	]) {
		expect((await request.get(path)).status(), path).toBe(404);
	}
});
