<script lang="ts">
	import JournalGallery from '#lib/components/JournalGallery.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Journal | Rituparan Reddy</title>
	<meta
		name="description"
		content="Notes on code, robotics, and things I've built. A journal by Rituparan Reddy."
	/>
</svelte:head>

<JournalGallery posts={data.posts} />
