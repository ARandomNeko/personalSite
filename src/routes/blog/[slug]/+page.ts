import { error } from '@sveltejs/kit';
import type { PostMetadata } from '$lib/posts';
import type { PageLoad } from './$types';

const articles = import.meta.glob<{
	metadata: PostMetadata;
	default: ConstructorOfATypedSvelteComponent;
}>('/src/posts/**/*.md');

export const load: PageLoad = async ({ params }) => {
	const resolve =
		articles[`/src/posts/${params.slug}.md`] ?? articles[`/src/posts/${params.slug}/index.md`];
	if (!resolve) error(404, 'Post not found');
	const post = await resolve();
	if (post.metadata.published === false || post.metadata.status === 'plan to read')
		error(404, 'Post not found');
	return { content: post.default, metadata: post.metadata };
};
