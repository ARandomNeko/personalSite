<script lang="ts">
	import JournalGallery from '#lib/components/JournalGallery.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Projects — Journal | Rituparan Reddy</title>
	<meta
		name="description"
		content="Projects from the journal: code, robotics, and things I've built."
	/>
</svelte:head>

<JournalGallery posts={data.posts} projectOnly />
