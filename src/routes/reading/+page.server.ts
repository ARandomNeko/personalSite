import { libraryBooks } from '$lib/books';

export function load() {
	return { books: libraryBooks };
}
