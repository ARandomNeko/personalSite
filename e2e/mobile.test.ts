import { expect, test } from '@playwright/test';
import { scrollToScene } from './helpers';

test.use({ isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

for (const width of [320, 390]) {
	test(`phone layout leaves room to read and its menu works at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 844 });
		await page.goto('/');
		await page.evaluate(() => document.fonts.ready);
		const menu = page.getByRole('button', { name: 'Menu' });
		await expect(menu).toHaveAttribute('aria-expanded', 'false');
		await expect(page.getByRole('navigation', { name: 'Main navigation' })).not.toBeVisible();
		await menu.tap();
		await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(menu).toBeFocused();
		await expect(menu).toHaveAttribute('aria-expanded', 'false');
		await scrollToScene(page, 1);
		await expect(page.locator('.intro-note')).not.toBeInViewport();
		const header = (await page.locator('.site-header').boundingBox())!;
		const caption = (await page.locator('.painting-label').boundingBox())!;
		expect(header.height + caption.height).toBeLessThan(150);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
		await menu.tap();
		await page.getByRole('navigation').getByRole('link', { name: 'Library' }).tap();
		await expect(page).toHaveURL(/\/reading$/);
		await expect(menu).toHaveAttribute('aria-expanded', 'false');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('The library.');
	});
}

test('phone caption stays aligned after browser chrome resizes the viewport', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 744 });
	await page.goto('/');
	const card = page.locator('.painting-label');
	const canvas = page.locator('.caption-dissolve');
	const content = card.locator('.side-card-content');
	await expect(card).toHaveAttribute('data-dissolve-ready', 'true');
	// Browser controls can change the height while the card's width stays identical.
	await page.setViewportSize({ width: 390, height: 844 });
	await expect(card).toHaveAttribute('data-dissolve-ready', 'true');
	await scrollToScene(page, 1);
	await expect(canvas).toHaveAttribute('data-active', 'true');
	await expect(content).toHaveCSS('opacity', '0');
	const bounds = (await card.boundingBox())!;
	const surface = (await canvas.boundingBox())!;
	expect(Math.abs(surface.y - bounds.y)).toBeLessThanOrEqual(1);
	expect(Math.abs(surface.height - bounds.height)).toBeLessThanOrEqual(2);
	expect(await canvas.getAttribute('data-started')).toBe(
		await page.locator('.noise-dissolve').getAttribute('data-started')
	);
	// A resize during playback must immediately restore the real text and links.
	await page.setViewportSize({ width: 390, height: 744 });
	await expect(content).toHaveCSS('opacity', '1');
	await expect(canvas).toHaveAttribute('data-active', 'false');
	await expect(card.getByRole('link', { name: 'Source' })).toBeInViewport();
	await expect(card).toHaveAttribute('data-dissolve-ready', 'true');
	await scrollToScene(page, 2);
	await expect(canvas).toHaveAttribute('data-active', 'true');
	await expect(canvas).toHaveAttribute('data-active', 'false');
	await expect(content).toHaveCSS('opacity', '1');
	await expect(page.locator('.identity-dissolve')).toHaveAttribute('data-active', 'false');
});

test.describe('caption text at phone pixel density', () => {
	test.use({ deviceScaleFactor: 3, isMobile: false });
	test('snapshot glyphs keep the native text size', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.addInitScript(() => {
			const draw = CanvasRenderingContext2D.prototype.drawImage;
			CanvasRenderingContext2D.prototype.drawImage = function (...args: Parameters<typeof draw>) {
				draw.apply(this, args);
				const source = args[0];
				if (
					source instanceof HTMLImageElement &&
					source.src.startsWith('data:image/svg+xml') &&
					source.src.includes(encodeURIComponent('Current painting'))
				)
					Object.assign(window, { captionSnapshot: this.canvas.toDataURL() });
			} as typeof draw;
		});
		await page.goto('/');
		await expect(page.locator('.painting-label')).toHaveAttribute('data-dissolve-ready', 'true');
		const native = await page.locator('.painting-label').screenshot();
		const bounds = await page.evaluate(async (native) => {
			async function inkBounds(url: string, transparent: boolean) {
				const image = new Image();
				image.src = url;
				await image.decode();
				const canvas = document.createElement('canvas');
				canvas.width = image.naturalWidth;
				canvas.height = image.naturalHeight;
				const context = canvas.getContext('2d')!;
				context.drawImage(image, 0, 0);
				const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
				let left = canvas.width,
					top = canvas.height,
					right = 0,
					bottom = 0,
					count = 0;
				for (let y = 0; y < canvas.height; y++) {
					for (let x = 0; x < canvas.width; x++) {
						const offset = (y * canvas.width + x) * 4;
						// Exclude the dark native frame and compare the visible glyph extents.
						if (pixels[offset + 3] < 128 || pixels[offset] < 150 || pixels[offset + 1] < 150)
							continue;
						if (!transparent && pixels[offset + 2] < 100) continue;
						left = Math.min(left, x);
						top = Math.min(top, y);
						right = Math.max(right, x);
						bottom = Math.max(bottom, y);
						count++;
					}
				}
				return { left, top, width: right - left, height: bottom - top, count };
			}
			return {
				native: await inkBounds(`data:image/png;base64,${native}`, false),
				texture: await inkBounds(
					(window as unknown as { captionSnapshot: string }).captionSnapshot,
					true
				)
			};
		}, native.toString('base64'));
		expect(bounds.texture.count).toBeGreaterThan(100);
		expect(Math.abs(bounds.native.width - bounds.texture.width)).toBeLessThanOrEqual(3);
		expect(Math.abs(bounds.native.height - bounds.texture.height)).toBeLessThanOrEqual(3);
		expect(Math.abs(bounds.native.left - bounds.texture.left)).toBeLessThanOrEqual(3);
		expect(Math.abs(bounds.native.top - bounds.texture.top)).toBeLessThanOrEqual(3);
	});
});
