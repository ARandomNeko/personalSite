<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { coverSizes, imageSet, imageSrc, type Painting } from './collection';
	import { NoiseDissolve } from './NoiseDissolve';
	let { painting }: { painting: Painting } = $props();
	let displayed = $state(untrack(() => painting));
	let mounted = $state(false);
	let canvas: HTMLCanvasElement;
	let renderer: NoiseDissolve | undefined;
	let previous: HTMLImageElement | undefined;
	onMount(() => {
		mounted = true;
		const media = matchMedia('(prefers-reduced-motion: reduce)');
		const cancel = () => {
			if (media.matches) renderer?.cancel();
		};
		media.addEventListener('change', cancel);
		return () => {
			media.removeEventListener('change', cancel);
			renderer?.destroy();
		};
	});
	$effect(() => {
		const target = painting;
		if (!mounted) return;
		let stale = false;
		const next = new Image();
		next.sizes = coverSizes(target);
		next.srcset = imageSet(target) || '';
		next.src = imageSrc(target);
		next.style.objectPosition = target.position;
		void next
			.decode()
			.then(() => {
				if (stale) return;
				if (previous && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
					try {
						renderer ??= new NoiseDissolve(canvas);
						renderer.play(previous, next, () => {});
					} catch {
						renderer?.cancel();
					}
				} else renderer?.cancel();
				displayed = target;
				previous = next;
			})
			.catch(() => {
				// Retain the decoded background when the next image cannot load.
			});
		return () => {
			stale = true;
		};
	});
</script>

<div class="library-backdrop" aria-hidden="true">
	<img
		src={imageSrc(displayed)}
		srcset={imageSet(displayed)}
		sizes={coverSizes(displayed)}
		style:object-position={displayed.position}
		alt=""
	/>
	<canvas bind:this={canvas} data-active="false"></canvas>
	<div class="shade"></div>
</div>

<style>
	.library-backdrop {
		position: fixed;
		inset: 0;
		z-index: -1;
		background: #202225;
		pointer-events: none;
		overflow: hidden;
	}
	img,
	canvas,
	.shade {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	img {
		object-fit: cover;
	}
	canvas {
		visibility: hidden;
	}
	.shade {
		background:
			linear-gradient(90deg, #101715e8, #101715a6 58%, #10171540),
			linear-gradient(0deg, #101715a6, transparent 35%);
	}
	@media (max-width: 760px) {
		.shade {
			background: #101715b8;
		}
	}
</style>
