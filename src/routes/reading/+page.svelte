<script lang="ts">
	import type { Post } from '$lib/posts';
	import PostList from '$lib/components/PostList.svelte';

	let { data } = $props();
	const posts: Post[] = data.posts;
</script>

<svelte:head>
	<title>Reading | Rituparan Reddy</title>
</svelte:head>

<PostList
	{posts}
	title="Reading List / Book Reviews"
	description="Posts tagged with 'book' — notes and reviews on what I'm reading."
	emptyMessage="No book-related posts found. Tag posts with 'book'."
	basePath="/blog"
/>
