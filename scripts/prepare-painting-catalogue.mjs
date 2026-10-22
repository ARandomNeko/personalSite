// Museum originals are fetched separately. Generate real responsive images, never upscale.
// Usage: CHROMIUM_PATH=... node scripts/prepare-painting-catalogue.mjs /tmp/catalogue-source.json /tmp/painting-masters
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const [manifest, directory, mode] = process.argv.slice(2);
if (!manifest || !directory)
	throw new Error('Provide a museum manifest and a directory of downloaded JPEG masters.');
const entries = JSON.parse(await readFile(manifest, 'utf8'));
const selectedIds = JSON.parse(await readFile('src/lib/art/selection.json', 'utf8'));
const existing =
	mode === '--append' ? JSON.parse(await readFile('design/catalogue.json', 'utf8')) : [];
if (entries.some((entry) => existing.some((saved) => saved.id === entry.id))) {
	throw new Error('Append would replace an existing artwork ID. Use new, stable IDs.');
}
const browser = await chromium.launch({
	executablePath: process.env.CHROMIUM_PATH,
	args: ['--no-sandbox']
});
try {
	const page = await browser.newPage();
	const results = [...existing];
	for (const item of entries) {
		const output = `${selectedIds.includes(item.id) ? 'static' : 'design'}/paintings/catalogue`;
		await mkdir(output, { recursive: true });
		const input = `data:image/jpeg;base64,${(await readFile(`${directory}/${item.id}.jpg`)).toString('base64')}`;
		const result = await page.evaluate(async (src) => {
			const img = new Image();
			img.src = src;
			await img.decode();
			const widths = [
				...new Set([480, 1600, 3200, 5120].map((w) => Math.min(w, img.naturalWidth)))
			];
			const variants = [];
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			for (const width of widths) {
				canvas.width = width;
				canvas.height = Math.round((width * img.naturalHeight) / img.naturalWidth);
				ctx.imageSmoothingQuality = 'high';
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
				variants.push({
					width,
					data: canvas.toDataURL('image/webp', width <= 480 ? 0.82 : 0.9).split(',')[1]
				});
			}
			return { width: img.naturalWidth, height: img.naturalHeight, variants };
		}, input);
		const variants = [];
		for (const v of result.variants) {
			const data = Buffer.from(v.data, 'base64');
			const hash = createHash('sha256').update(data).digest('hex').slice(0, 12);
			const name = `${item.id}-${v.width}-${hash}.webp`;
			await writeFile(`${output}/${name}`, data);
			variants.push({ width: v.width, src: `/paintings/catalogue/${name}`, bytes: data.length });
		}
		const { download, ...credit } = item;
		results.push({
			...credit,
			sourceWidth: item.sourceWidth || result.width,
			sourceHeight: item.sourceHeight || result.height,
			width: result.width,
			height: result.height,
			thumb: variants[0].src,
			variants
		});
		console.log(
			`${item.id}: ${result.width} × ${result.height}; largest ${(variants.at(-1).bytes / 1024).toFixed(0)} KB`
		);
	}
	await writeFile('design/catalogue.json', JSON.stringify(results, null, 2) + '\n');
	await writeFile(
		'src/lib/art/catalogue.json',
		JSON.stringify(
			results.filter((item) => selectedIds.includes(item.id)),
			null,
			2
		) + '\n'
	);
} finally {
	await browser.close();
}
