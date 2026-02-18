<script lang="ts">
	import type { PostPreview } from '$lib/posts';
	import PostList from '$lib/components/PostList.svelte';

	let { data } = $props();
	const posts: PostPreview[] = data.posts;
</script>

<svelte:head>
	<title>Blog | Rituparan Reddy</title>
</svelte:head>

<section class="blog-layout py-6">
	<PostList {posts} title="Blog Posts" emptyMessage="No blog posts found." basePath="/blog" />
</section>

<style>
	.blog-layout {
		max-width: 900px;
		margin: 0 auto;
		padding: 0 var(--grid);
	}

	@media (min-width: 768px) {
		.blog-layout {
			padding: 0 calc(var(--grid) * 2);
		}
	}
</style>
