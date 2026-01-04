<script lang="ts">
	import type { Post } from '$lib/posts';
	import PostList from '$lib/components/PostList.svelte';

	let { data } = $props();
	const posts: Post[] = data.posts;
</script>

<svelte:head>
	<title>Blog | Rituparan Reddy</title>
</svelte:head>

<PostList
	{posts}
	title="Blog Posts"
	emptyMessage="No blog posts found."
	basePath="/blog"
/>
