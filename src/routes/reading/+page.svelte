<script lang="ts">
	import BookShelf from '$lib/components/BookShelf.svelte';
	import { readingGroups, readingGroup, type Book, type ReadingGroup } from '$lib/books';
	let { data }: { data: { books: Book[] } } = $props();
	let activeGroup = $state<ReadingGroup>('reading');
	const groups = $derived(
		readingGroups.map((group) => ({
			...group,
			books: data.books.filter((book) => readingGroup(book) === group.id)
		}))
	);
	function switchGroup(event: KeyboardEvent, index: number) {
		let next: number;
		if (event.key === 'ArrowRight') next = (index + 1) % groups.length;
		else if (event.key === 'ArrowLeft') next = (index - 1 + groups.length) % groups.length;
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = groups.length - 1;
		else return;
		event.preventDefault();
		activeGroup = groups[next].id;
		(event.currentTarget as HTMLButtonElement)
			.parentElement!.querySelectorAll<HTMLButtonElement>('button')
			[next]?.focus();
	}
</script>

<svelte:head>
	<title>Library | Rituparan Reddy</title>
	<meta
		name="description"
		content="What I'm reading, books I own or plan to read, and books I've finished."
	/>
</svelte:head>

<section class="library" aria-labelledby="library-title">
	<header class="library-heading">
		<p class="eyebrow">Literature &amp; philosophy</p>
		<h1 id="library-title">The library.</h1>
		<p class="introduction">What I'm reading, what's waiting, and what I've finished.</p>
	</header>
	<div class="reading-groups" role="tablist" aria-label="Reading groups">
		{#each groups as group, index}
			<button
				role="tab"
				id={`tab-${group.id}`}
				aria-controls={`group-${group.id}`}
				aria-selected={activeGroup === group.id}
				tabindex={activeGroup === group.id ? 0 : -1}
				onclick={() => (activeGroup = group.id)}
				onkeydown={(event) => switchGroup(event, index)}
			>
				<span class="group-label">{group.label}</span><span class="group-count"
					>{group.books.length}</span
				>
			</button>
		{/each}
	</div>
	{#each groups as group}
		<div
			role="tabpanel"
			id={`group-${group.id}`}
			aria-labelledby={`tab-${group.id}`}
			hidden={activeGroup !== group.id}
			tabindex="0"
		>
			{#if activeGroup === group.id}
				<p class="group-caption">{group.caption}</p>
				{#if group.books.length}
					<BookShelf books={group.books} searchable />
				{:else}
					<p class="empty-group">No books listed in this group yet.</p>
				{/if}
			{/if}
		</div>
	{/each}
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
	.reading-groups {
		display: flex;
		margin: 0 0 24px;
		border-bottom: 1px solid #60655d;
	}
	.reading-groups button {
		display: flex;
		align-items: center;
		gap: 10px;
		flex: 1;
		padding: 15px 8px;
		border: 0;
		border-bottom: 2px solid transparent;
		color: #aaa99d;
		background: transparent;
		text-align: left;
		font: 11px/1.5 var(--font-mono);
	}
	.reading-groups button:hover,
	.reading-groups button[aria-selected='true'] {
		color: #e8dec5;
		background: #d4c3930a;
	}
	.reading-groups button[aria-selected='true'] {
		border-bottom-color: #d4c393;
	}
	.group-count {
		margin-left: auto;
		color: #a9a28a;
		font-size: 10px;
	}
	.group-caption {
		margin: 0 0 20px;
		color: #d4c393;
		font: 10px/1.5 var(--font-mono);
	}
	[role='tabpanel']:focus-visible {
		outline: 1px solid #d4c393;
		outline-offset: 8px;
	}
	.empty-group {
		padding: 40px 0;
		color: #aaa99d;
	}
	@media (max-width: 650px) {
		.library {
			padding: 8px 4px;
		}
		.introduction {
			font-size: 18px;
		}
		.reading-groups button {
			flex-direction: column;
			align-items: flex-start;
			gap: 5px;
			padding: 12px 6px;
			font-size: 10px;
		}
		.group-count {
			margin-left: 0;
		}
	}
</style>
