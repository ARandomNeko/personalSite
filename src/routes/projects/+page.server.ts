import { getPostsByTag } from '$lib/posts';

export async function load() {
    const posts = await getPostsByTag('project');
    return {
        posts: posts
    };
}
