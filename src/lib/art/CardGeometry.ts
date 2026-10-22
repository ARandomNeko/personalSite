export type CardRect = { left: number; top: number; width: number; height: number };

// Keep the native subpixel origin and leave a clear pixel beyond every border.
// Fractional SVG viewport sizes can otherwise truncate the right/bottom edges.
export function snapshotRect(rect: CardRect, scale: number): CardRect {
	const left = Math.floor(rect.left * scale) - 1;
	const top = Math.floor(rect.top * scale) - 1;
	const right = Math.ceil((rect.left + rect.width) * scale) + 1;
	const bottom = Math.ceil((rect.top + rect.height) * scale) + 1;
	return {
		left: left / scale,
		top: top / scale,
		width: (right - left) / scale,
		height: (bottom - top) / scale
	};
}

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
