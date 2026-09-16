import type { PageServerLoad } from './$types';
import { getPostsByTag } from '$lib/posts';

export const load: PageServerLoad = async () => {
	const posts = await getPostsByTag('project');
	return {
		posts: posts.map(({ metadata, slug }) => ({ metadata, slug }))
	};
};
