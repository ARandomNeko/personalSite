<script lang="ts">
    let { data } = $props();
    const Content = data.content; // The actual component from the MD file
    const metadata = data.metadata; // Frontmatter for the layout
</script>

<svelte:head>
    <title>{metadata.title} | Rituparan Reddy</title>
    {#if metadata.description}
        <meta name="description" content={metadata.description} />
        <meta property="og:description" content={metadata.description} />
    {/if}
    <meta name="keywords" content={`ritu, rituparan, ritu reddy, rituparan reddy, rituparan gurrala, rituparan reddy gurrala, ${metadata.tags?.join(', ') || ''}`} />
    <meta property="og:title" content={`${metadata.title} | Rituparan Reddy`} />
    <meta property="og:type" content="article" />
    <meta name="author" content="Rituparan Reddy" />
</svelte:head>

<!-- Render the content using the layout which receives metadata -->
<Content {...metadata} />
