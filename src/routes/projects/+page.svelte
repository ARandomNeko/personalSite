 <script lang="ts">
    import type { Post } from '$lib/posts';

    let { data } = $props();
    const posts: Post[] = data.posts;

     function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
</script>

<svelte:head>
    <title>Projects | Rituparan Reddy</title>
</svelte:head>

<section>
    <h1 class="text-2xl font-bold mb-6">Projects</h1>

    {#if posts.length > 0}
        <div class="space-y-6">
             {#each posts as post}
                <a href="/blog/{post.slug}" class="block card group"> <!-- Link to the unified blog slug -->
                    <span class="text-xs text-[--tx-2]">{formatDate(post.metadata.date)}</span>
                    <h2 class="text-lg font-bold mt-1 mb-2 group-hover:text-[--cy] transition-colors">{post.metadata.title}</h2>
                    {#if post.metadata.description}
                        <p class="text-sm text-[--tx-2]">{post.metadata.description}</p>
                    {/if}
                     {#if post.metadata.tags && post.metadata.tags.length > 0}
                        <div class="flex gap-2 mt-2">
                            {#each post.metadata.tags as tag}
                                <span class="text-xs bg-base-800 text-base-200 px-2 py-1 rounded">#{tag}</span>
                            {/each}
                        </div>
                    {/if}
                </a>
            {/each}
        </div>
    {:else}
        <p>No project posts found. Tag posts with 'project'.</p>
    {/if}
</section>
