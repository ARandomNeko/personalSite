<script lang="ts">
	import BookShelf from '$lib/components/BookShelf.svelte';
	import type { Book } from '$lib/books';
	let { data }: { data: { books: Book[] } } = $props();
</script>

<svelte:head>
	<title>Library | Rituparan Reddy</title>
	<meta
		name="description"
		content="A shelf of literature, philosophy, and books on my reading list."
	/>
</svelte:head>

<section class="library" aria-labelledby="library-title">
	<header class="library-heading">
		<p class="eyebrow">Literature &amp; philosophy</p>
		<h1 id="library-title">The library.</h1>
		<p class="introduction">
			Literature, philosophy, and the reading list. Pick a spine to look closer.
		</p>
	</header>
	<BookShelf books={data.books} searchable />
</section>

<style>
	.library {
		padding: 12px 0 18px;
	}
	.library-heading {
		margin-bottom: 28px;
	}
	.eyebrow {
		margin: 0 0 16px;
		color: #aaa99d;
		font: 10px/1.5 var(--font-mono);
	}
	h1 {
		margin: 0 0 16px;
		font: clamp(44px, 6vw, 66px) / 1 var(--font-serif);
		color: #dfd9c9;
	}
	.introduction {
		max-width: 45ch;
		margin: 0;
		color: #aaa99d;
		font: 19px/1.6 var(--font-body);
	}
	@media (max-width: 650px) {
		.library {
			padding: 8px 4px;
		}
		.introduction {
			font-size: 18px;
		}
	}
</style>
