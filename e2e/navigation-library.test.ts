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
			if (width <= 650) await page.getByRole('button', { name: 'Menu' }).click();
			const navigation = page.getByRole('navigation', { name: 'Main navigation' });
			await expect(navigation.getByRole('link')).toHaveText(destinations.map((item) => item.label));
			expect(
				await navigation
					.locator('a')
					.evaluateAll((links) => links.map((link) => link.getAttribute('href')))
			).toEqual(destinations.map((item) => item.path));
			await navigation.getByRole('link', { name: destination.label, exact: true }).click();
			await expect(page).toHaveURL(new RegExp(`${destination.path}$`));
			if (width <= 650) {
				await expect(page.getByRole('button', { name: 'Menu' })).toHaveAttribute(
					'aria-expanded',
					'false'
				);
				await page.getByRole('button', { name: 'Menu' }).click();
			}
			await expect(
				navigation.getByRole('link', { name: destination.label, exact: true })
			).toHaveAttribute('aria-current', 'page');
			if (width <= 650) await page.getByRole('button', { name: 'Close' }).click();
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

for (const width of [1440, 390]) {
	test(`simple library groups and painting selection work at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		const errors: string[] = [];
		page.on('pageerror', (error) => errors.push(error.message));
		await page.goto('/reading');
		const current = page.getByRole('list', { name: 'Reading now', exact: true });
		const collection = page.getByRole('list', { name: 'Owned / to read', exact: true });
		const finished = page.getByRole('list', { name: 'Read', exact: true });
		await expect(current.getByRole('button')).toHaveCount(2);
		await expect(collection.getByRole('button')).toHaveCount(10);
		await expect(finished.getByRole('button')).toHaveCount(16);
		const caption = page.getByRole('complementary', { name: 'Current painting' });
		await expect(caption).toContainText('The Garden of Earthly Delights');
		const book = page.getByRole('button', { name: 'The Picture of Dorian Gray Oscar Wilde' });
		await book.click();
		await expect(book).toHaveAttribute('aria-pressed', 'true');
		await expect(caption).toContainText('Self-Portrait at Twenty-Eight');
		await expect(caption.getByRole('link')).toHaveAttribute('href', /^https:\/\//);
		await expect
			.poll(() => page.locator('.library-backdrop img').getAttribute('src'))
			.toMatch(/durer-self-portrait/);
		await expect
			.poll(() =>
				page
					.locator('.library-backdrop img')
					.evaluate((img) => img.complete && img.naturalWidth > 0)
			)
			.toBe(true);
		await current.getByRole('button').first().focus();
		await expect(caption).toContainText('The Garden of Earthly Delights');
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
		await expect(page.locator('.cabinet, .book-card')).toHaveCount(0);
		expect(errors).toEqual([]);
	});
}

for (const mode of ['reduced motion', 'no WebGL'] as const) {
	test(`library paintings remain usable with ${mode}`, async ({ page }) => {
		if (mode === 'reduced motion') await page.emulateMedia({ reducedMotion: 'reduce' });
		else
			await page.addInitScript(() => {
				const original = HTMLCanvasElement.prototype.getContext;
				HTMLCanvasElement.prototype.getContext = function (
					this: HTMLCanvasElement,
					...args: Parameters<typeof original>
				) {
					if (String(args[0]).includes('webgl')) return null;
					return original.apply(this, args);
				} as typeof original;
			});
		await page.goto('/reading');
		await page.getByRole('button', { name: 'The Picture of Dorian Gray Oscar Wilde' }).click();
		await expect
			.poll(() => page.locator('.library-backdrop img').getAttribute('src'))
			.toMatch(/durer-self-portrait/);
		await expect
			.poll(() =>
				page
					.locator('.library-backdrop img')
					.evaluate((img) => img.complete && img.naturalWidth > 0)
			)
			.toBe(true);
		await expect(page.locator('.library-backdrop canvas')).toHaveAttribute('data-active', 'false');
	});
}

test('preloaded library paintings keep valid crop coordinates through rapid changes', async ({
	page
}) => {
	await page.addInitScript(() => {
		const positions: number[][] = [];
		Object.assign(window, { libraryShaderPositions: positions });
		const getContext = HTMLCanvasElement.prototype.getContext;
		HTMLCanvasElement.prototype.getContext = function (name: string, ...args: unknown[]) {
			const context = getContext.apply(this, [name, ...args] as Parameters<typeof getContext>);
			if (name !== 'webgl' || !context) return context;
			const gl = context as WebGLRenderingContext;
			const locations = new WeakMap<WebGLUniformLocation, string>();
			const getUniformLocation = gl.getUniformLocation.bind(gl);
			gl.getUniformLocation = (program, uniform) => {
				const location = getUniformLocation(program, uniform);
				if (location) locations.set(location, uniform);
				return location;
			};
			const uniform2f = gl.uniform2f.bind(gl);
			gl.uniform2f = (location, x, y) => {
				if (location && ['u_fromPosition', 'u_toPosition'].includes(locations.get(location) ?? ''))
					positions.push([x, y]);
				uniform2f(location, x, y);
			};
			return context;
		} as typeof getContext;
	});
	await page.goto('/reading');
	const backdrop = page.locator('.library-backdrop');
	await backdrop.locator('img').evaluate((img) => img.decode());
	await page.getByRole('button', { name: 'The Picture of Dorian Gray Oscar Wilde' }).click();
	await expect(backdrop.locator('canvas')).toHaveAttribute('data-active', 'true');
	await page.getByRole('button', { name: 'Crime and Punishment Fyodor Dostoyevsky' }).click();
	await expect(backdrop.locator('img')).toHaveAttribute('src', /repin-ivan-terrible/);
	await expect(backdrop.locator('canvas')).toHaveAttribute('data-active', 'false', {
		timeout: 15000
	});
	const positions = await page.evaluate(
		() => (window as unknown as { libraryShaderPositions: number[][] }).libraryShaderPositions
	);
	expect(positions.length).toBeGreaterThan(2);
	expect(positions.every((pair) => pair.every(Number.isFinite))).toBe(true);
	expect(positions.some(([x, y]) => x === 0.6 && y === 0.5)).toBe(true);
	await expect(page.getByRole('complementary', { name: 'Current painting' })).toContainText(
		'Ivan the Terrible and His Son Ivan'
	);
	await expect(backdrop.locator('img')).toHaveCSS('object-position', '60% 50%');
});
