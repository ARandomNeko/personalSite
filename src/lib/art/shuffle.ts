// Fisher–Yates with a seeded 32-bit generator. The server sends its fresh seed
// with the page so SSR, hydration, and later selection updates use one order.
export function shuffled<T>(items: readonly T[], seed: number): T[] {
	const result = [...items];
	let state = seed >>> 0;
	const next = () => {
		state = (state + 0x9e3779b9) >>> 0;
		let value = state;
		value = Math.imul(value ^ (value >>> 16), 0x21f0aaad);
		value = Math.imul(value ^ (value >>> 15), 0x735a2d97);
		return (value ^ (value >>> 15)) >>> 0;
	};
	for (let index = result.length - 1; index > 0; index--) {
		const range = index + 1;
		const limit = Math.floor(0x100000000 / range) * range;
		let random = next();
		while (random >= limit) random = next();
		const other = random % range;
		[result[index], result[other]] = [result[other], result[index]];
	}
	return result;
}
