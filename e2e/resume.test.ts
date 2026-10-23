import { expect, test } from '@playwright/test';

for (const width of [1440, 390]) {
	test(`résumé keeps content and fits at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 1000 });
		const errors: string[] = [];
		page.on('pageerror', (error) => errors.push(error.message));
		await page.goto('/resume');
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Rituparan Reddy');
		await expect(page.getByRole('link', { name: 'Download PDF' })).toHaveAttribute(
			'href',
			'/resume.pdf'
		);
		await expect(page.getByRole('heading', { name: 'SDLC AI Automation Intern' })).toHaveCount(1);
		await expect(page.getByRole('heading', { name: 'B.S. in Computer Science' })).toHaveCount(1);
		await expect(
			page.getByRole('link', { name: 'RL/PPO Drone Simulation Sandbox' })
		).toHaveAttribute('href', '/blog/rl-ppo-drone-sandbox');
		await expect(page.getByRole('heading', { name: 'Astrophotography' })).toHaveCount(1);
		await expect(page.getByRole('navigation', { name: 'Résumé layouts' })).toHaveCount(0);
		await expect(page.getByRole('complementary', { name: 'Background painting' })).toContainText(
			'Lake Lucerne'
		);
		await page.locator('.library-backdrop img').evaluate((image) => image.decode());
		await page.evaluate(() => document.fonts.ready);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
		expect(errors).toEqual([]);
	});
}
