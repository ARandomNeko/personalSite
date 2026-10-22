export type CardRect = { left: number; top: number; width: number; height: number };

export function unionRect(a: CardRect, b: CardRect): CardRect {
	const left = Math.min(a.left, b.left);
	const top = Math.min(a.top, b.top);
	return {
		left,
		top,
		width: Math.max(a.left + a.width, b.left + b.width) - left,
		height: Math.max(a.top + a.height, b.top + b.height) - top
	};
}

// CSS has a top-left origin; the GPU uses a bottom-left origin. Preserve the
// original pixel scale to avoid stretching/resampling the card typography.
export function textureBounds(rect: CardRect, surface: CardRect): [number, number, number, number] {
	return [
		(rect.left - surface.left) / surface.width,
		(surface.top + surface.height - rect.top - rect.height) / surface.height,
		rect.width / surface.width,
		rect.height / surface.height
	];
}
