export type QuadtreeTiming = {
	rootSize: number;
	stages: number[];
	duration: number;
	boundaries: number[];
	velocities: number[];
};

// Budget real time for the fine leaves instead of easing through every depth at
// one speed. More display pixels get a little more time, within a fixed bound.
export function quadtreeTiming(width: number, height: number): QuadtreeTiming {
	const rootSize = Math.min(256, 2 ** Math.ceil(Math.log2(Math.max(2, width, height))));
	const depth = Math.log2(rootSize);
	let remaining = 1;
	for (let level = 1; level < depth; level++) {
		remaining *= 1 - Math.min(0.75, 0.02 + 0.01 * level * level);
	}
	// Expected unresolved population, not a synchronous GPU readback during scroll.
	const detail = Math.max(0, Math.log2(Math.max(1, (width * height * remaining) / 32768)));
	const stages = Array.from({ length: depth }, (_, index) => {
		const level = index + 1;
		if (level === depth) return 480 + Math.min(300, detail * 70);
		if (level === depth - 1) return 260 + Math.min(120, detail * 35);
		if (level === 1) return 220;
		if (level === 2) return 160;
		if (level === 3) return 170;
		return 80 + level * 25;
	});
	const boundaries = [0];
	for (const stage of stages) boundaries.push(boundaries.at(-1)! + stage);
	// A monotone cubic Hermite curve through the depth boundaries. Weighted
	// harmonic tangents preserve order while matching velocity between stages.
	// Zero endpoint tangents let the reveal accelerate out of rest and settle.
	const velocities = [0];
	for (let index = 1; index < stages.length; index++) {
		const before = stages[index - 1];
		const after = stages[index];
		const w1 = 2 * after + before;
		const w2 = after + 2 * before;
		velocities.push((w1 + w2) / (w1 * before * depth + w2 * after * depth));
	}
	velocities.push(0);
	return { rootSize, stages, duration: boundaries.at(-1)!, boundaries, velocities };
}

export function quadtreeCursor(progress: number, timing: QuadtreeTiming): number {
	if (progress >= 1) return 1;
	const elapsed = Math.max(0, progress * timing.duration);
	for (let index = 0; index < timing.stages.length; index++) {
		const duration = timing.stages[index];
		if (elapsed < timing.boundaries[index + 1]) {
			const t = (elapsed - timing.boundaries[index]) / duration;
			const start = index / timing.stages.length;
			const end = (index + 1) / timing.stages.length;
			const h00 = (2 * t - 3) * t * t + 1;
			const h10 = ((t - 2) * t + 1) * t;
			const h01 = (-2 * t + 3) * t * t;
			const h11 = (t - 1) * t * t;
			return (
				h00 * start +
				h10 * duration * timing.velocities[index] +
				h01 * end +
				h11 * duration * timing.velocities[index + 1]
			);
		}
	}
	return 1;
}
