import { scrollToScene } from './helpers';
import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const selectedIds = JSON.parse(
	readFileSync(new URL('../src/lib/art/selection.json', import.meta.url), 'utf8')
) as string[];

test('a fresh load shuffles the curated selection once and ignores old picker preferences', async ({
	page,
	baseURL
}) => {
	await page.context().addCookies([
		{
			name: 'journal-paintings-v2',
			value: encodeURIComponent(JSON.stringify(['nga-1225', 'met-island'])),
			url: baseURL!
		}
	]);
	await page.addInitScript(
		(ids) => localStorage.setItem('journal-paintings-v2', JSON.stringify(ids)),
		['nga-1225', 'met-island']
	);
	await page.setViewportSize({ width: 1440, height: 1000 });
	const response = await page.goto('/');
	const serverOrder = [...(await response!.text()).matchAll(/data-painting="([^"]+)"/g)].map(
		(match) => match[1]
	);
	await expect(page.locator('.painting-label')).toHaveAttribute('data-dissolve-ready', 'true');
	const order = await page
		.locator('.paint-layer')
		.evaluateAll((layers) => layers.map((layer) => (layer as HTMLElement).dataset.painting!));
	expect(order).toEqual(serverOrder);
	expect([...order].sort()).toEqual([...selectedIds].sort());
	expect(new Set(order).size).toBe(selectedIds.length);
	// Only the current painting and its neighbor are requested initially.
	await expect(page.locator('.paint-layer img[src]')).toHaveCount(2);
	await scrollToScene(page, 1);
	await expect(page.locator('.paint-layer').nth(1)).toHaveCSS('visibility', 'visible');
	await page.setViewportSize({ width: 1280, height: 900 });
	expect(
		await page
			.locator('.paint-layer')
			.evaluateAll((layers) => layers.map((layer) => (layer as HTMLElement).dataset.painting!))
	).toEqual(order);
	await scrollToScene(page, 0);
	await expect(page.locator('.paint-layer').first()).toHaveCSS('visibility', 'visible');
	expect(
		await page.evaluate(() => JSON.parse(localStorage.getItem('journal-paintings-v2')!))
	).toEqual(['nga-1225', 'met-island']);
	const reload = await page.reload();
	const nextServerOrder = [...(await reload!.text()).matchAll(/data-painting="([^"]+)"/g)].map(
		(match) => match[1]
	);
	expect(nextServerOrder).not.toEqual(order);
	expect([...nextServerOrder].sort()).toEqual([...selectedIds].sort());
	await expect(page.locator('.painting-label')).toHaveAttribute('data-dissolve-ready', 'true');
	expect(
		await page
			.locator('.paint-layer')
			.evaluateAll((layers) => layers.map((layer) => (layer as HTMLElement).dataset.painting!))
	).toEqual(nextServerOrder);
	expect(
		await page.evaluate(() => JSON.parse(localStorage.getItem('journal-paintings-v2')!))
	).toEqual(['nga-1225', 'met-island']);
});
