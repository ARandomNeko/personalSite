<script lang="ts">
	import type { PostPreview } from '$lib/posts';
	import PostCard from './PostCard.svelte';

	let {
		posts,
		title,
		emptyMessage = 'No posts found.',
		basePath = '/blog',
		description = ''
	}: {
		posts: PostPreview[];
		title: string;
		emptyMessage?: string;
		basePath?: string;
		description?: string;
	} = $props();
</script>

<section class="list-layout py-6">
	<div class="animate-fade-in">
		<h1 class="mb-3 text-3xl font-bold !text-[--re]">{title}</h1>
	</div>
	{#if description}
		<p class="animate-fade-in animate-delay-1 mb-6 text-sm text-[--tx-2]">{description}</p>
	{:else}
		<div class="mb-6"></div>
	{/if}

	{#if posts.length > 0}
		<div class="animate-fade-in animate-delay-2 space-y-6">
			{#each posts as post}
				<PostCard {post} {basePath} />
			{/each}
		</div>
	{:else}
		<p class="animate-fade-in animate-delay-2 text-[--tx-2]">{emptyMessage}</p>
	{/if}
</section>

<style>
	.list-layout {
		max-width: 960px;
		margin: 0 auto;
		padding: 0 var(--grid);
	}

	@media (min-width: 900px) {
		.list-layout {
			padding: 0 calc(var(--grid) * 2);
		}
	}
</style>
