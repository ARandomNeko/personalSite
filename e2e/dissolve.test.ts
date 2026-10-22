import { scrollToScene } from './helpers';
import { expect, test } from '@playwright/test';

type SnapshotResult = {
	copyError: number;
	compared?: number;
	mismatched?: number;
	nonblack?: number;
};

declare global {
	interface Window {
		__dissolveSnapshots: SnapshotResult[];
	}
}

test('interrupting an opaque painting dissolve preserves the displayed pixels', async ({
	page
}) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.addInitScript(() => {
		const captures: SnapshotResult[] = (window.__dissolveSnapshots = []);
		const wrapped = new WeakSet<WebGLRenderingContext>();
		const getContext = HTMLCanvasElement.prototype.getContext;
		HTMLCanvasElement.prototype.getContext = function (name: string, ...args: unknown[]) {
			const context = getContext.apply(this, [name, ...args] as Parameters<typeof getContext>);
			if (name !== 'webgl' || !context || !this.classList.contains('noise-dissolve'))
				return context;
			const gl = context as WebGLRenderingContext;
			if (wrapped.has(gl)) return context;
			wrapped.add(gl);
			let pending: { pixels: Uint8Array; result: SnapshotResult } | undefined;
			const read = () => {
				const pixels = new Uint8Array(32 * 32 * 4);
				gl.readPixels(
					Math.floor(gl.drawingBufferWidth * 0.37),
					Math.floor(gl.drawingBufferHeight * 0.43),
					32,
					32,
					gl.RGBA,
					gl.UNSIGNED_BYTE,
					pixels
				);
				return pixels;
			};
			const copy = gl.copyTexImage2D.bind(gl);
			gl.copyTexImage2D = (...parameters: Parameters<typeof copy>) => {
				const pixels = read();
				copy(...parameters);
				const result: SnapshotResult = { copyError: gl.getError() };
				captures.push(result);
				pending = { pixels, result };
			};
			const draw = gl.drawArrays.bind(gl);
			gl.drawArrays = (...parameters: Parameters<typeof draw>) => {
				draw(...parameters);
				if (!pending || gl.getParameter(gl.FRAMEBUFFER_BINDING)) return;
				const program = gl.getParameter(gl.CURRENT_PROGRAM) as WebGLProgram;
				const progress = gl.getUniformLocation(program, 'u_progress');
				if (progress === null || gl.getUniform(program, progress) !== 0) return;
				const pixels = read();
				let mismatched = 0,
					nonblack = 0;
				for (let i = 0; i < pixels.length; i += 4) {
					const source = pending.pixels;
					if (source[i] + source[i + 1] + source[i + 2] > 0) nonblack++;
					if (Math.max(...[0, 1, 2, 3].map((j) => Math.abs(pixels[i + j] - source[i + j]))) > 1)
						mismatched++;
				}
				Object.assign(pending.result, { compared: pixels.length / 4, mismatched, nonblack });
				pending = undefined;
			};
			return context;
		} as typeof getContext;
	});
	await page.goto('/');
	await scrollToScene(page, 1);
	await expect(page.locator('.noise-dissolve')).toHaveAttribute('data-active', 'true');
	await page
		.locator('.paint-layer')
		.nth(2)
		.locator('img')
		.evaluate((image) => image.decode());
	await scrollToScene(page, 2);
	await expect
		.poll(() =>
			page.evaluate(() => window.__dissolveSnapshots.filter((capture) => capture.compared).length)
		)
		.toBeGreaterThan(0);
	await scrollToScene(page, 0);
	await expect
		.poll(() =>
			page.evaluate(() => window.__dissolveSnapshots.filter((capture) => capture.compared).length)
		)
		.toBeGreaterThan(1);
	const captures = await page.evaluate(() => window.__dissolveSnapshots);
	for (const capture of captures) {
		expect(capture.copyError).toBe(0);
		expect(capture.compared).toBe(1024);
		expect(capture.nonblack).toBeGreaterThan(0);
		expect(capture.mismatched).toBe(0);
	}
	await expect(page.locator('.noise-dissolve')).toHaveAttribute('data-active', 'false');
	await expect(page.locator('.paint-layer').first()).toHaveCSS('visibility', 'visible');
});
