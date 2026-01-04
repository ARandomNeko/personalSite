<script lang="ts">
	import type { Post } from '$lib/posts';
	import PostCard from './PostCard.svelte';

	let {
		posts,
		title,
		emptyMessage = 'No posts found.',
		basePath = '/blog',
		description = ''
	}: {
		posts: Post[];
		title: string;
		emptyMessage?: string;
		basePath?: string;
		description?: string;
	} = $props();
</script>

<section>
	<h1 class="mb-2 text-2xl font-bold">{title}</h1>
	{#if description}
		<p class="mb-6 text-sm text-[--tx-2]">{description}</p>
	{:else}
		<div class="mb-6"></div>
	{/if}

	{#if posts.length > 0}
		<div class="space-y-6">
			{#each posts as post}
				<PostCard {post} {basePath} />
			{/each}
		</div>
	{:else}
		<p class="text-[--tx-2]">{emptyMessage}</p>
	{/if}
</section>



