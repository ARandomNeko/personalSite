import { expect, test } from '@playwright/test';

const layouts = ['document', 'margin', 'painting', 'chapters'];
for (const width of [1440, 390]) {
	for (const layout of layouts) {
		test(`résumé ${layout} keeps content and fits at ${width}px`, async ({ page }) => {
			await page.setViewportSize({ width, height: 1000 });
			const errors: string[] = [];
			page.on('pageerror', (error) => errors.push(error.message));
			await page.goto(`/resume?view=${layout}`);
			await expect(page.locator('[data-resume-layout]')).toHaveAttribute(
				'data-resume-layout',
				layout
			);
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
			await page.evaluate(() => document.fonts.ready);
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
			expect(errors).toEqual([]);
		});
	}
}

test('layout links support switching and browser history', async ({ page }) => {
	await page.goto('/resume');
	const picker = page.getByRole('navigation', { name: 'Résumé layouts' });
	for (const layout of layouts) {
		await picker.locator(`a[href="/resume?view=${layout}"]`).click();
		await expect(page.locator('[data-resume-layout]')).toHaveAttribute(
			'data-resume-layout',
			layout
		);
		await expect(picker.locator('[aria-current="page"]')).toHaveAttribute(
			'href',
			`/resume?view=${layout}`
		);
	}
	await page.goBack();
	await expect(page.locator('[data-resume-layout]')).toHaveAttribute(
		'data-resume-layout',
		'painting'
	);
	await page.goto('/resume?view=unknown');
	await expect(page.locator('[data-resume-layout]')).toHaveAttribute(
		'data-resume-layout',
		'document'
	);
});

for (const motion of ['no-preference', 'reduce'] as const) {
	test(`chapters change paintings on scroll with ${motion} motion`, async ({ page }) => {
		await page.emulateMedia({ reducedMotion: motion });
		await page.goto('/resume?view=chapters');
		await page
			.locator('.paint-layer img')
			.first()
			.evaluate((image) => image.decode());
		const nav = page.getByRole('navigation', { name: 'Résumé sections' });
		await nav.getByRole('link', { name: '02 Projects' }).click();
		await expect(page.getByRole('complementary', { name: 'Background painting' })).toContainText(
			'Niagara'
		);
		await expect(page.locator('.paint-layer[data-painting="nga-166436"]')).toHaveCSS(
			'visibility',
			'visible',
			{ timeout: 15000 }
		);
		await nav.getByRole('link', { name: '03 Education' }).click();
		await expect(page.getByRole('complementary', { name: 'Background painting' })).toContainText(
			'Gothic Cathedral'
		);
		await expect(page.locator('.paint-layer[data-painting="schinkel-cathedral"]')).toHaveCSS(
			'visibility',
			'visible',
			{ timeout: 15000 }
		);
		await expect(nav.getByRole('link', { name: '03 Education' })).toHaveAttribute(
			'aria-current',
			'location'
		);
	});
}
