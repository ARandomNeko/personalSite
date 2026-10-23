import type { PostMetadata, PostPreview } from '$lib/posts';

// List pages need only frontmatter; article components stay out of this index.
const metadata = import.meta.glob<PostMetadata>('/src/posts/**/*.md', {
	eager: true,
	import: 'metadata'
});
const posts: PostPreview[] = Object.entries(metadata)
	.filter(([, entry]) => entry.title && entry.date && entry.published !== false)
	.map(([path, metadata]) => ({
		metadata,
		slug: path.replace('/src/posts/', '').replace(/(?:\/index)?\.md$/, '')
	}))
	.sort((a, b) => Date.parse(b.metadata.date) - Date.parse(a.metadata.date));

export async function getAllPosts() {
	return posts;
}

export async function getPostsByTag(tag: string) {
	return posts.filter((post) => post.metadata.tags?.includes(tag));
}
