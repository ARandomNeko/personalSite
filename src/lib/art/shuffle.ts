// Fisher–Yates draws fresh OS-backed entropy for every swap. Reject the uneven
// tail of uint32's range so modulo reduction gives every index equal probability.
// Send the resulting IDs to the browser, keeping SSR and hydration in one order.
export function shuffled<T>(items: readonly T[]): T[] {
	const result = [...items];
	const draw = new Uint32Array(1);
	for (let index = result.length - 1; index > 0; index--) {
		const range = index + 1;
		const limit = Math.floor(0x100000000 / range) * range;
		let random: number;
		do {
			random = crypto.getRandomValues(draw)[0];
		} while (random >= limit);
		const other = random % range;
		[result[index], result[other]] = [result[other], result[index]];
	}
	return result;
}
