import { getPostBySlug } from '$lib/posts';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    try {
        const post = await getPostBySlug(params.slug);
        return {
            content: post.component, // Pass the component constructor
            metadata: post.metadata // Pass metadata for the layout
        };
    } catch (e: any) {
         // Handle potential errors from getPostBySlug (like 404)
         if (e?.status === 404) {
             error(404, e.body?.message || 'Not Found');
         }
         // Rethrow other errors or handle them as needed
         error(500, 'Could not load post');
    }
}
