<script lang="ts">
	import { resolve } from '$app/paths';
	import { untrack } from 'svelte';
	import type { PostPreview } from '#lib/posts.js';
	import JournalCard from '#lib/components/JournalCard.svelte';
	import LibraryBackdrop from '#lib/art/LibraryBackdrop.svelte';
	import { paintingForPost } from '#lib/art/postPaintings.js';

	let { posts, projectOnly = false }: { posts: PostPreview[]; projectOnly?: boolean } = $props();
	let selected = $state(untrack(() => posts[0]?.slug ?? ''));
	const painting = $derived(paintingForPost(selected));
</script>

<LibraryBackdrop {painting} />
<section class="journal" aria-labelledby="journal-title">
	<header class="journal-heading">
		<div>
			<p class="eyebrow">Experiments / Field notes / Occasional thoughts</p>
			<h1 id="journal-title">The journal<span>.</span></h1>
		</div>
		<p class="intro">Things I've built,<br />and what I learned along the way.</p>
	</header>
	<nav class="journal-filters" aria-label="Journal filters">
		<a href={resolve('/blog')} aria-current={!projectOnly ? 'page' : undefined}>All entries</a>
		<a href={resolve('/projects')} aria-current={projectOnly ? 'page' : undefined}>Projects</a>
		<span>{posts.length} {posts.length === 1 ? 'entry' : 'entries'}</span>
	</nav>
	{#if posts.length}
		<div class="journal-grid">
			{#each posts as post, i (post.slug)}
				<JournalCard
					{post}
					painting={paintingForPost(post.slug)}
					lead={i === 0}
					onselect={() => (selected = post.slug)}
				/>
			{/each}
		</div>
	{:else}
		<p class="empty">Nothing here yet. More soon.</p>
	{/if}
</section>

<style>
	.journal {
		width: min(1180px, calc(100% - 100px));
		margin: 64px auto 80px;
	}
	.journal-heading {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 24px;
		margin-bottom: 32px;
	}
	.eyebrow {
		font: 9px/1.8 var(--font-mono);
		color: #b4b5a6;
		margin: 0 0 20px;
	}
	h1 {
		font: clamp(64px, 7vw, 96px) / 1 var(--font-serif);
		letter-spacing: -0.025em;
		margin: 0;
	}
	h1 span {
		color: var(--cy);
	}
	.intro {
		margin: 0 0 5px;
		color: #c2c2b4;
		font: 20px/1.5 var(--font-body);
	}
	.journal-filters {
		display: flex;
		align-items: center;
		gap: 24px;
		margin-bottom: 32px;
		padding: 14px 0;
		border-block: 1px solid #77786d88;
		font: 10px/1.8 var(--font-mono);
	}
	.journal-filters a {
		color: var(--tx-2);
		text-decoration: none;
	}
	.journal-filters a[aria-current] {
		color: var(--cy);
		text-decoration: underline;
		text-underline-offset: 6px;
	}
	.journal-filters span {
		margin-left: auto;
		color: var(--tx-2);
		font-size: 9px;
	}
	.journal-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 42px 32px;
	}
	.empty {
		padding: 40px 0;
		color: var(--tx-2);
	}
	@media (max-width: 1000px) {
		.journal {
			width: calc(100% - 72px);
		}
		.journal-grid {
			gap: 30px 24px;
		}
	}
	@media (max-width: 760px) {
		.journal {
			width: calc(100% - 48px);
			margin: 42px auto 50px;
		}
		.journal-heading {
			display: block;
			margin-bottom: 32px;
		}
		h1 {
			font-size: 68px;
		}
		.eyebrow {
			max-width: 30ch;
			font-size: 8px;
			margin-bottom: 20px;
		}
		.intro {
			margin: 24px 0 0;
			font-size: 19px;
		}
		.journal-grid {
			grid-template-columns: 1fr;
			gap: 30px;
		}
	}
</style>
