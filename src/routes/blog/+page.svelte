<script lang="ts">
	import { untrack } from 'svelte';
	import type { PostPreview } from '$lib/posts';
	import JournalCard from '$lib/components/JournalCard.svelte';
	import LibraryBackdrop from '$lib/art/LibraryBackdrop.svelte';
	import { paintingForPost } from '$lib/art/postPaintings';

	let { data }: { data: { posts: PostPreview[] } } = $props();
	let selected = $state(untrack(() => data.posts[0]?.slug ?? ''));
	const painting = $derived(paintingForPost(selected));
</script>

<svelte:head>
	<title>Journal | Rituparan Reddy</title>
	<meta
		name="description"
		content="Notes on code, robotics, and things I've built. A journal by Rituparan Reddy."
	/>
</svelte:head>

<LibraryBackdrop {painting} />
<section class="journal" aria-labelledby="journal-title">
	<header class="journal-heading">
		<div>
			<p class="eyebrow">Experiments / Field notes / Occasional thoughts</p>
			<h1 id="journal-title">The journal<span>.</span></h1>
		</div>
		<p class="intro">Things I've built,<br />and what I learned along the way.</p>
	</header>
	{#if data.posts.length}
		<div class="journal-grid">
			{#each data.posts as post, i (post.slug)}
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
		margin-bottom: 48px;
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
