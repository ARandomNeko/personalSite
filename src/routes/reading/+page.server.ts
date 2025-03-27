import { getPostsByTag } from '$lib/posts';

export async function load() {
    const posts = await getPostsByTag('book');
    return {
        posts: posts
    };
}
