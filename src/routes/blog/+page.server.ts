import { getAllPosts } from '$lib/posts';

export async function load() {
    const posts = await getAllPosts();
    // Optionally filter out 'book' and 'project' tags if desired for the main blog feed
    // const filteredPosts = posts.filter(p =>
    //     !p.metadata.tags?.includes('book') && !p.metadata.tags?.includes('project')
    // );
    return {
        posts: posts // or filteredPosts
    };
}
