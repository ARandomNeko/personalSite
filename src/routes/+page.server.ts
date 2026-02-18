import type { PageServerLoad } from './$types';
import { getAllPosts } from '$lib/posts';

export const load: PageServerLoad = async () => {
	const allPosts = await getAllPosts();
	const recentPosts = allPosts
		.filter((post) => post.metadata.status !== 'plan to read')
		.slice(0, 3)
		.map(({ metadata, slug }) => ({ metadata, slug }));
	return { recentPosts };
};
