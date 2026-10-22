<script lang="ts">
	import type { Book } from '$lib/books';
	let { books, searchable = false }: { books: Book[]; searchable?: boolean } = $props();
	let query = $state('');
	let selectedId = $state<string | null>(null);
	const visible = $derived(
		books.filter((book) =>
			`${book.title} ${book.author}`.toLowerCase().includes(query.trim().toLowerCase())
		)
	);
	const selected = $derived(visible.find((book) => book.id === selectedId) ?? visible[0]);
	const cloth = ['#4b5447', '#6a4543', '#3e505c', '#766445', '#565064', '#6b6354'];
	const status = { read: 'Read', reading: 'Reading', 'plan to read': 'To read' };
	function binding(id: string) {
		const seed = [...id].reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
		return { color: cloth[seed % cloth.length], height: 192 + (seed % 5) * 10 };
	}
	function browse(event: KeyboardEvent, index: number) {
		let next: number;
		if (event.key === 'ArrowRight') next = (index + 1) % visible.length;
		else if (event.key === 'ArrowLeft') next = (index - 1 + visible.length) % visible.length;
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = visible.length - 1;
		else return;
		event.preventDefault();
		const shelf = (event.currentTarget as HTMLButtonElement).closest('ul')!;
		shelf.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
	}
</script>

<div class="bookcase">
	{#if searchable}
		<div class="shelf-tools">
			<label
				>Find a book<input type="search" placeholder="Title or author…" bind:value={query} /></label
			>
			<span class="volume-count" aria-live="polite"
				>{visible.length} {visible.length === 1 ? 'volume' : 'volumes'}</span
			>
		</div>
	{/if}
	{#if visible.length}
		<ul class="shelf" aria-label="Bookshelf">
			{#each visible as book, index (book.id)}
				{@const cover = binding(book.id)}
				<li>
					<button
						class="spine"
						style:--cloth={cover.color}
						style:--spine-height={`${cover.height}px`}
						aria-label={`View ${book.title} by ${book.author}`}
						aria-pressed={selected?.id === book.id}
						onclick={() => (selectedId = book.id)}
						onfocus={() => (selectedId = book.id)}
						onkeydown={(event) => browse(event, index)}
					>
						<span class="spine-title">{book.title}</span>
						<span class="spine-author">{book.author}</span>
						<span class="volume-number" aria-hidden="true"
							>{String(books.indexOf(book) + 1).padStart(2, '0')}</span
						>
					</button>
				</li>
			{/each}
		</ul>
		{#if selected}
			<section
				class="reading-desk"
				aria-label="Selected book"
				aria-live="polite"
				aria-atomic="true"
			>
				<div class="desk-heading">
					<span>From the shelf</span>{#if selected.status}<span class="reading-status"
							>{status[selected.status]}</span
						>{/if}
				</div>
				<h3>{selected.title}</h3>
				<p>{selected.author}</p>
			</section>
		{/if}
	{:else}
		<div class="empty-shelf">
			<p>No books match that search.</p>
			<button onclick={() => (query = '')}>Show all books</button>
		</div>
	{/if}
</div>

<style>
	.bookcase {
		min-width: 0;
	}
	.shelf-tools {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 20px;
		margin-bottom: 20px;
	}
	label {
		display: grid;
		gap: 8px;
		width: min(320px, 75%);
		font: 10px/1.5 var(--font-mono);
		color: #aaa99d;
	}
	input {
		min-width: 0;
		width: 100%;
		padding: 10px 12px;
		border: 1px solid #60655d;
		border-radius: 0;
		background: #1a1d20;
		color: #dfd9c9;
		font: 17px/1.3 var(--font-body);
	}
	input::placeholder {
		color: #8f9186;
	}
	.volume-count {
		padding-bottom: 10px;
		color: #aaa99d;
		white-space: nowrap;
		font: 10px/1.5 var(--font-mono);
	}
	.shelf {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(44px, 1fr));
		grid-auto-rows: 248px;
		align-items: end;
		column-gap: 6px;
		row-gap: 24px;
		list-style: none;
		padding: 0 5px 24px;
		margin: 0;
		background: repeating-linear-gradient(
			to bottom,
			transparent 0 242px,
			#737164 242px 244px,
			#111619 244px 248px,
			transparent 248px 272px
		);
	}
	.shelf li {
		display: flex;
		justify-content: center;
		min-width: 0;
		margin: 0;
		padding: 0 0 6px;
	}
	.spine {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 8px;
		width: 100%;
		max-width: 72px;
		height: var(--spine-height);
		padding: 16px 6px 28px;
		border: 1px solid #a69a7655;
		border-radius: 2px 3px 0 0;
		color: #e8dec5;
		background: linear-gradient(90deg, #0006, transparent 15%, #ffffff08 75%, #0005), var(--cloth);
		box-shadow:
			3px 0 3px #0005,
			inset 3px 0 #ffffff0b;
		cursor: pointer;
		transition:
			transform 180ms ease,
			border-color 180ms ease;
	}
	.spine::before {
		content: '';
		position: absolute;
		inset: 9px 5px;
		border-top: 1px solid #d4c39366;
		border-bottom: 1px solid #d4c39366;
		pointer-events: none;
	}
	.spine:hover,
	.spine:focus-visible,
	.spine[aria-pressed='true'] {
		transform: translateY(-8px);
		border-color: #d4c393;
	}
	.spine:focus-visible {
		outline: 2px solid #e8dec5;
		outline-offset: 4px;
	}
	.spine-title,
	.spine-author {
		writing-mode: vertical-rl;
		transform: rotate(180deg);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-height: 100%;
	}
	.spine-title {
		font: 19px/1 var(--font-body);
	}
	.spine-author {
		font: 8px/1 var(--font-mono);
		opacity: 0.7;
	}
	.volume-number {
		position: absolute;
		bottom: 12px;
		left: 0;
		right: 0;
		font: 8px/1 var(--font-mono);
		opacity: 0.65;
	}
	.reading-desk {
		min-height: 145px;
		padding: 18px 0 0;
		border-top: 1px solid #60655d;
	}
	.desk-heading {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 13px;
		color: #aaa99d;
		font: 9px/1.5 var(--font-mono);
	}
	.reading-status {
		color: #d4c393;
	}
	.reading-desk h3 {
		margin: 0 0 7px;
		color: #dfd9c9;
		font: 29px/1.1 var(--font-body);
	}
	.reading-desk p {
		margin: 0;
		color: #aaa99d;
		font: 17px/1.5 var(--font-body);
	}
	.empty-shelf {
		padding: 48px 0;
		color: #aaa99d;
	}
	.empty-shelf button {
		padding: 8px 0;
		border: 0;
		border-bottom: 1px solid #d4c393;
		color: #d4c393;
		background: none;
		font: 13px/1.5 var(--font-mono);
	}
	@media (max-width: 450px) {
		.spine-author {
			display: none;
		}
		.spine-title {
			font-size: 18px;
		}
		.reading-desk h3 {
			font-size: 26px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.spine {
			transition: none;
		}
		.spine:hover,
		.spine:focus-visible,
		.spine[aria-pressed='true'] {
			transform: none;
		}
	}
</style>
