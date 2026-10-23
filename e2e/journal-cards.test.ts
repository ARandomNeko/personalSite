import { expect, test } from '@playwright/test';

for (const width of [1440, 390]) {
	test(`journal cards show paintings and open their posts at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 1000 });
		const errors: string[] = [];
		page.on('pageerror', (error) => errors.push(error.message));
		await page.goto('/blog');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('The journal.');
		const stories = page.locator('.journal-card .story');
		await expect(stories).toHaveCount(6);
		const newest = stories.first();
		await expect(newest).toContainText('Latest entry');
		await expect(newest).toHaveAttribute('href', '/blog/rl-ppo-drone-sandbox');
		await newest.locator('img').evaluate((img) => img.decode());
		await expect(page.getByRole('link', { name: /^Artwork:/ })).toHaveCount(6);
		await page.evaluate(() => document.fonts.ready);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
		for (const card of await page.locator('.journal-card').all()) {
			await card.scrollIntoViewIfNeeded();
			await card.locator('img').evaluate((img) => img.decode());
			expect((await card.locator('img').boundingBox())!.height).toBeGreaterThan(100);
		}
		const backdrop = page.locator('.library-backdrop img');
		await expect(backdrop).toHaveAttribute('src', /nga-66425/);
		await stories.nth(1).hover();
		await expect(backdrop).toHaveAttribute('src', /nga-111194/);
		await newest.focus();
		await expect(backdrop).toHaveAttribute('src', /nga-66425/);
		await newest.press('Enter');
		await expect(page).toHaveURL(/\/blog\/rl-ppo-drone-sandbox$/);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(
			'RL/PPO Drone Simulation Sandbox'
		);
		expect(errors).toEqual([]);
	});
}
