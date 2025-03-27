// src/lib/posts.ts
import { error } from '@sveltejs/kit';

export type PostMetadata = {
	title: string;
	date: string;
	tags?: string[];
	description?: string;
	published?: boolean; // Optional: control visibility
};

export type Post = {
	metadata: PostMetadata;
	slug: string;
	component: ConstructorOfATypedSvelteComponent; // The actual Svelte component from the MD file
};

// Helper function to get slug from path
function getSlugFromPath(path: string): string {
	const match = path.match(/src\/posts\/(.+)\.md$/);
	if (match && match[1]) {
		return match[1].replace(/\/index$/, ''); // Handle index.md files in subfolders
	}
	// Throw an error or return a default/empty slug if the pattern doesn't match
	// This ensures slugs are always derived correctly.
	throw new Error(`Could not derive slug from path: ${path}`);
}


// Fetch all posts
async function fetchPosts(): Promise<Post[]> {
	const modules = import.meta.glob('/src/posts/**/*.md');
	const postPromises = Object.entries(modules).map(async ([path, resolver]) => {
		try {
			const resolvedModule = (await resolver()) as {
				metadata: PostMetadata;
				default: ConstructorOfATypedSvelteComponent;
			};

			// Basic validation
			if (!resolvedModule.metadata || !resolvedModule.metadata.title || !resolvedModule.metadata.date) {
				console.warn(`Skipping ${path}: Missing required frontmatter (title, date).`);
				return null; // Skip posts with missing essential frontmatter
			}
			
			// Filter out unpublished posts if 'published' flag exists and is false
			if (resolvedModule.metadata.published === false) {
				return null;
			}


			const slug = getSlugFromPath(path);


			return {
				metadata: resolvedModule.metadata,
				slug: slug,
				component: resolvedModule.default
			};
		} catch (e) {
			console.error(`Error processing ${path}:`, e);
			// Depending on strictness, you might want to throw an error here
			// For now, just log and skip the problematic file
			return null;
		}
	});

	const posts = (await Promise.all(postPromises))
		.filter((post): post is Post => post !== null) // Type guard to filter out nulls
		.sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()); // Sort by date, newest first

	return posts;
}

let allPosts: Post[] | null = null;

// Get all posts (cached)
export async function getAllPosts(): Promise<Post[]> {
	if (!allPosts) {
		allPosts = await fetchPosts();
	}
	return allPosts;
}

// Get posts filtered by tag
export async function getPostsByTag(tag: string): Promise<Post[]> {
	const posts = await getAllPosts();
	return posts.filter(post => post.metadata.tags?.includes(tag));
}

// Get a single post by slug
export async function getPostBySlug(slug: string): Promise<Post> {
	const posts = await getAllPosts();
	const post = posts.find(p => p.slug === slug);
	if (!post) {
		error(404, 'Post not found');
	}
	return post;
}
