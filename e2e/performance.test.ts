import { expect, test } from '@playwright/test';

for (const path of ['/', '/blog', '/reading', '/resume']) {
	test(`${path} loads local fonts and phone-sized backgrounds without starting WebGL`, async ({
		page
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.addInitScript(() => {
			Object.assign(window, { startedWebGL: 0 });
			const getContext = HTMLCanvasElement.prototype.getContext;
			HTMLCanvasElement.prototype.getContext = function (name: string, ...args: unknown[]) {
				if (name.includes('webgl')) (window as unknown as { startedWebGL: number }).startedWebGL++;
				return getContext.apply(this, [name, ...args] as Parameters<typeof getContext>);
			} as typeof getContext;
		});
		const requests: string[] = [];
		page.on('request', (request) => requests.push(request.url()));
		await page.goto(path);
		await page.evaluate(() => document.fonts.ready);
		const background = page
			.locator(path === '/' ? '.paint-layer img' : '.library-backdrop img')
			.first();
		await background.evaluate((img) => img.decode());
		const imageWidth = await background.evaluate(async (img) => {
			const decoded = new Image();
			decoded.src = img.currentSrc;
			await decoded.decode();
			return decoded.naturalWidth;
		});
		expect(imageWidth).toBeLessThanOrEqual(1600);
		expect(
			await page.evaluate(() => (window as unknown as { startedWebGL: number }).startedWebGL)
		).toBe(0);
		expect(requests.some((url) => /fonts\.googleapis|fonts\.gstatic/.test(url))).toBe(false);
		const fonts = requests.filter((url) => url.includes('/fonts/'));
		expect(fonts.length).toBeGreaterThan(0);
		expect(fonts.every((url) => url.endsWith('.woff2'))).toBe(true);
	});
}
