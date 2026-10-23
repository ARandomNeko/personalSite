import { getAllPosts } from '#lib/server/posts.js';

export async function GET() {
	const posts = await getAllPosts();

	// Return only the public fields (slug and metadata)
	const publicPosts = posts.map(({ slug, metadata }) => ({
		slug,
		metadata
	}));

	return Response.json(publicPosts);
}

export const prerender = true;
