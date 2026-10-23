<script lang="ts">
	import { onMount } from 'svelte';
	import { coverSizes, imageSet, imageSrc, type Painting } from './collection';
	import { NoiseDissolve, type DissolveClock } from './NoiseDissolve';
	let {
		collection,
		onchange
	}: {
		collection: Painting[];
		onchange: (painting: Painting, scene: number, clock?: DissolveClock) => void;
	} = $props();
	let surface: HTMLDivElement;
	let noiseCanvas: HTMLCanvasElement;

	onMount(() => {
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		const layers = Array.from(surface.querySelectorAll<HTMLElement>('.paint-layer'));
		const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]'));
		const ready = new Set<number>();
		const loading = new Set<number>();
		let centers: number[] = [];
		let disposed = false;
		let frame = 0;
		let focused = -1;
		let desired = 0;
		let target = 0;
		let revision = 0;
		let dissolve: NoiseDissolve | null | undefined;
		function renderer() {
			if (dissolve !== undefined) return dissolve;
			try {
				if (!('WebGLRenderingContext' in window)) return (dissolve = null);
				dissolve = new NoiseDissolve(noiseCanvas);
			} catch {
				dissolve = null;
				noiseCanvas.dataset.renderer = 'fallback';
			}
			return dissolve;
		}

		const paintingForScene = (scene: number) => scene % collection.length;
		function schedule() {
			if (!disposed && !frame) frame = requestAnimationFrame(update);
		}
		function load(index: number) {
			if (!layers[index] || loading.has(index)) return;
			loading.add(index);
			const img = layers[index].querySelector('img')!;
			layers[index].querySelector('source')!.srcset = imageSet(collection[index], 1600) || '';
			img.sizes = coverSizes(collection[index]);
			img.srcset = imageSet(collection[index]) || '';
			img.src = imageSrc(collection[index]);
			img
				.decode()
				.then(() => {
					ready.add(index);
					schedule();
				})
				.catch(() => {
					// Keep the current image when a new image cannot be decoded.
					loading.delete(index);
				});
		}
		function finish(next: number) {
			layers.forEach((layer, index) => {
				layer.style.visibility = index === next ? 'visible' : 'hidden';
				layer.style.opacity = index === next ? '1' : '0';
			});
		}
		function transition(scene: number) {
			const next = paintingForScene(scene);
			if (focused === scene || !ready.has(next)) return;
			focused = scene;
			if (next === target) {
				onchange(collection[next], scene);
				return;
			}
			const previous = target;
			target = next;
			const currentRevision = ++revision;
			if (media.matches) {
				dissolve?.cancel();
				finish(next);
				onchange(collection[next], scene);
				return;
			}
			try {
				if (
					renderer()?.play(
						layers[previous].querySelector('img')!,
						layers[next].querySelector('img')!,
						() => {
							if (!disposed && currentRevision === revision) finish(next);
						}
					)
				) {
					onchange(collection[next], scene, dissolve?.clock);
					return;
				}
			} catch {
				dissolve?.cancel();
			}
			// Without a GPU, switch to the decoded image directly; no CSS picture animation.
			finish(next);
			onchange(collection[next], scene);
		}

		function update() {
			frame = 0;
			const focusLine = scrollY + innerHeight * 0.48;
			let nearest = 0;
			centers.forEach((center, index) => {
				if (Math.abs(center - focusLine) < Math.abs(centers[nearest] - focusLine)) nearest = index;
			});
			desired = nearest;
			load(paintingForScene(desired));
			if (ready.has(paintingForScene(desired)) && desired + 1 < sections.length)
				load(paintingForScene(desired + 1));
			transition(desired);
		}
		function measure() {
			centers = sections.map((section) => {
				const card = section.querySelector('.sheet') || section;
				const bounds = card.getBoundingClientRect();
				return bounds.top + scrollY + bounds.height / 2;
			});
			schedule();
		}
		function motionChanged() {
			if (media.matches) {
				revision++;
				dissolve?.cancel();
				finish(target);
			}
			schedule();
		}
		load(0);

		onchange(collection[0], 0);
		measure();
		const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
		sections.forEach((section) => observer?.observe(section));
		document.fonts?.ready.then(() => {
			if (!disposed) measure();
		});
		window.addEventListener('scroll', schedule, { passive: true });
		window.addEventListener('resize', measure);
		media.addEventListener('change', motionChanged);
		return () => {
			disposed = true;
			cancelAnimationFrame(frame);
			dissolve?.destroy();
			observer?.disconnect();
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', measure);
			media.removeEventListener('change', motionChanged);
		};
	});
</script>

<div class="painted-world" aria-hidden="true" bind:this={surface}>
	{#each collection as painting, i (painting.id)}
		<div
			class="paint-layer"
			data-painting={painting.id}
			style:visibility={i === 0 ? 'visible' : 'hidden'}
			style:opacity={i === 0 ? 1 : 0}
		>
			<picture>
				<source
					media="(max-width: 760px)"
					srcset={i === 0 ? imageSet(painting, 1600) : undefined}
					sizes={coverSizes(painting)}
				/>
				<img
					src={i === 0 ? imageSrc(painting) : undefined}
					srcset={i === 0 ? imageSet(painting) : undefined}
					sizes={coverSizes(painting)}
					alt=""
					decoding="async"
					fetchpriority={i === 0 ? 'high' : 'low'}
					style:object-position={painting.position}
				/>
			</picture>
		</div>
	{/each}
	<canvas class="noise-dissolve" bind:this={noiseCanvas} data-active="false"></canvas>
	<div class="shade"></div>
</div>

<style>
	.painted-world {
		position: fixed;
		inset: 0;
		z-index: -1;
		background: #202225;
		overflow: hidden;
		pointer-events: none;
	}
	.paint-layer {
		position: absolute;
		inset: 0;
	}
	.paint-layer img {
		display: block;
		width: 100%;
		height: 100%;
		max-width: none;
		object-fit: cover;
	}
	.shade,
	.noise-dissolve {
		position: absolute;
		inset: 0;
	}
	.noise-dissolve {
		width: 100%;
		height: 100%;
		visibility: hidden;
	}
	.shade {
		background:
			linear-gradient(90deg, #12171910, #12171910 40%, #12171940),
			linear-gradient(0deg, #11171f55, transparent 35%);
	}
</style>
