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

// The owner’s reading inventory. Keep status here, independent of journal publication.
export const libraryBooks: Book[] = [
	{
		id: 'beyond-good-and-evil',
		title: 'Beyond Good and Evil',
		author: 'Friedrich Nietzsche',
		status: 'reading'
	},
	{ id: 'the-prince', title: 'The Prince', author: 'Niccolò Machiavelli', status: 'reading' },
	{ id: 'moby-dick', title: 'Moby-Dick', author: 'Herman Melville', status: 'plan to read' },
	{
		id: 'huckleberry-finn',
		title: 'Adventures of Huckleberry Finn',
		author: 'Mark Twain',
		status: 'plan to read'
	},
	{ id: 'the-republic', title: 'The Republic', author: 'Plato', status: 'plan to read' },
	{ id: 'the-iliad', title: 'The Iliad', author: 'Homer', status: 'plan to read' },
	{ id: 'the-odyssey', title: 'The Odyssey', author: 'Homer', status: 'plan to read' },
	{ id: 'the-fall', title: 'The Fall', author: 'Albert Camus', status: 'plan to read' },
	{ id: 'the-plague', title: 'The Plague', author: 'Albert Camus', status: 'plan to read' },
	{ id: 'the-rebel', title: 'The Rebel', author: 'Albert Camus', status: 'plan to read' },
	{
		id: 'iron-in-the-soul',
		title: 'Iron in the Soul',
		author: 'Jean-Paul Sartre',
		status: 'plan to read'
	},
	{
		id: 'dantes-inferno',
		title: 'Dante’s Inferno',
		author: 'Dante Alighieri',
		status: 'plan to read'
	},
	{ id: 'dune', title: 'Dune', author: 'Frank Herbert', status: 'read' },
	{ id: 'dune-messiah', title: 'Dune Messiah', author: 'Frank Herbert', status: 'read' },
	{ id: 'children-of-dune', title: 'Children of Dune', author: 'Frank Herbert', status: 'read' },
	{
		id: 'god-emperor-of-dune',
		title: 'God Emperor of Dune',
		author: 'Frank Herbert',
		status: 'read'
	},
	{ id: 'heretics-of-dune', title: 'Heretics of Dune', author: 'Frank Herbert', status: 'read' },
	{ id: 'chapterhouse-dune', title: 'Chapterhouse: Dune', author: 'Frank Herbert', status: 'read' },
	{ id: 'nicomachean-ethics', title: 'Nicomachean Ethics', author: 'Aristotle', status: 'read' },
	{
		id: 'the-myth-of-sisyphus',
		title: 'The Myth of Sisyphus',
		author: 'Albert Camus',
		status: 'read'
	},
	{
		id: 'crime-and-punishment',
		title: 'Crime and Punishment',
		author: 'Fyodor Dostoyevsky',
		status: 'read'
	},
	{ id: 'don-quixote', title: 'Don Quixote', author: 'Miguel de Cervantes', status: 'read' },
	{ id: 'the-stranger', title: 'The Stranger', author: 'Albert Camus', status: 'read' },
	{
		id: 'the-picture-of-dorian-gray',
		title: 'The Picture of Dorian Gray',
		author: 'Oscar Wilde',
		status: 'read'
	},
	{
		id: 'the-sickness-unto-death',
		title: 'The Sickness unto Death',
		author: 'Søren Kierkegaard',
		status: 'read'
	},
	{
		id: 'notes-from-underground',
		title: 'Notes from Underground',
		author: 'Fyodor Dostoyevsky',
		status: 'read'
	},
	{ id: 'brave-new-world', title: 'Brave New World', author: 'Aldous Huxley', status: 'read' },
	{ id: 'the-fountainhead', title: 'The Fountainhead', author: 'Ayn Rand', status: 'read' }
];

// Keep the homepage selection in one place with the full library records.
const featuredIds = [
	'the-picture-of-dorian-gray',
	'the-sickness-unto-death',
	'crime-and-punishment',
	'the-stranger',
	'the-myth-of-sisyphus'
];
export const featuredBooks = featuredIds.map((id) => libraryBooks.find((book) => book.id === id)!);
