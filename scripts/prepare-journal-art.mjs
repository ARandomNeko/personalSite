// Bake the fixed Bayer treatment once. The live page only composites images.
import { chromium } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';
const browser = await chromium.launch({
	executablePath: process.env.CHROMIUM_PATH,
	args: ['--no-sandbox']
});
try {
	const page = await browser.newPage();
	const sources = [
		['static/paintings/turner-moonlight.jpg', 'turner-moonlight'],
		['design/paintings/bocklin-island.jpg', 'bocklin-island'],
		['design/paintings/martin-wrath.jpg', 'martin-wrath'],
		['design/moodboard/assets/monet-etretat-sunset.jpg', 'monet-sunset']
	];
	for (const [file, name] of sources) {
		const input = `data:image/jpeg;base64,${(await readFile(file)).toString('base64')}`;
		const result = await page.evaluate(async (src) => {
			const img = new Image();
			img.src = src;
			await img.decode();
			const canvas = document.createElement('canvas');
			canvas.width = 800;
			canvas.height = Math.round((800 * img.height) / img.width);
			const ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
			const palette = [
				[20, 26, 31],
				[71, 75, 75],
				[145, 143, 119],
				[222, 210, 169]
			];
			for (let y = 0; y < canvas.height; y++)
				for (let x = 0; x < canvas.width; x++) {
					const i = (y * canvas.width + x) * 4;
					const luminance =
						(data.data[i] * 0.2126 + data.data[i + 1] * 0.7152 + data.data[i + 2] * 0.0722) / 255;
					const threshold = (bayer[(y % 4) * 4 + (x % 4)] / 16 - 0.5) * 0.32;
					const level = Math.max(0, Math.min(3, Math.round((luminance + threshold) * 3)));
					data.data[i] = palette[level][0];
					data.data[i + 1] = palette[level][1];
					data.data[i + 2] = palette[level][2];
				}
			ctx.putImageData(data, 0, 0);
			return canvas.toDataURL('image/webp', 0.94).split(',')[1];
		}, input);
		await writeFile(`design/paintings/${name}-dither.webp`, Buffer.from(result, 'base64'));
		console.log(`Prepared ${name}`);
	}
} finally {
	await browser.close();
}
