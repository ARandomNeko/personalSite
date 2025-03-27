<script lang="ts">
	import type { Post } from '$lib/posts';

	let { data } = $props();
	const posts: Post[] = data.posts;

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Blog | Rituparan Reddy</title>
</svelte:head>

<section>
	<h1 class="mb-6 text-2xl font-bold">Blog Posts</h1>

	{#if posts.length > 0}
		<div class="space-y-6">
			{#each posts as post}
				<a href="/blog/{post.slug}" class="card group block">
					<span class="text-xs text-[--tx-2]">{formatDate(post.metadata.date)}</span>
					<h2 class="mt-1 mb-2 text-lg font-bold transition-colors group-hover:text-[--cy]">
						{post.metadata.title}
					</h2>
					{#if post.metadata.description}
						<p class="text-sm text-[--tx-2]">{post.metadata.description}</p>
					{/if}
					{#if post.metadata.tags && post.metadata.tags.length > 0}
						<div class="mt-2 flex gap-2">
							{#each post.metadata.tags as tag}
								<span class="bg-base-800 text-base-200 rounded px-2 py-1 text-xs">#{tag}</span>
							{/each}
						</div>
					{/if}
				</a>
			{/each}
		</div>
	{:else}
		<p>No blog posts found.</p>
	{/if}
</section>
