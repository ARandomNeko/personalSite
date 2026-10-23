import { describe, expect, it } from 'vitest';
import { quadtreeCursor, quadtreeTiming } from './QuadtreeTiming';

describe('quadtree pacing', () => {
	it('reserves hundreds of milliseconds for individual pixels at every display size', () => {
		for (const [width, height] of [
			[390, 844],
			[1280, 900],
			[3840, 2160]
		]) {
			const timing = quadtreeTiming(width, height);
			expect(timing.rootSize).toBe(256);
			expect(timing.stages.at(-1)).toBeGreaterThanOrEqual(480);
			expect(timing.stages.at(-1)).toBeLessThanOrEqual(780);
			expect(timing.duration).toBeLessThan(2400);
		}
	});

	it('gives denser buffers more time without altering the opening', () => {
		const normal = quadtreeTiming(1280, 900);
		const dense = quadtreeTiming(2560, 1800);
		expect(dense.duration).toBeGreaterThan(normal.duration);
		expect(dense.stages.slice(0, 3)).toEqual(normal.stages.slice(0, 3));
	});

	it('advances continuously and monotonically through the end of the pixel stage', () => {
		const timing = quadtreeTiming(1280, 900);
		let previous = 0;
		for (let step = 0; step <= 1000; step++) {
			const cursor = quadtreeCursor(step / 1000, timing);
			expect(cursor).toBeGreaterThanOrEqual(previous);
			expect(cursor - previous).toBeLessThan(0.004);
			previous = cursor;
		}
		const late = [0.85, 0.9, 0.95, 0.98, 0.99].map((t) => quadtreeCursor(t, timing));
		expect(late[0]).toBeGreaterThan(7 / 8);
		for (let i = 1; i < late.length; i++) expect(late[i]).toBeGreaterThan(late[i - 1]);
		expect(late.at(-1)).toBeLessThan(1);
		// Halving the time left should leave roughly a quarter as many switch
		// ranks outstanding, rather than dumping a linear-sized last-frame chunk.
		const tailRatio = (1 - late.at(-1)!) / (1 - late.at(-2)!);
		expect(tailRatio).toBeGreaterThan(0.2);
		expect(tailRatio).toBeLessThan(0.3);
		expect(quadtreeCursor(1, timing)).toBe(1);
	});

	it('leaves rest gently and matches velocity at every depth boundary', () => {
		const timing = quadtreeTiming(1280, 900);
		const dt = 0.01;
		const cursorAt = (ms: number) => quadtreeCursor(ms / timing.duration, timing);
		expect(cursorAt(0)).toBe(0);
		expect(cursorAt(10)).toBeGreaterThan(0);
		expect(cursorAt(10)).toBeLessThan(10 / timing.stages[0] / timing.stages.length / 5);
		for (const time of timing.boundaries.slice(1, -1)) {
			const before = (cursorAt(time) - cursorAt(time - dt)) / dt;
			const after = (cursorAt(time + dt) - cursorAt(time)) / dt;
			expect(Math.abs(after - before)).toBeLessThan(0.000001);
		}
		expect(1 - cursorAt(timing.duration - 10)).toBeLessThan(0.0001);
	});
});
