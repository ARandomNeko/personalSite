<!-- src/lib/components/MarkdownLayout.svelte -->
<script>
	let { title, date, tags, children } = $props();
</script>

<svelte:head>
	{#if title}
		<title>{title} | Rituparan Reddy</title>
	{/if}
</svelte:head>

<section class="article-layout py-6">
	<article class="prose prose-base dark:prose-invert max-w-[72ch]">
		{#if title}
			<h1 class="mb-2 text-3xl font-bold !text-[--re]">{title}</h1>
		{/if}
		{#if date}
			<p class="mb-4 text-sm !text-[--tx-2]">
				Published: {new Date(date).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}
			</p>
		{/if}
		{#if tags && tags.length > 0}
			<div class="mb-6 flex flex-wrap gap-2">
				{#each tags as tag}
					<span class="tag">#{tag}</span>
				{/each}
			</div>
		{/if}

		{@render children()}
	</article>
</section>

<style>
	.article-layout {
		max-width: 960px;
		margin: 0 auto;
		padding: 0 var(--grid);
	}

	@media (min-width: 900px) {
		.article-layout {
			padding: 0 calc(var(--grid) * 2);
		}
	}
</style>
