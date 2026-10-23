import type { PageServerLoad } from './$types';
import { getAllPosts } from '$lib/server/posts';

export const load: PageServerLoad = async () => {
	const allPosts = await getAllPosts();
	const recentPosts = allPosts
		.filter((post) => post.metadata.status !== 'plan to read')
		.map(({ metadata, slug }) => ({ metadata, slug }));
	const paintingSeed = crypto.getRandomValues(new Uint32Array(1))[0];
	return { recentPosts, paintingSeed };
};

// A fresh request chooses a new painting order; content pages are prerendered.
export const prerender = false;
