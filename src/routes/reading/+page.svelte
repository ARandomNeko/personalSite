<script lang="ts">
	import { untrack } from 'svelte';
	import { readingGroups, readingGroup, type Book } from '$lib/books';
	import { bookPaintings } from '$lib/bookPaintings';
	import { paintings } from '$lib/art/collection';
	import LibraryBackdrop from '$lib/art/LibraryBackdrop.svelte';
	let { data }: { data: { books: Book[] } } = $props();
	let selectedId = $state(
		untrack(() => data.books.find((book) => book.status === 'reading')?.id ?? data.books[0]?.id)
	);
	const groups = $derived(
		readingGroups.map((group) => ({
			...group,
			books: data.books.filter((book) => readingGroup(book) === group.id)
		}))
	);
	const painting = $derived(
		paintings.find((painting) => painting.id === bookPaintings[selectedId]) ?? paintings[0]
	);
</script>

<svelte:head>
	<title>Library | Rituparan Reddy</title>
	<meta
		name="description"
		content="What I'm reading, books I own or plan to read, and books I've finished."
	/>
</svelte:head>

<LibraryBackdrop {painting} />

<section class="library" aria-labelledby="library-title">
	<header class="library-heading">
		<h1 id="library-title">The library.</h1>
	</header>
	<div class="reading-groups">
		{#each groups as group}
			<section aria-labelledby={`group-${group.id}`}>
				<h2 id={`group-${group.id}`}>
					{group.label}<span>{String(group.books.length).padStart(2, '0')}</span>
				</h2>
				<ul aria-label={group.label}>
					{#each group.books as book (book.id)}
						<li>
							<button
								aria-pressed={selectedId === book.id}
								onclick={() => (selectedId = book.id)}
								onfocus={() => (selectedId = book.id)}
							>
								<span class="book-title">{book.title}</span>
								<span class="book-author">{book.author}</span>
							</button>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
	<aside class="painting-credit" aria-label="Current painting" aria-live="polite">
		<a href={painting.source} target="_blank" rel="noreferrer">{painting.name} ↗</a>
		<p>{painting.artist}, {painting.year}</p>
	</aside>
</section>

<style>
	.library {
		min-height: calc(100dvh - var(--site-header-height) - 180px);
		display: flex;
		flex-direction: column;
	}
	.library-heading {
		margin-bottom: 68px;
	}
	h1 {
		font: clamp(54px, 6vw, 80px) / 1 var(--font-serif);
		letter-spacing: -1px;
		margin: 0;
	}
	.reading-groups {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 58px;
	}
	h2 {
		display: flex;
		align-items: baseline;
		gap: 14px;
		margin: 0 0 28px;
		color: #d4c9b0;
		font: 10px/1.5 var(--font-mono);
	}
	h2 > span {
		color: #aaa995;
		font-size: 8px;
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 25px;
	}
	button {
		display: block;
		width: 100%;
		padding: 0;
		border: 0;
		background: transparent;
		color: #d2cebd;
		text-align: left;
	}
	.book-title {
		display: block;
		font: 29px/1.1 var(--font-serif);
		text-wrap: balance;
	}
	.book-author {
		display: block;
		margin-top: 8px;
		color: #acb09e;
		font: 16px/1.5 var(--font-body);
	}
	button:hover,
	button[aria-pressed='true'] {
		color: #f0e4c6;
	}
	button:hover .book-title,
	button[aria-pressed='true'] .book-title {
		text-decoration: underline;
		text-decoration-color: #bda67a99;
		text-decoration-thickness: 1px;
		text-underline-offset: 6px;
	}
	.painting-credit {
		margin-top: auto;
		padding-top: 72px;
		color: #c0bfab;
		font: 9px/1.6 var(--font-mono);
	}
	.painting-credit a {
		text-decoration: none;
	}
	.painting-credit a:hover {
		text-decoration: underline;
	}
	.painting-credit p {
		color: #a9af9b;
		font-size: 8px;
		margin: 5px 0 0;
	}
	@media (max-width: 1000px) {
		.reading-groups {
			gap: 30px;
		}
		.book-title {
			font-size: 26px;
		}
	}
	@media (max-width: 760px) {
		.library-heading {
			margin-bottom: 45px;
		}
		h1 {
			font-size: 58px;
		}
		.reading-groups {
			grid-template-columns: 1fr;
			gap: 45px;
		}
		h2 {
			margin-bottom: 24px;
		}
		ul {
			gap: 22px;
		}
		.book-title {
			font-size: 30px;
		}
		.book-author {
			font-size: 17px;
			margin-top: 6px;
		}
		.painting-credit {
			padding-top: 60px;
		}
	}
</style>
