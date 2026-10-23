import { getAllPosts } from '$lib/server/posts';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = async () =>
	(await getAllPosts())
		.filter((post) => post.metadata.status !== 'plan to read')
		.map(({ slug }) => ({ slug }));
