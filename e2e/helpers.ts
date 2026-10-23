import { expect, type Page } from '@playwright/test';

export async function scrollToScene(page: Page, scene: number) {
	await page.locator(`[data-scene="${scene}"] .sheet`).evaluate((card) => {
		const bounds = card.getBoundingClientRect();
		window.scrollTo({
			top: bounds.top + scrollY + bounds.height / 2 - innerHeight * 0.48,
			behavior: 'instant'
		});
	});
	await expect(page.locator(`[data-scene="${scene}"]`)).toHaveAttribute('data-focused', 'true');
}
