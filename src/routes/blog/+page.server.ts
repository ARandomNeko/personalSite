import type { PageServerLoad } from './$types';
import { getAllPosts } from '$lib/server/posts';

export const load: PageServerLoad = async () => {
	const posts = await getAllPosts();
	return {
		posts: posts
			.filter((post) => post.metadata.status !== 'plan to read')
			.map(({ metadata, slug }) => ({ metadata, slug }))
	};
};
