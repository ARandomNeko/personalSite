import { expect, test } from 'vitest';
import { libraryBooks, featuredBooks, readingGroup, type Book } from './books';
import { bookPaintings } from './bookPaintings';
import { paintings } from './art/collection';

test('every reading state belongs to the right library group, including books without a status', () => {
	const book: Book = { id: 'book', title: 'A book', author: 'An author' };
	expect(readingGroup({ ...book, status: 'reading' })).toBe('reading');
	expect(readingGroup({ ...book, status: 'read' })).toBe('read');
	expect(readingGroup({ ...book, status: 'plan to read' })).toBe('collection');
	expect(readingGroup(book)).toBe('collection');
});

test('the library has unique books and a distinct, credited painting for every title', () => {
	const ids = libraryBooks.map((book) => book.id);
	expect(new Set(ids).size).toBe(ids.length);
	const artworkIds = libraryBooks.map((book) => bookPaintings[book.id]);
	expect(new Set(artworkIds).size).toBe(ids.length);
	for (const book of libraryBooks) {
		const art = paintings.find((painting) => painting.id === bookPaintings[book.id]);
		expect(art, book.title).toBeDefined();
		expect(art?.source, book.title).toMatch(/^https:\/\//);
		expect(art?.variants?.length, book.title).toBeGreaterThan(0);
	}
	for (const book of featuredBooks) expect(ids).toContain(book.id);
});
