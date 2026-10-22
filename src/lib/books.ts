export type Book = {
	id: string;
	title: string;
	author: string;
	status?: 'read' | 'reading' | 'plan to read';
};

// Titles already featured on the homepage; no reading status is inferred.
export const featuredBooks: Book[] = [
	{ id: 'the-picture-of-dorian-gray', title: 'The Picture of Dorian Gray', author: 'Oscar Wilde' },
	{ id: 'the-sickness-unto-death', title: 'The Sickness unto Death', author: 'Søren Kierkegaard' },
	{ id: 'crime-and-punishment', title: 'Crime and Punishment', author: 'Fyodor Dostoyevsky' },
	{ id: 'the-stranger', title: 'The Stranger', author: 'Albert Camus' },
	{ id: 'the-myth-of-sisyphus', title: 'The Myth of Sisyphus', author: 'Albert Camus' }
];
