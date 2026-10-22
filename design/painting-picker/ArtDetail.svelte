<script lang="ts">
	import { imageSrc, type Painting } from './collection';
	let { painting }: { painting: Painting } = $props();
	let x = $state(0.5),
		y = $state(0.5);
	let originalFailed = $state(false);
	const width = $derived(painting.sourceWidth || painting.width || 1);
	const height = $derived(painting.sourceHeight || painting.height || 1);
	const regionWidth = $derived(Math.min(1200, width));
	const regionHeight = $derived(Math.min(1200, height));
	const originX = $derived(
		Math.round(Math.max(0, Math.min(width - regionWidth, x * width - regionWidth / 2)))
	);
	const originY = $derived(
		Math.round(Math.max(0, Math.min(height - regionHeight, y * height - regionHeight / 2)))
	);
	const iiif = $derived(
		painting.original.includes('/iiif/') ? painting.original.split('/full/')[0] : null
	);
	const detail = $derived(
		iiif
			? `${iiif}/${originX},${originY},${regionWidth},${regionHeight}/full/0/default.jpg`
			: painting.original
	);
	function select(event: MouseEvent) {
		const image = event.currentTarget as HTMLButtonElement;
		const rect = image.getBoundingClientRect();
		const ratio = width / height;
		const drawnWidth = Math.min(rect.width, rect.height * ratio),
			drawnHeight = drawnWidth / ratio;
		x = Math.max(
			0,
			Math.min(1, (event.clientX - rect.left - (rect.width - drawnWidth) / 2) / drawnWidth)
		);
		y = Math.max(
			0,
			Math.min(1, (event.clientY - rect.top - (rect.height - drawnHeight) / 2) / drawnHeight)
		);
	}
</script>

<div class="detail-view">
	<div class="overview">
		<button onclick={select} aria-label="Choose an area of the painting to inspect"
			><img src={imageSrc(painting, 1600)} alt={painting.name} /></button
		>
		<p>Click an area to inspect its brushwork.</p>
		<div class="pan">
			<button
				onclick={() => (x = Math.max(0, x - regionWidth / width / 2))}
				aria-label="Inspect further left">←</button
			><button
				onclick={() => (y = Math.max(0, y - regionHeight / height / 2))}
				aria-label="Inspect higher">↑</button
			><button
				onclick={() => (y = Math.min(1, y + regionHeight / height / 2))}
				aria-label="Inspect lower">↓</button
			><button
				onclick={() => (x = Math.min(1, x + regionWidth / width / 2))}
				aria-label="Inspect further right">→</button
			>
		</div>
	</div>
	<div class="detail-image">
		<img
			src={originalFailed ? imageSrc(painting, Infinity) : detail}
			class:full-original={!iiif || originalFailed}
			style:object-position={`${x * 100}% ${y * 100}%`}
			alt={`Detail of ${painting.name}`}
			onerror={() => (originalFailed = true)}
		/>
		<p>
			{originalFailed
				? 'Largest local image; the original is temporarily unavailable.'
				: iiif
					? 'Original pixels, loaded only for this area.'
					: 'Original pixels. Click or use the arrows to explore.'}
		</p>
	</div>
</div>

<style>
	.detail-view {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
		width: 100%;
		height: 100%;
		align-items: center;
	}
	.overview,
	.detail-image {
		min-width: 0;
	}
	.overview > button {
		width: 100%;
		height: 43dvh;
		border: 0;
		padding: 0;
		background: transparent;
		cursor: crosshair;
	}
	img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.detail-image > img {
		height: 49dvh;
	}
	.detail-image > img.full-original {
		object-fit: none;
	}
	p {
		font:
			10px/1.8 'JetBrains Mono',
			monospace;
		color: #b3b4a8;
		text-align: center;
		margin: 10px 0 0;
	}
	.pan {
		display: flex;
		justify-content: center;
		gap: 7px;
		margin-top: 10px;
	}
	.pan button {
		background: #303638;
		border: 1px solid #77786d;
		color: #dfd9c9;
		padding: 5px 13px;
		cursor: pointer;
	}
	@media (max-width: 700px) {
		.detail-view {
			gap: 10px;
		}
		.overview > button {
			height: 27dvh;
		}
		.detail-image > img {
			height: 32dvh;
		}
		.pan {
			gap: 4px;
		}
		.pan button {
			padding: 3px 9px;
		}
		p {
			font-size: 9px;
		}
	}
</style>
