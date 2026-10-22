import { expect, test } from '@playwright/test';

for (const width of [1440, 390]) {
	test(`navigation keeps its destinations and sticky position across pages at ${width}px`, async ({
		page
	}) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/');
		const header = page.locator('.site-header');
		const initial = await header.boundingBox();
		const destinations = [
			{ label: 'Work', path: '/projects' },
			{ label: 'Library', path: '/reading' },
			{ label: 'Journal', path: '/blog' },
			{ label: 'Résumé', path: '/resume' }
		];
		for (const destination of destinations) {
			const navigation = page.getByRole('navigation', { name: 'Main navigation' });
			await expect(navigation.getByRole('link')).toHaveText(destinations.map((item) => item.label));
			expect(
				await navigation
					.locator('a')
					.evaluateAll((links) => links.map((link) => link.getAttribute('href')))
			).toEqual(destinations.map((item) => item.path));
			await navigation.getByRole('link', { name: destination.label, exact: true }).click();
			await expect(page).toHaveURL(new RegExp(`${destination.path}$`));
			await expect(
				navigation.getByRole('link', { name: destination.label, exact: true })
			).toHaveAttribute('aria-current', 'page');
			await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
			await expect.poll(async () => (await header.boundingBox())!.y).toBe(0);
			expect(Math.abs((await header.boundingBox())!.height - initial!.height)).toBeLessThan(1);
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
		}
		await page.getByRole('link', { name: 'Rituparan Reddy — home' }).click();
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(
			'RL/PPO Drone Simulation Sandbox'
		);
		await page.evaluate(() => window.scrollTo(0, 500));
		await expect.poll(async () => (await header.boundingBox())!.y).toBe(0);
	});
}

test('library groups keep their books separate and support searching and keyboard browsing', async ({
	page
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/reading');
	const tabs = page.getByRole('tablist', { name: 'Reading groups' });
	const current = tabs.getByRole('tab', { name: /^Reading now/ });
	const collection = tabs.getByRole('tab', { name: /^Owned/ });
	const read = tabs.getByRole('tab', { name: /^Read(?!ing)/ });
	await expect(current).toHaveAttribute('aria-selected', 'true');
	const shelf = page.getByRole('list', { name: 'Bookshelf' });
	const detail = page.getByRole('region', { name: 'Selected book' });
	await expect(shelf.getByRole('button')).toHaveCount(2);
	await expect(detail.locator('.reading-status')).toHaveText('Reading');
	const currentTitles = await shelf.getByRole('button').allTextContents();
	await current.focus();
	await page.keyboard.press('ArrowRight');
	await expect(collection).toBeFocused();
	await expect(collection).toHaveAttribute('aria-selected', 'true');
	await expect(shelf.getByRole('button')).toHaveCount(6);
	await expect(detail.locator('.reading-status')).toHaveText('To read');
	const collectionTitles = await shelf.getByRole('button').allTextContents();
	const search = page.getByRole('searchbox', { name: 'Find a book' });
	await search.fill('Camus');
	await expect(shelf.getByRole('button')).toHaveCount(4);
	await shelf.getByRole('button').first().focus();
	await page.keyboard.press('ArrowRight');
	await expect(shelf.getByRole('button').nth(1)).toBeFocused();
	await search.fill('no matching title');
	await expect(page.getByText('No books match that search.')).toBeVisible();
	await page.getByRole('button', { name: 'Show all books' }).click();
	await expect(shelf.getByRole('button')).toHaveCount(6);
	await read.click();
	await expect(shelf.getByRole('button')).toHaveCount(4);
	await expect(detail.locator('.reading-status')).toHaveText('Read');
	const finishedTitles = await shelf.getByRole('button').allTextContents();
	expect(new Set([...currentTitles, ...collectionTitles, ...finishedTitles]).size).toBe(12);
	await page.reload();
	await read.click();
	expect(await shelf.getByRole('button').allTextContents()).toEqual(finishedTitles);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
	await page.goto('/');
	await expect(page.getByRole('list', { name: 'Bookshelf' }).getByRole('button')).toHaveCount(5);
});
