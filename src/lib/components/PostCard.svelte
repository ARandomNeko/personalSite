<script lang="ts">
	import type { Post } from '$lib/posts';

	let { post, basePath = '/blog' }: { post: Post; basePath?: string } = $props();

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<a href="{basePath}/{post.slug}" class="card group block">
	<span class="text-xs text-[--tx-2]">{formatDate(post.metadata.date)}</span>
	<h2 class="mt-1 mb-2 text-lg font-bold transition-colors group-hover:text-[--cy]">
		{post.metadata.title}
	</h2>
	{#if post.metadata.description}
		<p class="text-sm text-[--tx-2]">{post.metadata.description}</p>
	{/if}
	{#if post.metadata.tags && post.metadata.tags.length > 0}
		<div class="mt-2 flex flex-wrap gap-2">
			{#each post.metadata.tags as tag}
				<span class="tag">#{tag}</span>
			{/each}
		</div>
	{/if}
</a>



