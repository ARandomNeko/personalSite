import { getPostsByTag } from '$lib/posts';
import { featuredBooks, provisionalReadingStatus, type Book } from '$lib/books';

export async function load() {
	const posts = await getPostsByTag('book');
	const books = new Map<string, Book>(
		posts.map(({ metadata, slug }) => [
			slug,
			{
				id: slug,
				title: metadata.title,
				author: metadata.description?.replace(/^By\s+/i, '') ?? '',
				status: metadata.status
			}
		])
	);
	for (const book of featuredBooks) {
		if (!books.has(book.id)) books.set(book.id, book);
	}
	return {
		books: [...books.values()].map((book) => ({
			...book,
			status: provisionalReadingStatus[book.id] ?? book.status
		}))
	};
}
