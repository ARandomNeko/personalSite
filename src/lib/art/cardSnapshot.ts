// Rasterize this small text-only panel with the browser's own HTML layout and
// font rasterizer. No screenshot dependency or hand-maintained canvas typography.
import { bodyFont, headingFont, monoFont } from '#lib/fonts.js';
import { snapshotRect, type CardRect } from './CardGeometry';

// These panels contain text, links, and flex rows. Copy the properties that
// determine their pixels, rather than serializing every CSS property and every
// Tailwind custom variable onto each node in each SVG snapshot.
const snapshotProperties = `
 display position top right bottom left box-sizing width height min-width min-height max-width max-height
 margin-top margin-right margin-bottom margin-left padding-top padding-right padding-bottom padding-left
 border-top-width border-right-width border-bottom-width border-left-width
 border-top-style border-right-style border-bottom-style border-left-style
 border-top-color border-right-color border-bottom-color border-left-color border-radius
 background-color background-image background-size background-position background-repeat box-shadow
 color opacity visibility overflow-x overflow-y transform transform-origin
 flex-direction flex-wrap flex-grow flex-shrink flex-basis justify-content align-items align-content align-self order row-gap column-gap
 font-family font-size font-weight font-style font-stretch font-variant font-feature-settings font-kerning
 font-variation-settings font-optical-sizing font-synthesis line-height letter-spacing word-spacing
 white-space text-align text-indent text-transform text-decoration-line text-decoration-style text-decoration-color
 text-decoration-thickness text-underline-offset text-rendering direction unicode-bidi overflow-wrap word-break hyphens
`
	.trim()
	.split(/\s+/);

let fontStyles: Promise<string> | undefined;

function embeddedFonts() {
	return (fontStyles ??= Promise.all(
		[
			['Instrument Serif', headingFont],
			['JetBrains Mono', monoFont],
			['ET Bembo', bodyFont]
		].map(async ([family, file]) => {
			const response = await fetch(file);
			if (!response.ok) throw new Error('Card font unavailable');
			const blob = await response.blob();
			const url = await new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(String(reader.result));
				reader.onerror = reject;
				reader.readAsDataURL(blob);
			});
			return `@font-face { font-family: '${family}'; src: url('${url}') format('woff2'); }`;
		})
	).then((rules) => rules.join('\n')));
}

export async function snapshotCard(
	card: HTMLElement,
	onlayout?: (rect: CardRect) => void
): Promise<HTMLCanvasElement> {
	if (!document.fonts) throw new Error('Font loading API unavailable');
	const [fonts] = await Promise.all([embeddedFonts(), document.fonts.ready]);
	const bounds = card.getBoundingClientRect();
	const scale = devicePixelRatio || 1;
	const surface = snapshotRect(bounds, scale);
	onlayout?.(surface);
	const clone = card.cloneNode(true) as HTMLElement;
	clone.querySelectorAll('canvas').forEach((canvas) => canvas.remove());
	const sources = [card, ...card.querySelectorAll<HTMLElement>(':not(canvas)')];
	const copies = [clone, ...clone.querySelectorAll<HTMLElement>('*')];
	sources.forEach((source, index) => {
		const computed = getComputedStyle(source);
		const copy = copies[index];
		for (const property of snapshotProperties)
			copy.style.setProperty(property, computed.getPropertyValue(property));
		copy.style.transition = 'none';
		copy.style.animation = 'none';
		copy.removeAttribute('id');
		if (source.classList.contains('side-card-content')) copy.style.opacity = '1';
	});
	Object.assign(clone.style, {
		position: 'absolute',
		left: `${bounds.left - surface.left}px`,
		top: `${bounds.top - surface.top}px`,
		right: 'auto',
		bottom: 'auto',
		margin: '0',
		transform: 'none',
		opacity: '1',
		width: `${bounds.width}px`,
		height: `${bounds.height}px`,
		inlineSize: `${bounds.width}px`,
		blockSize: `${bounds.height}px`,
		boxSizing: 'border-box',
		background: 'transparent',
		borderColor: 'transparent',
		boxShadow: 'none'
	});
	// Remove the frame entirely, including copied logical border declarations.
	// Fold its widths into padding so the text retains its native coordinates.
	const computed = getComputedStyle(card);
	clone.style.setProperty('border', 'none', 'important');
	clone.style.setProperty('background', 'transparent', 'important');
	clone.style.setProperty('box-shadow', 'none', 'important');
	for (const side of ['top', 'right', 'bottom', 'left']) {
		const padding = parseFloat(computed.getPropertyValue(`padding-${side}`));
		const border = parseFloat(computed.getPropertyValue(`border-${side}-width`));
		clone.style.setProperty(`padding-${side}`, `${padding + border}px`, 'important');
	}
	const style = document.createElement('style');
	style.textContent = fonts;
	clone.prepend(style);
	const html = new XMLSerializer().serializeToString(clone);
	const width = Math.max(1, Math.round(surface.width * scale));
	const height = Math.max(1, Math.round(surface.height * scale));
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${surface.width} ${surface.height}"><foreignObject width="100%" height="100%">${html}</foreignObject></svg>`;
	const image = new Image();
	image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
	await image.decode();
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext('2d')!;
	context.drawImage(image, 0, 0, canvas.width, canvas.height);
	return canvas;
}
