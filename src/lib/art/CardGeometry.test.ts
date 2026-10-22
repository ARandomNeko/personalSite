import { describe, expect, it } from 'vitest';
import { snapshotRect, textureBounds, unionRect } from './CardGeometry';

describe('card shader geometry', () => {
	it('encloses fractional borders on the device pixel grid with a clear pixel of padding', () => {
		const card = { left: 66.015625, top: 776.015625, width: 330.984375, height: 195.984375 };
		for (const scale of [1, 1.2, 1.25, 2]) {
			const frame = snapshotRect(card, scale);
			for (const value of [frame.left, frame.top, frame.width, frame.height]) {
				expect(Math.abs(value * scale - Math.round(value * scale))).toBeLessThan(1e-9);
			}
			expect((card.left - frame.left) * scale).toBeGreaterThanOrEqual(1 - 1e-9);
			expect((card.top - frame.top) * scale).toBeGreaterThanOrEqual(1 - 1e-9);
			expect((frame.left + frame.width - card.left - card.width) * scale).toBeGreaterThanOrEqual(
				1 - 1e-9
			);
			expect((frame.top + frame.height - card.top - card.height) * scale).toBeGreaterThanOrEqual(
				1 - 1e-9
			);
		}
	});
	it('keeps bottom-anchored cards at their original scale through growth and shrinkage', () => {
		const short = { left: 64, top: 672, width: 330, height: 200 };
		const tall = { left: 64, top: 572, width: 330, height: 300 };
		const union = unionRect(short, tall);
		expect(union).toEqual(tall);
		expect(unionRect(tall, short)).toEqual(union);
		expect(textureBounds(short, union)).toEqual([0, 0, 1, 2 / 3]);
		expect(textureBounds(tall, union)).toEqual([0, 0, 1, 1]);
	});

	it('keeps the identity card anchored at the top while its matching frame grows', () => {
		const short = { left: 64, top: 110, width: 330, height: 200 };
		const tall = { ...short, height: 300 };
		expect(textureBounds(short, unionRect(short, tall))).toEqual([0, 1 / 3, 1, 2 / 3]);
	});

	it('preserves pixel positions when placing an interrupted GPU snapshot into new bounds', () => {
		const frozen = { left: 64, top: 570, width: 330, height: 302 };
		const next = { left: 64, top: 540, width: 330, height: 332 };
		const union = unionRect(frozen, next);
		const bounds = textureBounds(frozen, union);
		expect(bounds[2] * union.width).toBe(frozen.width);
		expect(bounds[3] * union.height).toBe(frozen.height);
		expect(union.top + union.height - (bounds[1] + bounds[3]) * union.height).toBe(frozen.top);
	});
});
