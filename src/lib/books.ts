export type Book = {
	id: string;
	title: string;
	author: string;
	status?: 'read' | 'reading' | 'plan to read';
};

export const readingGroups = [
	{ id: 'reading', label: 'Reading now', caption: 'On the desk' },
	{ id: 'collection', label: 'Owned / to read', caption: 'In the collection' },
	{ id: 'read', label: 'Read', caption: 'In the archive' }
] as const;

export type ReadingGroup = (typeof readingGroups)[number]['id'];

export function readingGroup(book: Book): ReadingGroup {
	if (book.status === 'reading') return 'reading';
	if (book.status === 'read') return 'read';
	return 'collection';
}

// Titles already featured on the homepage; no reading status is inferred.
export const featuredBooks: Book[] = [
	{ id: 'the-picture-of-dorian-gray', title: 'The Picture of Dorian Gray', author: 'Oscar Wilde' },
	{ id: 'the-sickness-unto-death', title: 'The Sickness unto Death', author: 'Søren Kierkegaard' },
	{ id: 'crime-and-punishment', title: 'Crime and Punishment', author: 'Fyodor Dostoyevsky' },
	{ id: 'the-stranger', title: 'The Stranger', author: 'Albert Camus' },
	{ id: 'the-myth-of-sisyphus', title: 'The Myth of Sisyphus', author: 'Albert Camus' }
];

// Owner-approved placeholders for the preview; replace after the final reading inventory.
export const provisionalReadingStatus: Partial<Record<string, NonNullable<Book['status']>>> = {
	'crime-and-punishment': 'read',
	'critique-of-pure-reason': 'plan to read',
	'dantes-inferno': 'read',
	'don-quixote': 'plan to read',
	'the-brothers-karamazov': 'reading',
	'the-myth-of-sisyphus': 'plan to read',
	'the-picture-of-dorian-gray': 'reading',
	'the-plague': 'plan to read',
	'the-rebel': 'plan to read',
	'the-sickness-unto-death': 'read',
	'the-stranger': 'plan to read',
	'war-and-peace': 'read'
};
