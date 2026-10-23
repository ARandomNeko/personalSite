import type { PageServerLoad } from './$types';
import { getAllPosts } from '#lib/server/posts.js';
import { defaultIds } from '#lib/art/collection.js';
import { shuffled } from '#lib/art/shuffle.js';

export const load: PageServerLoad = async ({ setHeaders }) => {
	// Shared HTML caches must not deal the same shuffled deck to every visitor.
	setHeaders({ 'cache-control': 'private, no-store' });
	const allPosts = await getAllPosts();
	const recentPosts = allPosts
		.filter((post) => post.metadata.status !== 'plan to read')
		.map(({ metadata, slug }) => ({ metadata, slug }));
	return { recentPosts, paintingOrder: shuffled(defaultIds) };
};

// A fresh request chooses a new painting order; content pages are prerendered.
export const prerender = false;
