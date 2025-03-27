<script lang="ts">
    let { data } = $props();
    const Content = data.content; // The actual component from the MD file
    const metadata = data.metadata; // Frontmatter for the layout
</script>

<!-- Render the content using the layout which receives metadata -->
<svelte:component this={Content} {...metadata} />
