import { expect, test } from 'vitest';
import { readingGroup, type Book } from './books';

test('every reading state belongs to the right library group, including books without a status', () => {
	const book: Book = { id: 'book', title: 'A book', author: 'An author' };
	expect(readingGroup({ ...book, status: 'reading' })).toBe('reading');
	expect(readingGroup({ ...book, status: 'read' })).toBe('read');
	expect(readingGroup({ ...book, status: 'plan to read' })).toBe('collection');
	expect(readingGroup(book)).toBe('collection');
});
