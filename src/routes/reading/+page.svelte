<script lang="ts">
	let { data } = $props();
	const posts = data.posts;
</script>

<svelte:head>
	<title>Reading | Rituparan Reddy</title>
</svelte:head>

<section class="reading-layout py-6">
	<div class="animate-fade-in">
		<h1 class="mb-3 text-3xl font-bold !text-[--re]">Reading List</h1>
		<p class="mb-6 text-sm text-[--tx-2]">Books I've read or am currently reading.</p>
	</div>

	{#if posts.length > 0}
		<div class="reading-list animate-fade-in animate-delay-1">
			{#each posts as post}
				<div class="reading-item">
					<div class="reading-info">
						<span class="text-sm">{post.metadata.title}</span>
						{#if post.metadata.description}
							<span class="text-xs text-[--tx-2]">{post.metadata.description}</span>
						{/if}
					</div>
					{#if post.metadata.status}
						<span class="tag">{post.metadata.status}</span>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<p class="text-sm text-[--tx-2]">No books yet.</p>
	{/if}
</section>

<style>
	.reading-layout {
		max-width: 900px;
		margin: 0 auto;
		padding: 0 var(--grid);
	}

	@media (min-width: 768px) {
		.reading-layout {
			padding: 0 calc(var(--grid) * 2);
		}
	}

	.reading-list {
		border: 1px solid var(--ui-3);
	}

	.reading-item {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding: calc(var(--grid) * 0.75) var(--grid);
		border-bottom: 1px solid var(--ui-3);
		transition: border-color 0.15s;
		gap: var(--grid);
	}

	.reading-item:last-child {
		border-bottom: none;
	}

	.reading-item:hover {
		background-color: color-mix(in srgb, var(--tx) 5%, transparent);
	}

	.reading-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
</style>
