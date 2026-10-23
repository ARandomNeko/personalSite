import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({
	executablePath: process.env.CHROMIUM_PATH,
	args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader']
});
const results = [];
for (const path of [
	'/',
	'/blog',
	'/projects',
	'/reading',
	'/resume',
	'/blog/rl-ppo-drone-sandbox'
]) {
	const context = await browser.newContext({
		viewport: { width: 390, height: 844 },
		deviceScaleFactor: 2
	});
	const page = await context.newPage();
	const cdp = await context.newCDPSession(page);
	await cdp.send('Network.enable');
	await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
	await cdp.send('Network.emulateNetworkConditions', {
		offline: false,
		latency: 80,
		downloadThroughput: 200000,
		uploadThroughput: 100000
	});
	await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
	await page.addInitScript(() => {
		window.perfData = { lcp: 0, cls: 0, longTasks: [] };
		new PerformanceObserver((list) => {
			for (const e of list.getEntries()) window.perfData.lcp = e.startTime;
		}).observe({ type: 'largest-contentful-paint', buffered: true });
		new PerformanceObserver((list) => {
			for (const e of list.getEntries()) if (!e.hadRecentInput) window.perfData.cls += e.value;
		}).observe({ type: 'layout-shift', buffered: true });
		new PerformanceObserver((list) => {
			for (const e of list.getEntries()) window.perfData.longTasks.push(e.duration);
		}).observe({ type: 'longtask', buffered: true });
	});
	await page.goto((process.env.PERF_BASE_URL || 'http://127.0.0.1:4173') + path, {
		waitUntil: 'networkidle',
		timeout: 60000
	});
	await page.waitForTimeout(1000);
	results.push(
		await page.evaluate(
			(path) => ({
				path,
				...window.perfData,
				ttfb: performance.getEntriesByType('navigation')[0].responseStart,
				resources: performance
					.getEntriesByType('resource')
					.map((e) => ({
						name: new URL(e.name).pathname,
						bytes: e.encodedBodySize,
						type: e.initiatorType,
						duration: e.duration
					})),
				heap: performance.memory?.usedJSHeapSize
			}),
			path
		)
	);
	await context.close();
}
await browser.close();
const output = process.argv[2] ?? '/tmp/personal-site-performance.json';
await writeFile(output, JSON.stringify(results, null, 2));
for (const r of results)
	console.log(
		JSON.stringify({
			path: r.path,
			lcp: Math.round(r.lcp),
			cls: r.cls,
			requests: r.resources.length,
			bytes: r.resources.reduce((s, e) => s + e.bytes, 0),
			js: r.resources.filter((e) => e.name.endsWith('.js')).reduce((s, e) => s + e.bytes, 0),
			longTasks: r.longTasks.length,
			longTaskMs: Math.round(r.longTasks.reduce((s, e) => s + e, 0)),
			largest: r.resources
				.sort((a, b) => b.bytes - a.bytes)
				.slice(0, 5)
				.map((e) => ({ name: e.name, bytes: e.bytes }))
		})
	);
