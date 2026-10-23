import { libraryBooks } from '#lib/books.js';

export function load() {
	return { books: libraryBooks };
}
