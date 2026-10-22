import { describe, expect, it } from 'vitest';
import { shuffled } from './shuffle';

describe('painting order', () => {
	const selected = Array.from({ length: 25 }, (_, index) => `painting-${index}`);

	it('reuses the same permutation for server rendering and hydration without changing the saved selection', () => {
		const before = [...selected];
		const order = shuffled(selected, 48271);
		expect(shuffled(selected, 48271)).toEqual(order);
		expect(order).not.toEqual(selected);
		expect([...order].sort()).toEqual([...selected].sort());
		expect(new Set(order).size).toBe(selected.length);
		expect(selected).toEqual(before);
	});

	it('gives different seeds different orders and makes the entire selection eligible for the first four cards', () => {
		expect(shuffled(selected, 1)).not.toEqual(shuffled(selected, 2));
		const seen = new Set<string>();
		for (let seed = 0; seed < 128; seed++) {
			for (const id of shuffled(selected, seed).slice(0, 4)) seen.add(id);
		}
		expect([...seen].sort()).toEqual([...selected].sort());
	});

	it('handles an empty or single-painting collection and a zero seed', () => {
		expect(shuffled([], 0)).toEqual([]);
		expect(shuffled(['only'], 0)).toEqual(['only']);
		expect(new Set(shuffled(selected, 0)).size).toBe(selected.length);
	});
});
