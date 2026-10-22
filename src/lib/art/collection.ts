import catalogue from './catalogue.json';
import selectedIds from './selection.json';

export type Painting = {
	id: string;
	name: string;
	artist: string;
	year: string;
	style: string;
	category: string;
	medium: string;
	source: string;
	original: string;
	museum: string;
	position: string;
	license?: string;
	licenseUrl?: string;
	imageCredit?: string;
	width?: number;
	height?: number;
	sourceWidth?: number;
	sourceHeight?: number;
	variants?: { width: number; src: string; bytes: number }[];
	thumb?: string;
};
export const paintings: Painting[] = catalogue;
export const defaultIds = selectedIds;
export function resolvePaintings(ids: string[]) {
	return [...new Set(ids)]
		.map((id) => paintings.find((p) => p.id === id))
		.filter((p): p is Painting => Boolean(p));
}
export const defaultPaintings = resolvePaintings(defaultIds);
export function imageSrc(p: Painting, target = 1600) {
	return p.variants?.find((v) => v.width >= target)?.src || p.variants?.at(-1)?.src || p.original;
}
export function imageSet(p: Painting) {
	return p.variants?.map((v) => `${v.src} ${v.width}w`).join(', ');
}
// Cover images may need more than 100vw when a portrait is cropped into a wide viewport.
export function coverSizes(p: Painting) {
	const ratio = (p.width || 4) / (p.height || 3);
	return `(max-aspect-ratio: ${p.width || 4}/${p.height || 3}) ${Math.ceil(106 * ratio)}vh, 100vw`;
}
