import { json } from '@sveltejs/kit';
import { getAllPosts } from '$lib/posts';

export async function GET() {
	const posts = await getAllPosts();
	
	// Return only the public fields (slug and metadata)
	const publicPosts = posts.map(({ slug, metadata }) => ({
		slug,
		metadata
	}));
	
	return json(publicPosts);
}

export const prerender = true;
