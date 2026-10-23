<script lang="ts">
	import { imageSet, imageSrc, type Painting } from '$lib/art/collection';
	import type { PostPreview } from '$lib/posts';

	let {
		post,
		painting,
		lead = false,
		onselect
	}: {
		post: PostPreview;
		painting: Painting;
		lead?: boolean;
		onselect: () => void;
	} = $props();
	const dateFormat = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC'
	});
</script>

<article class="journal-card" class:lead>
	<a
		class="card story"
		href="/blog/{post.slug}"
		onmouseenter={onselect}
		onfocus={onselect}
		aria-labelledby="title-{post.slug}"
	>
		<div class="artwork">
			<img
				src={imageSrc(painting, lead ? 1200 : 800)}
				srcset={imageSet(painting)}
				sizes={lead
					? '(max-width: 760px) calc(100vw - 48px), (max-width: 1300px) 52vw, 650px'
					: '(max-width: 760px) calc(100vw - 48px), (max-width: 1300px) 46vw, 580px'}
				style:object-position={painting.position}
				loading={lead ? 'eager' : 'lazy'}
				fetchpriority={lead ? 'high' : 'auto'}
				decoding="async"
				width={painting.width}
				height={painting.height}
				alt=""
			/>
			{#if lead}<span class="latest">Latest entry</span>{/if}
		</div>
		<div class="story-body">
			<div class="metadata">
				<time datetime={post.metadata.date}>{dateFormat.format(new Date(post.metadata.date))}</time
				><span>{post.metadata.tags?.[0] ?? 'Essay'}</span>
			</div>
			<h2 id="title-{post.slug}">{post.metadata.title}</h2>
			{#if post.metadata.description}<p>{post.metadata.description}</p>{/if}
			<span class="read">Read entry <span aria-hidden="true">↗</span></span>
		</div>
	</a>
	<div class="art-caption">
		<span>{painting.artist}</span><a
			href={painting.source}
			target="_blank"
			rel="noreferrer"
			aria-label="Artwork: {painting.name} by {painting.artist}">{painting.name} ↗</a
		>
	</div>
</article>

<style>
	.journal-card {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.story {
		display: flex;
		flex-direction: column;
		flex: 1;
		padding: 0;
		border: 1px solid #77786d99;
		background: #202225;
		text-decoration: none;
		overflow: hidden;
	}
	.story:hover {
		background: #202225;
		color: var(--tx);
		border-color: #bbae8b;
	}
	.artwork {
		position: relative;
		overflow: hidden;
		aspect-ratio: 16/9;
		background: #303435;
	}
	.artwork::after {
		content: '';
		position: absolute;
		inset: 0;
		box-shadow: inset 0 0 0 1px #e5d5ae15;
		pointer-events: none;
	}
	.artwork img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		max-width: none;
		transition:
			transform 600ms ease,
			filter 300ms;
		filter: brightness(0.86) saturate(0.85);
	}
	.story:hover img,
	.story:focus-visible img {
		transform: scale(1.025);
		filter: brightness(1) saturate(1);
	}
	.latest {
		position: absolute;
		top: 20px;
		left: 20px;
		padding: 7px 10px;
		border: 1px solid #c9c0a355;
		background: #202225e8;
		font: 9px/1.5 var(--font-mono);
		color: #dfd9c9;
	}
	.story-body {
		display: flex;
		flex-direction: column;
		flex: 1;
		padding: 30px 32px;
	}
	.metadata {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px 16px;
		color: var(--tx-2);
		font: 9px/1.6 var(--font-mono);
	}
	.metadata > span {
		border-left: 1px solid #77786d;
		padding-left: 16px;
		text-transform: capitalize;
	}
	.story h2 {
		font: 38px/1.08 var(--font-serif);
		margin: 18px 0 16px;
		text-wrap: balance;
	}
	.story:hover h2,
	.story:focus-visible h2 {
		color: #e7d6ac;
	}
	.story p {
		font: 19px/1.55 var(--font-body);
		color: #bdbcae;
		margin: 0 0 24px;
		max-width: 48ch;
	}
	.read {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 24px;
		margin-top: auto;
		padding-top: 18px;
		border-top: 1px solid #77786d55;
		color: var(--cy);
		font: 9px/1.5 var(--font-mono);
	}
	.read > span {
		font-size: 17px;
	}
	.art-caption {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 8px 20px;
		padding: 10px 0;
		font: 8px/1.7 var(--font-mono);
		color: #aaa99d;
	}
	.art-caption > span {
		flex-shrink: 0;
	}
	.art-caption a {
		text-align: right;
		text-decoration: none;
	}
	.art-caption a:hover {
		text-decoration: underline;
	}
	.lead {
		grid-column: 1/-1;
	}
	.lead .story {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		min-height: 420px;
	}
	.lead .artwork {
		aspect-ratio: auto;
		min-height: 100%;
	}
	.lead .artwork img {
		position: absolute;
		inset: 0;
	}
	.lead .story-body {
		padding: 42px;
	}
	.lead h2 {
		font-size: clamp(40px, 4vw, 56px);
		margin: 24px 0;
	}
	@media (min-width: 761px) {
		.journal-card:last-child:nth-child(even):not(.lead) {
			grid-column: 1/-1;
		}
		.journal-card:last-child:nth-child(even):not(.lead) .story {
			display: grid;
			grid-template-columns: 1fr 1fr;
		}
		.journal-card:last-child:nth-child(even):not(.lead) .artwork img {
			position: absolute;
			inset: 0;
		}
		.journal-card:last-child:nth-child(even):not(.lead) .artwork {
			aspect-ratio: auto;
			min-height: 300px;
		}
	}
	@media (max-width: 1000px) {
		.lead .story-body {
			padding: 30px;
		}
		.lead .story {
			grid-template-columns: 1fr 1fr;
		}
		.art-caption {
			flex-wrap: wrap;
			gap: 0 12px;
		}
		.art-caption a {
			text-align: left;
		}
	}
	@media (max-width: 760px) {
		.lead .story {
			display: flex;
			min-height: 0;
		}
		.lead .artwork {
			aspect-ratio: 4/3;
			min-height: 0;
		}
		.story-body,
		.lead .story-body {
			padding: 26px;
		}
		.story h2,
		.lead h2 {
			font-size: 36px;
			margin: 18px 0;
		}
		.art-caption {
			font-size: 8px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.artwork img {
			transition: none;
		}
		.story:hover img,
		.story:focus-visible img {
			transform: none;
		}
	}
</style>
