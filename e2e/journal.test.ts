import { scrollToScene } from './helpers';
import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const catalogue = JSON.parse(
	readFileSync(new URL('../src/lib/art/catalogue.json', import.meta.url), 'utf8')
) as {
	id: string;
	name: string;
	artist: string;
	year: string;
	style: string;
	source: string;
	width: number;
}[];
const selectedIds = JSON.parse(
	readFileSync(new URL('../src/lib/art/selection.json', import.meta.url), 'utf8')
) as string[];

test('journal reveals decoded paintings smoothly and updates the painting label', async ({
	page
}) => {
	const errors: string[] = [];
	const wasm: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	page.on('request', (request) => {
		if (request.url().includes('.wasm')) wasm.push(request.url());
	});
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.addInitScript(() => {
		// Previous design trials must not override the newly approved default collection.
		localStorage.setItem('journal-paintings-v1', JSON.stringify(['nga-1225', 'met-island']));
	});
	await page.goto('/');
	const order = await page
		.locator('.paint-layer')
		.evaluateAll((layers) => layers.map((layer) => (layer as HTMLElement).dataset.painting!));
	expect([...order].sort()).toEqual([...selectedIds].sort());
	await expect(page.getByRole('complementary', { name: 'Current painting' })).toContainText(
		catalogue.find((painting) => painting.id === order[0])!.name
	);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		'RL/PPO Drone Simulation Sandbox'
	);
	await expect(page.getByRole('complementary', { name: 'About me' })).toContainText('Rutgers');
	await expect(page.getByRole('complementary', { name: 'About me' })).toContainText(
		'Rituparan Reddy.'
	);
	await expect(page.getByRole('complementary', { name: 'About me' })).toHaveCSS(
		'position',
		'fixed'
	);
	await expect(page.getByRole('navigation').getByRole('link', { name: 'Résumé' })).toHaveAttribute(
		'href',
		'/resume'
	);
	await expect(page.locator('.paint-layer').first()).toHaveCSS('visibility', 'visible');
	await expect(page.locator('.painting-label')).toHaveAttribute('data-dissolve-ready', 'true');
	await expect
		.poll(() =>
			page
				.locator('.paint-layer')
				.first()
				.locator('img')
				.evaluate(async (img) => {
					const asset = new Image();
					asset.src = (img as HTMLImageElement).currentSrc;
					await asset.decode();
					return asset.naturalWidth;
				})
		)
		.toBeGreaterThanOrEqual(
			Math.min(1600, catalogue.find((painting) => painting.id === order[0])!.width)
		);
	await expect
		.poll(async () => {
			const about = await page.getByRole('complementary', { name: 'About me' }).boundingBox();
			const painting = await page
				.getByRole('complementary', { name: 'Current painting' })
				.boundingBox();
			return Math.abs(about!.width - painting!.width) + Math.abs(about!.height - painting!.height);
		})
		.toBeLessThan(2);
	// Scrolling within the same reading card must not cycle through the painting collection.
	const introTop = (await page.getByRole('complementary', { name: 'About me' }).boundingBox())!.y;
	await page.mouse.wheel(0, 180);
	await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
	await expect(page.locator('[data-scene="0"]')).toHaveAttribute('data-focused', 'true');
	expect((await page.getByRole('complementary', { name: 'About me' }).boundingBox())!.y).toBe(
		introTop
	);
	await expect(page.getByRole('complementary', { name: 'Current painting' })).toContainText(
		catalogue.find((painting) => painting.id === order[0])!.name
	);
	await scrollToScene(page, 1);
	await expect(page.locator('.noise-dissolve')).toHaveAttribute('data-active', 'true');
	await expect(page.locator('.noise-dissolve')).toHaveAttribute('data-renderer', 'webgl');
	await expect(page.locator('.noise-dissolve')).toHaveAttribute('data-transition', 'quadtree');
	const caption = page.locator('.caption-dissolve');
	await expect(caption).toHaveAttribute('data-renderer', 'webgl');
	await expect(caption).toHaveAttribute('data-active', 'true');
	expect(await caption.getAttribute('data-started')).toBe(
		await page.locator('.noise-dissolve').getAttribute('data-started')
	);
	expect(await caption.getAttribute('data-duration')).toBe(
		await page.locator('.noise-dissolve').getAttribute('data-duration')
	);
	const cardBounds = await page.locator('.painting-label').boundingBox();
	expect(
		await caption.evaluate((element) => ({
			width: (element as HTMLCanvasElement).width,
			height: (element as HTMLCanvasElement).height
		}))
	).toEqual({
		width: Math.ceil(cardBounds!.width) + 2,
		height: Math.round(
			Math.max(
				Number(await caption.getAttribute('data-from-height')),
				Number(await caption.getAttribute('data-to-height'))
			)
		)
	});
	await expect(page.locator('#books')).toHaveAttribute('data-focused', 'true');
	await expect(page.locator('.paint-layer').nth(1)).toHaveCSS('clip-path', 'none');
	await expect(page.getByRole('complementary', { name: 'Current painting' })).toContainText(
		catalogue.find((painting) => painting.id === order[1])!.name
	);
	await expect(page.locator('.paint-layer').first()).toHaveCSS('visibility', 'hidden');
	await expect(page.locator('.paint-layer').nth(1)).toHaveCSS('visibility', 'visible');
	await expect(page.locator('.noise-dissolve')).toHaveAttribute('data-cell-size', '1');
	await expect(caption).toHaveAttribute('data-cell-size', '1');
	await expect(caption).toHaveAttribute('data-active', 'false');
	await expect(page.locator('.painting-label .side-card-content')).toHaveCSS('opacity', '1');
	await scrollToScene(page, 2);
	await expect(page.locator('.noise-dissolve')).toHaveAttribute('data-active', 'true');
	await scrollToScene(page, 0);
	await expect(page.locator('[data-scene="0"]')).toHaveAttribute('data-focused', 'true');
	await expect(page.locator('.paint-layer').first()).toHaveCSS('opacity', '1');
	await expect(page.locator('.paint-layer').nth(2)).toHaveCSS('visibility', 'hidden');
	await expect(page.locator('.noise-dissolve')).toHaveAttribute('data-active', 'false');
	await expect(caption).toHaveAttribute('data-active', 'false');
	await expect(page.locator('.painting-label .side-card-content')).toHaveCSS('opacity', '1');
	// A long jump back to the first card must not finish a stale transition afterward.
	expect(
		await page
			.locator('.paint-layer')
			.evaluateAll(
				(layers) =>
					layers.filter((layer) => getComputedStyle(layer).visibility === 'visible').length
			)
	).toBe(1);
	await scrollToScene(page, 2);
	await page.locator('#work').getByRole('link', { name: 'Read entry' }).click();
	await expect(page).toHaveURL(/\/blog\/polymarket-bot$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Polymarket Bot');
	expect(wasm).toEqual([]);
	expect(errors).toEqual([]);
});

test('mobile introduction scrolls away and reduced motion changes paintings without animation', async ({
	page
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/');
	await scrollToScene(page, 2);
	await expect(page.locator('.paint-layer').first()).toHaveCSS('transform', 'none');
	await expect(page.locator('.paint-layer').nth(2)).toHaveCSS('visibility', 'visible');
	await expect(page.locator('#work')).toHaveAttribute('data-focused', 'true');
	await expect(page.locator('.noise-dissolve')).toHaveAttribute('data-active', 'false');
	await expect(page.locator('.caption-dissolve')).toHaveAttribute('data-active', 'false');
	await expect(page.locator('.painting-label .side-card-content')).toHaveCSS('opacity', '1');
	await expect(page.getByRole('complementary', { name: 'About me' })).not.toBeInViewport();
	expect(
		await page
			.locator('.paint-layer')
			.nth(2)
			.evaluate((layer) => layer.getAnimations().length)
	).toBe(0);
	const painting = await page
		.getByRole('complementary', { name: 'Current painting' })
		.boundingBox();
	expect(painting!.height).toBeLessThan(100);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
	await expect(page.getByRole('complementary', { name: 'Current painting' })).toBeVisible();
});

test('quadtree reaches individual drawing-buffer pixels on a high-density display', async ({
	browser,
	baseURL
}) => {
	const context = await browser.newContext({
		baseURL,
		viewport: { width: 640, height: 480 },
		deviceScaleFactor: 2
	});
	try {
		const page = await context.newPage();
		await page.goto('/');
		await scrollToScene(page, 1);
		await expect(page.locator('.noise-dissolve')).toHaveAttribute('data-renderer', 'webgl');
		await expect(page.locator('.noise-dissolve')).toHaveAttribute('data-cell-size', '1');
		expect(
			await page.locator('.noise-dissolve').evaluate((canvas) => ({
				width: (canvas as HTMLCanvasElement).width,
				height: (canvas as HTMLCanvasElement).height
			}))
		).toEqual({ width: 1280, height: 960 });
	} finally {
		await context.close();
	}
});

test('painting changes still work without WebGL', async ({ page }) => {
	await page.addInitScript(() => {
		const getContext = HTMLCanvasElement.prototype.getContext;
		HTMLCanvasElement.prototype.getContext = function (name: string, ...args: unknown[]) {
			if (name === 'webgl') return null;
			return getContext.apply(this, [name, ...args] as Parameters<typeof getContext>);
		} as typeof getContext;
	});
	await page.goto('/');
	await scrollToScene(page, 1);
	await expect(page.locator('.noise-dissolve')).toHaveAttribute('data-renderer', 'fallback');
	await expect(page.locator('.paint-layer').nth(1)).toHaveCSS('visibility', 'visible');
	await expect(page.locator('.paint-layer').first()).toHaveCSS('visibility', 'hidden');
	await expect(page.getByRole('complementary', { name: 'About me' })).toBeInViewport();
});

test('losing the GPU during a dissolve leaves the decoded painting visible', async ({ page }) => {
	await page.goto('/');
	await scrollToScene(page, 1);
	await expect(page.locator('.noise-dissolve')).toHaveAttribute('data-active', 'true');
	await page.locator('.noise-dissolve').evaluate((canvas) => {
		(canvas as HTMLCanvasElement)
			.getContext('webgl')!
			.getExtension('WEBGL_lose_context')!
			.loseContext();
	});
	await expect(page.locator('.noise-dissolve')).toHaveAttribute('data-active', 'false');
	await expect(page.locator('.paint-layer').nth(1)).toHaveCSS('visibility', 'visible');
	await scrollToScene(page, 2);
	await expect(page.locator('.paint-layer').nth(2)).toHaveCSS('visibility', 'visible');
	await expect(page.locator('.paint-layer').nth(1)).toHaveCSS('visibility', 'hidden');
});

test('painting card returns to native text and links if its own GPU context is lost', async ({
	page
}) => {
	await page.goto('/');
	await expect(page.locator('.painting-label')).toHaveAttribute('data-dissolve-ready', 'true');
	const nextId = await page.locator('.paint-layer').nth(1).getAttribute('data-painting');
	await scrollToScene(page, 1);
	await expect(page.locator('.caption-dissolve')).toHaveAttribute('data-active', 'true');
	await page.locator('.caption-dissolve').evaluate((element) => {
		(element as HTMLCanvasElement)
			.getContext('webgl')!
			.getExtension('WEBGL_lose_context')!
			.loseContext();
	});
	await expect(page.locator('.caption-dissolve')).toHaveAttribute('data-active', 'false');
	await expect(page.locator('.painting-label .side-card-content')).toHaveCSS('opacity', '1');
	await expect(page.getByRole('complementary', { name: 'Current painting' })).toContainText(
		catalogue.find((painting) => painting.id === nextId)!.name
	);
	await expect(
		page.locator('.painting-label').getByRole('link', { name: 'Source' })
	).toHaveAttribute('href', catalogue.find((painting) => painting.id === nextId)!.source);
});

test('card contents dissolve over a native frame during height changes', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto('/');
	// Reader styles produce a deterministic height change with any shuffled paintings.
	// No picker preferences or changes to Svelte-managed text are needed.
	await page.addStyleTag({
		content: `
			.painting-label .painting-name { font-size: 40px !important; }
			.journal-page:has(#books[data-focused="true"]) .painting-label .painting-name {
				padding-bottom: 320px;
			}
		`
	});
	await expect(page.locator('.painting-label')).toHaveAttribute('data-dissolve-ready', 'true');
	const nextId = await page.locator('.paint-layer').nth(1).getAttribute('data-painting');
	const old = await page.locator('.painting-label').boundingBox();
	await scrollToScene(page, 1);
	const caption = page.locator('.caption-dissolve');
	await expect(caption).toHaveAttribute('data-active', 'true');
	await expect(page.locator('.identity-dissolve')).toHaveAttribute('data-active', 'true');
	await expect(page.locator('.painting-label .side-card-content')).toHaveCSS('opacity', '0');
	await expect(page.locator('.painting-label')).toHaveCSS('opacity', '1');
	const target = await page.locator('.painting-label').boundingBox();
	expect(target!.height - old!.height).toBeGreaterThan(30);
	const area = await caption.boundingBox();
	// The raster surface includes one clear device pixel beyond each native edge.
	expect(Math.abs(area!.height - target!.height - 2)).toBeLessThan(1);
	expect(Math.abs(area!.y + area!.height - old!.y - old!.height - 1)).toBeLessThan(1);
	await page.waitForFunction(
		() => Number(document.querySelector<HTMLElement>('.caption-dissolve')!.dataset.progress) > 0.4
	);
	const alpha = await caption.evaluate(
		(element, oldHeight) =>
			new Promise<{ transparent: number; opaque: number; other: number; alphaContext: boolean }>(
				(resolve) => {
					requestAnimationFrame(() => {
						const canvas = element as HTMLCanvasElement;
						const gl = canvas.getContext('webgl')!;
						const stripHeight = Math.max(
							1,
							Math.floor(canvas.height - oldHeight * devicePixelRatio - 2)
						);
						const pixels = new Uint8Array(canvas.width * stripHeight * 4);
						gl.readPixels(
							0,
							canvas.height - stripHeight,
							canvas.width,
							stripHeight,
							gl.RGBA,
							gl.UNSIGNED_BYTE,
							pixels
						);
						let transparent = 0,
							opaque = 0,
							other = 0;
						for (let i = 3; i < pixels.length; i += 4) {
							if (pixels[i] === 0) transparent++;
							else if (pixels[i] === 255) opaque++;
							else other++;
						}
						resolve({ transparent, opaque, other, alphaContext: gl.getContextAttributes()!.alpha });
					});
				}
			),
		old!.height
	);
	expect(alpha.alphaContext).toBe(true);
	expect(alpha.transparent).toBeGreaterThan(100);
	expect(alpha.opaque).toBeGreaterThan(100);
	// Transparent text textures retain the font rasterizer's antialiased glyph edges.
	expect(alpha.other).toBeGreaterThan(0);
	await expect(caption).toHaveAttribute('data-active', 'false');
	await expect(page.locator('.painting-label')).toHaveCSS('opacity', '1');
	// Reverse while the taller card is dissolving away, then interrupt that shrink.
	await scrollToScene(page, 0);
	await expect(caption).toHaveAttribute('data-active', 'true');
	expect(Number(await caption.getAttribute('data-from-height'))).toBeGreaterThan(
		Number(await caption.getAttribute('data-to-height'))
	);
	await scrollToScene(page, 1);
	await expect(caption).toHaveAttribute('data-active', 'false');
	await expect(page.locator('.painting-label')).toHaveCSS('opacity', '1');
	await expect(page.locator('.intro-note')).toHaveCSS('opacity', '1');
	const about = await page.locator('.intro-note').boundingBox();
	const painting = await page.locator('.painting-label').boundingBox();
	expect(Math.abs(about!.height - painting!.height)).toBeLessThan(1);
	await expect(page.locator('.painting-label')).toContainText(
		catalogue.find((painting) => painting.id === nextId)!.name
	);
});

for (const scale of [1, 1.2]) {
	test.describe(`card border handoff at ${scale}x`, () => {
		test.use({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: scale });
		test('fractional card borders stay visually stable during and after the shader', async ({
			page
		}) => {
			// Install fractional geometry before hydration so the initial cached snapshot
			// already has these dimensions; resizing after warmup would test a resize.
			await page.addInitScript((scale) => {
				const install = () => {
					if (!document.documentElement) return false;
					const style = document.createElement('style');
					style.textContent = `
						.painted-world, .painted-world * { visibility: hidden !important; }
						.journal-page { background: #202225 !important; }
						.painting-label, .intro-note {
							width: ${330.984375 / scale}px !important;
							height: ${395.984375 / scale}px !important;
							left: ${66.015625 / scale}px !important;
							bottom: ${28 / scale}px !important;
						}
					`;
					document.documentElement.append(style);
					return true;
				};
				if (!install()) {
					const observer = new MutationObserver(() => {
						if (install()) observer.disconnect();
					});
					observer.observe(document, { childList: true, subtree: true });
				}
			}, scale);
			await page.goto('/');
			const card = page.locator('.painting-label');
			await expect(card).toHaveAttribute('data-dissolve-ready', 'true');
			await scrollToScene(page, 1);
			const caption = page.locator('.caption-dissolve');
			await expect(caption).toHaveAttribute('data-active', 'true');
			await expect(card).toHaveCSS('opacity', '1');
			await expect(card.locator('.side-card-content')).toHaveCSS('opacity', '0');

			await expect(card).toHaveCSS('border-right-color', 'rgb(119, 120, 109)');
			const during = await page.screenshot();
			await expect(caption).toHaveAttribute('data-active', 'false');
			await expect(card.locator('.side-card-content')).toHaveCSS('opacity', '1');
			await expect(card).toHaveCSS('opacity', '1');
			const after = await page.screenshot();
			const pixels = await page.evaluate(
				async ({ during, after }) => {
					const rect = document.querySelector('.painting-label')!.getBoundingClientRect();
					const half = 0.5 / devicePixelRatio;
					const positions = [
						[(rect.left + rect.right) / 2, rect.top + half],
						[(rect.left + rect.right) / 2, rect.bottom - half],
						[rect.left + half, (rect.top + rect.bottom) / 2],
						[rect.right - half, (rect.top + rect.bottom) / 2]
					];
					const sample = async (encoded: string) => {
						const image = new Image();
						image.src = `data:image/png;base64,${encoded}`;
						await image.decode();
						const canvas = document.createElement('canvas');
						canvas.width = image.naturalWidth;
						canvas.height = image.naturalHeight;
						const context = canvas.getContext('2d')!;
						context.drawImage(image, 0, 0);
						return positions.map(([x, y]) =>
							Array.from(
								context.getImageData(
									Math.floor(x * devicePixelRatio),
									Math.floor(y * devicePixelRatio),
									1,
									1
								).data
							)
						);
					};
					return { during: await sample(during), after: await sample(after) };
				},
				{ during: during.toString('base64'), after: after.toString('base64') }
			);
			for (const [index, edge] of pixels.during.entries()) {
				for (let channel = 0; channel < 4; channel++) {
					expect(
						Math.abs(edge[channel] - pixels.after[index][channel]),
						`border ${index} changed at handoff: ${edge} vs ${pixels.after[index]}`
					).toBeLessThanOrEqual(4);
				}
				// A partially covered edge pixel is antialiased, but must remain brighter than the panel.
				expect(edge[0]).toBeGreaterThan(50);
			}
		});
	});
}
