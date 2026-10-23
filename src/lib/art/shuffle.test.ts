import { afterEach, describe, expect, it, vi } from 'vitest';
import { shuffled } from './shuffle';

function draws(values: number[]) {
	let index = 0;
	return vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
		if (index >= values.length) throw new Error('Unexpected entropy draw');
		(array as Uint32Array)[0] = values[index++];
		return array;
	});
}

afterEach(() => vi.restoreAllMocks());

describe('painting order', () => {
	it('draws a fresh crypto value per swap without changing the saved selection', () => {
		const random = draws([0, 0, 2, 1]);
		const selected = ['a', 'b', 'c'];
		expect(shuffled(selected)).toEqual(['b', 'c', 'a']);
		expect(shuffled(selected)).toEqual(['a', 'b', 'c']);
		expect(selected).toEqual(['a', 'b', 'c']);
		expect(random).toHaveBeenCalledTimes(4);
	});

	it('rejects the uneven uint32 tail instead of giving index zero an extra chance', () => {
		const random = draws([0xffffffff, 0xfffffffe, 0xffffffff]);
		// For three choices the final uint32 value is rejected. For two choices,
		// the whole uint32 range is even, so that same value is valid.
		expect(shuffled(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
		expect(random).toHaveBeenCalledTimes(3);
	});

	it('maps every equally likely draw sequence to a distinct permutation', () => {
		const random = draws([0, 0, 0, 1, 1, 0, 1, 1, 2, 0, 2, 1]);
		const permutations = new Set(
			Array.from({ length: 6 }, () => shuffled(['a', 'b', 'c']).join(''))
		);
		expect([...permutations].sort()).toEqual(['abc', 'acb', 'bac', 'bca', 'cab', 'cba']);
		expect(random).toHaveBeenCalledTimes(12);
	});

	it('needs no entropy for an empty or single-painting collection', () => {
		const random = draws([]);
		expect(shuffled([])).toEqual([]);
		expect(shuffled(['only'])).toEqual(['only']);
		expect(random).not.toHaveBeenCalled();
	});
});
