<script lang="ts">
	import type { PostPreview } from '$lib/posts';
	import PostList from '$lib/components/PostList.svelte';

	let { data } = $props();
	const posts: PostPreview[] = data.posts;
</script>

<svelte:head>
	<title>Projects | Rituparan Reddy</title>
</svelte:head>

<PostList
	{posts}
	title="Projects"
	description="Posts tagged with 'project' — deep dives into things I've built."
	emptyMessage="No project posts found. Tag posts with 'project'."
	basePath="/blog"
/>
