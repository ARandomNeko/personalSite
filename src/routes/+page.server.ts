import type { PageServerLoad } from './$types';
import { getAllPosts } from '$lib/posts';

export const load: PageServerLoad = async () => {
	const allPosts = await getAllPosts();
	// Get the 3 most recent posts for the sidebar
	const recentPosts = allPosts.slice(0, 3);
	return { recentPosts };
};



