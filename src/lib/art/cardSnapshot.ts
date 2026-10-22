// Rasterize this small text-only panel with the browser's own HTML layout and
// font rasterizer. No screenshot dependency or hand-maintained canvas typography.
let fontStyles: Promise<string> | undefined;

function embeddedFonts() {
	return (fontStyles ??= Promise.all(
		[
			['Instrument Serif', 'InstrumentSerif-Regular.ttf', 'truetype'],
			['JetBrains Mono', 'JetBrainsMono-Regular.ttf', 'truetype'],
			['ET Bembo', 'ETBembo-Regular.woff', 'woff']
		].map(async ([family, file, format]) => {
			const response = await fetch(`/fonts/${file}`);
			if (!response.ok) throw new Error('Card font unavailable');
			const blob = await response.blob();
			const url = await new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(String(reader.result));
				reader.onerror = reject;
				reader.readAsDataURL(blob);
			});
			return `@font-face { font-family: '${family}'; src: url('${url}') format('${format}'); }`;
		})
	).then((rules) => rules.join('\n')));
}

export async function snapshotCard(
	card: HTMLElement,
	onlayout?: (rect: DOMRect) => void
): Promise<HTMLCanvasElement> {
	if (!document.fonts) throw new Error('Font loading API unavailable');
	const [fonts] = await Promise.all([embeddedFonts(), document.fonts.ready]);
	const bounds = card.getBoundingClientRect();
	onlayout?.(bounds);
	const clone = card.cloneNode(true) as HTMLElement;
	clone.querySelectorAll('canvas').forEach((canvas) => canvas.remove());
	const sources = [card, ...card.querySelectorAll<HTMLElement>(':not(canvas)')];
	const copies = [clone, ...clone.querySelectorAll<HTMLElement>('*')];
	sources.forEach((source, index) => {
		const computed = getComputedStyle(source);
		const copy = copies[index];
		for (const property of computed)
			copy.style.setProperty(property, computed.getPropertyValue(property));
		copy.style.transition = 'none';
		copy.style.animation = 'none';
		copy.removeAttribute('id');
		if (source.classList.contains('side-card-content')) copy.style.opacity = '1';
	});
	Object.assign(clone.style, {
		position: 'static',
		margin: '0',
		transform: 'none',
		opacity: '1',
		width: `${bounds.width}px`,
		height: `${bounds.height}px`
	});
	const style = document.createElement('style');
	style.textContent = fonts;
	clone.prepend(style);
	const html = new XMLSerializer().serializeToString(clone);
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${bounds.width}" height="${bounds.height}"><foreignObject width="100%" height="100%">${html}</foreignObject></svg>`;
	const image = new Image();
	image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
	await image.decode();
	const canvas = document.createElement('canvas');
	const scale = devicePixelRatio || 1;
	canvas.width = Math.max(1, Math.round(bounds.width * scale));
	canvas.height = Math.max(1, Math.round(bounds.height * scale));
	const context = canvas.getContext('2d')!;
	context.drawImage(image, 0, 0, canvas.width, canvas.height);
	return canvas;
}
