<script lang="ts">
	import { onMount, untrack } from 'svelte';

	import PaintedBackdrop from '$lib/art/PaintedBackdrop.svelte';
	import { dissolveCard } from '$lib/art/dissolveCard';
	import type { DissolveClock } from '$lib/art/NoiseDissolve';
	import { shuffled } from '$lib/art/shuffle';
	import { defaultPaintings, type Painting } from '$lib/art/collection';
	import type { PostPreview } from '$lib/posts';
	let { data }: { data: { recentPosts: PostPreview[]; paintingSeed: number } } = $props();
	// Keep this page's seed even if its server data is refreshed while reading.
	const paintingSeed = untrack(() => data.paintingSeed);
	const paintings = shuffled(defaultPaintings, paintingSeed);
	const latestPost = $derived(data.recentPosts[0]);
	const nextPost = $derived(data.recentPosts[1]);
	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			timeZone: 'UTC'
		});
	}
	let displayedPainting = $state<Painting | null>(null);
	let activeScene = $state(0);
	let paintingClock = $state.raw<DissolveClock>();
	let introContent: HTMLDivElement;
	let paintingContent: HTMLDivElement;
	let sideCardHeight = $state<number>();
	const currentPainting = $derived(displayedPainting ?? paintings[0]);
	const books = [
		['The Picture of Dorian Gray', 'Oscar Wilde'],
		['The Sickness unto Death', 'Søren Kierkegaard'],
		['Crime and Punishment', 'Fyodor Dostoyevsky'],
		['The Stranger', 'Albert Camus'],
		['The Myth of Sisyphus', 'Albert Camus']
	];
	onMount(() => {
		function sizeSideCards() {
			const cards = [introContent, paintingContent];
			sideCardHeight = Math.ceil(
				Math.max(
					...cards.map((content) => {
						const card = getComputedStyle(content.parentElement!);
						const copy = content.querySelector<HTMLElement>('.side-card-copy')!;
						const links = content.querySelector<HTMLElement>('.side-card-links')!;
						return (
							copy.getBoundingClientRect().height +
							links.getBoundingClientRect().height +
							parseFloat(getComputedStyle(content).rowGap) +
							parseFloat(card.paddingTop) +
							parseFloat(card.paddingBottom) +
							parseFloat(card.borderTopWidth) +
							parseFloat(card.borderBottomWidth)
						);
					})
				)
			);
		}
		const cardObserver =
			typeof ResizeObserver !== 'undefined' ? new ResizeObserver(sizeSideCards) : null;
		for (const content of [introContent, paintingContent]) {
			cardObserver?.observe(content.querySelector('.side-card-copy')!);
			cardObserver?.observe(content.querySelector('.side-card-links')!);
		}
		sizeSideCards();
		window.addEventListener('resize', sizeSideCards);
		return () => {
			window.removeEventListener('resize', sizeSideCards);
			cardObserver?.disconnect();
		};
	});
</script>

<svelte:head>
	<title>Rituparan Reddy — Journal</title>
	<meta name="description" content="Writing, books, and things built by Rituparan Reddy." />
</svelte:head>

<div
	class="journal-page"
	style:--side-card-height={sideCardHeight ? `${sideCardHeight}px` : undefined}
>
	<a class="skip" href="#writing">Skip to writing</a>
	<PaintedBackdrop
		collection={paintings}
		onchange={(painting, scene, clock) => {
			displayedPainting = painting;
			activeScene = scene;
			paintingClock = clock;
		}}
	/>

	<aside
		class="painting-label"
		aria-label="Current painting"
		use:dissolveCard={{ key: currentPainting.id, clock: paintingClock }}
	>
		<div class="side-card-content" bind:this={paintingContent}>
			<div class="side-card-copy">
				<p class="painting-name">{currentPainting.name}</p>
				<p class="painting-artist">{currentPainting.artist}</p>
				<p class="painting-meta">{currentPainting.year} / {currentPainting.style}</p>
			</div>
			<div class="side-card-links">
				<a href={currentPainting.source} target="_blank" rel="noreferrer">Source ↗</a>
			</div>
		</div>
	</aside>

	<header class="journal-header">
		<a class="signature" href="/">Rituparan Reddy<span class="cursor" aria-hidden="true">▮</span></a
		>
		<nav aria-label="Main navigation">
			<a href="#writing">Writing</a><a href="#books">Books</a><a href="#work">Work</a><a
				href="/resume">Résumé</a
			>
		</nav>
	</header>

	<aside
		class="intro-note"
		aria-label="About me"
		use:dissolveCard={{
			key: String(sideCardHeight ?? 0),
			clock: paintingClock,
			geometryOnly: true
		}}
	>
		<div class="side-card-content" bind:this={introContent}>
			<div class="side-card-copy">
				<p class="intro-name">Rituparan Reddy.</p>
				<p>
					Computer science student at Rutgers. I work on robotics, agentic systems, and developer
					tools.
				</p>
			</div>
			<div class="side-card-links">
				<a href="https://github.com/ARandomNeko">GitHub</a><a
					href="mailto:rituparanreddy2006@gmail.com">Email</a
				>
			</div>
		</div>
	</aside>

	<main class="journal-pages" id="writing">
		<section
			class="chapter opening"
			data-scene="0"
			data-focused={activeScene === 0}
			aria-labelledby="first-title"
		>
			<div class="sheet">
				<div class="window-bar"><span>Writing</span><a href="/blog">Index ↗</a></div>
				<article>
					{#if latestPost}
						<time datetime={latestPost.metadata.date}>{formatDate(latestPost.metadata.date)}</time>
						<h1 id="first-title">
							<a href={`/blog/${latestPost.slug}`}>{latestPost.metadata.title}</a>
						</h1>
						<p>{latestPost.metadata.description}</p>
						<a class="read-link" href={`/blog/${latestPost.slug}`}>Read entry</a>
					{/if}
				</article>
			</div>
		</section>

		<section
			class="chapter"
			id="books"
			data-scene="1"
			data-focused={activeScene === 1}
			aria-labelledby="books-title"
		>
			<div class="sheet books-sheet">
				<div class="window-bar"><span>Books</span><a href="/reading">Index ↗</a></div>
				<h2 id="books-title">Books</h2>
				<ul class="book-list">
					{#each books as [title, author]}
						<li>
							<span class="book-title">{title}</span><span class="book-author">{author}</span>
						</li>
					{/each}
				</ul>
				<a class="read-link" href="/reading">The reading list</a>
			</div>
		</section>

		<section
			class="chapter"
			id="work"
			data-scene="2"
			data-focused={activeScene === 2}
			aria-labelledby="work-title"
		>
			<div class="sheet work-sheet">
				<div class="window-bar"><span>Work</span><a href="/projects">Index ↗</a></div>
				<article>
					{#if nextPost}
						<time datetime={nextPost.metadata.date}>{formatDate(nextPost.metadata.date)}</time>
						<h2 id="work-title">
							<a href={`/blog/${nextPost.slug}`}>{nextPost.metadata.title}</a>
						</h2>
						<p>{nextPost.metadata.description}</p>
						<a class="read-link" href={`/blog/${nextPost.slug}`}>Read entry</a>
					{/if}
				</article>
				<div class="further-work">
					{#each data.recentPosts.slice(2) as post}
						<a href={`/blog/${post.slug}`}>{post.metadata.title}</a>
					{/each}
					<a class="read-link" href="/projects">All projects</a>
				</div>
			</div>
		</section>

		<section
			class="chapter closing"
			data-scene="3"
			data-focused={activeScene === 3}
			aria-labelledby="elsewhere-title"
		>
			<div class="sheet colophon">
				<h2 id="elsewhere-title">Elsewhere</h2>
				<div class="elsewhere-links">
					<a href="https://github.com/ARandomNeko">GitHub</a><a href="/resume">About me</a><a
						href="/blog">All entries</a
					>
				</div>
				<details>
					<summary>The paintings</summary>
					<ul>
						{#each paintings as painting}<li>
								<a href={painting.source}>{painting.name}</a><span
									>{painting.artist}, {painting.year}</span
								>
								{#if painting.license && painting.licenseUrl}
									<span
										>{painting.imageCredit || painting.artist} ·
										<a href={painting.licenseUrl}>{painting.license}</a> · Resized for display.</span
									>
								{/if}
							</li>{/each}
					</ul>
				</details>
				<footer>
					<a href="#writing">Back to top ↑</a>
				</footer>
			</div>
		</section>
	</main>
</div>

<style>
	:global(html:has(.journal-page)) {
		scroll-padding-top: 40px;
	}
	:global(body:has(.journal-page)) {
		overflow: auto;
		background: #625f69;
	}
	.journal-page {
		--paper: #e7e4df;
		--ink: #2d3139;
		position: relative;
		isolation: isolate;
		color: var(--ink);
		font-family: var(--font-body);
	}
	.journal-page a {
		color: inherit;
	}
	.journal-page a:hover {
		text-decoration: underline;
	}
	.journal-page :focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 6px;
	}
	.journal-header {
		height: 114px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 5.2%;
		color: #fff8ed;
		text-shadow: 0 1px 8px #25252b88;
	}
	.signature {
		font:
			30px/1 'Instrument Serif',
			Georgia,
			serif;
		text-decoration: none;
	}
	nav {
		display: flex;
		gap: 32px;
		font-size: 15px;
	}
	nav a {
		text-decoration: none;
		padding: 10px 0;
	}
	.journal-pages {
		padding-top: clamp(70px, 15vh, 180px);
	}
	.chapter {
		width: min(590px, 46%);
		margin-left: 46%;
		position: relative;
		scroll-margin-top: 55px;
	}
	.sheet {
		position: relative;
		background: var(--paper);
		padding: 64px 66px 48px;
	}
	.sheet::before {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		left: -3px;
		width: 3px;
		background: radial-gradient(var(--paper) 0.8px, transparent 1px) 0 0 / 2px 3px;
	}
	.opening .sheet {
		padding-top: 61px;
	}
	time {
		display: block;
		font:
			11px/1.5 'Courier New',
			monospace;
		color: #62616a;
	}
	h1,
	h2 {
		font-family: 'Instrument Serif', Georgia, serif;
		font-weight: 400;
		letter-spacing: -0.035em;
	}
	h1 {
		font-size: clamp(70px, 6.8vw, 106px);
		line-height: 0.94;
		margin: 27px 0 38px;
	}
	h1 a,
	h2 a {
		text-decoration: none;
	}
	h2 {
		font-size: clamp(56px, 5.5vw, 78px);
		line-height: 1;
		margin: 0 0 38px;
	}
	p {
		font-size: 17px;
		line-height: 1.85;
		margin: 0 0 22px;
	}
	.read-link {
		display: inline-block;
		font-size: 14px;
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 5px;
		margin-top: 8px;
	}
	.books-sheet {
		padding-top: 110px;
		padding-bottom: 120px;
		background: #e4e0dd;
	}
	.book-list {
		list-style: none;
		margin: 0 0 40px;
		padding: 0;
	}
	.book-list li {
		padding-bottom: 27px;
	}
	.book-title {
		display: block;
		font:
			31px/1.15 'Instrument Serif',
			Georgia,
			serif;
	}
	.book-author {
		display: block;
		font-size: 13px;
		margin-top: 7px;
		color: #66626a;
	}
	.work-sheet {
		background: #e1dfdb;
		padding-top: 110px;
		padding-bottom: 100px;
	}
	.work-sheet h2 {
		margin-top: 28px;
	}
	.further-work {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 22px;
		margin-top: 80px;
	}
	.further-work > a:not(.read-link) {
		font:
			30px/1.15 'Instrument Serif',
			Georgia,
			serif;
		text-decoration: none;
	}
	.closing {
		padding-top: 150px;
		padding-bottom: 80px;
	}
	.colophon {
		padding-top: 56px;
		padding-bottom: 30px;
	}
	.colophon h2 {
		font-size: 50px;
		margin-bottom: 25px;
	}
	.elsewhere-links {
		display: flex;
		flex-wrap: wrap;
		gap: 23px;
		font-size: 14px;
	}
	details {
		margin-top: 50px;
		font-size: 13px;
	}
	summary {
		cursor: pointer;
		text-underline-offset: 5px;
	}
	details ul {
		list-style: none;
		padding: 20px 0 0;
	}
	details li {
		margin-bottom: 16px;
	}
	details li span {
		display: block;
		color: #66626a;
		font-size: 12px;
	}
	footer {
		display: flex;
		justify-content: space-between;
		gap: 20px;
		margin-top: 50px;
		font:
			10px/1.6 'Courier New',
			monospace;
	}
	footer a {
		text-decoration: none;
	}
	.skip {
		position: fixed;
		top: -100px;
		left: 20px;
		z-index: 4;
		padding: 14px;
		background: var(--paper);
	}
	.skip:focus {
		top: 20px;
	}
	@media (min-width: 1600px) {
		.chapter {
			margin-left: 49%;
			width: 620px;
		}
		.sheet {
			padding-left: 76px;
			padding-right: 76px;
		}
	}
	@media (max-width: 1000px) {
		.chapter {
			width: 53%;
			margin-left: 41%;
		}
		.sheet {
			padding-left: 38px;
			padding-right: 38px;
		}
	}
	@media (max-width: 650px) {
		.journal-header {
			height: 96px;
			padding: 0 24px;
			align-items: flex-start;
			padding-top: 27px;
		}
		.signature {
			font-size: 26px;
			max-width: 120px;
			line-height: 1;
		}
		nav {
			gap: 17px;
			font-size: 13px;
			padding-top: 6px;
		}
		.journal-pages {
			padding-top: 24svh;
		}
		.chapter {
			width: calc(100% - 42px);
			margin-left: 21px;
			scroll-margin-top: 24px;
		}
		.sheet {
			padding: 42px 30px;
		}
		.opening .sheet {
			padding-top: 40px;
		}
		h1 {
			font-size: 76px;
			margin-top: 24px;
			margin-bottom: 30px;
		}
		h2 {
			font-size: 64px;
		}
		p {
			font-size: 16px;
			line-height: 1.85;
		}
		.books-sheet,
		.work-sheet {
			padding-top: 70px;
			padding-bottom: 70px;
		}
		.book-title {
			font-size: 29px;
		}
		.closing {
			padding-top: 180px;
			padding-bottom: 24px;
		}
		.colophon h2 {
			font-size: 45px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		:global(html:has(.journal-page)) {
			scroll-behavior: auto;
		}
	}

	/* Dark hypertext windows; the paintings remain the desktop. */
	.journal-page {
		--paper: #202225;
		--ink: #dfd9c9;
	}
	.journal-header {
		position: sticky;
		top: 0;
		z-index: 5;
		height: 55px;
		padding: 0 30px;
		background: #202225;
		border-bottom: 1px solid #77786d;
		box-shadow: 0 3px #121518;
		text-shadow: none;
		color: #dfd9c9;
	}
	.signature {
		font:
			19px/1 'Instrument Serif',
			Georgia,
			serif;
		letter-spacing: 0.02em;
	}
	.cursor {
		margin-left: 12px;
		font: 12px monospace;
		color: #a9a28a;
	}
	nav {
		gap: 28px;
		font:
			11px/1.5 'JetBrains Mono',
			monospace;
	}
	.journal-pages {
		padding-top: 18vh;
	}
	.chapter {
		margin-left: 48%;
		width: min(570px, 46%);
		margin-bottom: 130px;
	}
	.sheet {
		padding: 70px 49px 47px;
		border: 1px solid #878779;
		background: #202225;
		box-shadow: 7px 7px 0 #11161980;
		transition:
			border-color 760ms ease,
			box-shadow 760ms ease;
	}
	.chapter[data-focused='true'] .sheet {
		border-color: #c1b58f;
		box-shadow:
			7px 7px 0 #11161980,
			0 0 0 1px #c1b58f33;
	}
	.chapter[data-focused='true'] .window-bar {
		background: #414139;
		color: #f0e3bc;
	}
	.sheet::before {
		left: -7px;
		width: 5px;
		background: repeating-conic-gradient(#9f9c89 0% 25%, transparent 0% 50%) 0 0 / 3px 3px;
		opacity: 0.65;
	}
	.window-bar {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 29px;
		background: #35383a;
		border-bottom: 1px solid #878779;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 12px;
		font:
			10px/1 'JetBrains Mono',
			monospace;
		color: #ddd8c8;
	}
	.window-bar a {
		text-decoration: none;
	}
	.opening .sheet {
		padding-top: 70px;
	}
	time {
		font:
			10px/1.5 'JetBrains Mono',
			monospace;
		color: #aaa99d;
	}
	h1 {
		font-size: clamp(54px, 5.2vw, 76px);
		line-height: 1;
		margin: 23px 0 30px;
	}
	h2 {
		font-size: 57px;
		margin-bottom: 32px;
	}
	p {
		font-size: 16px;
		line-height: 1.85;
		color: #ccc9bc;
	}
	.read-link {
		font:
			11px/1.8 'JetBrains Mono',
			monospace;
		color: #d4c393 !important;
	}
	.books-sheet,
	.work-sheet {
		padding-top: 70px;
		padding-bottom: 55px;
		background: #202225;
	}
	.book-title {
		font-size: 29px;
	}
	.book-author {
		font:
			11px/1.6 'JetBrains Mono',
			monospace;
		color: #aaa99d;
	}
	.further-work {
		margin-top: 50px;
		padding-top: 25px;
		border-top: 1px solid #565b56;
	}
	.further-work > a:not(.read-link) {
		font-size: 25px;
	}
	.closing {
		padding-top: 0;
		padding-bottom: 70px;
		margin-bottom: 0;
	}
	.colophon {
		padding-top: 43px;
	}
	.colophon h2 {
		font-size: 43px;
	}
	details li span {
		color: #aaa99d;
	}
	.elsewhere-links,
	details {
		font:
			11px/1.8 'JetBrains Mono',
			monospace;
	}
	@media (min-width: 1600px) {
		.chapter {
			margin-left: 49%;
			width: 610px;
		}
	}
	@media (max-width: 1000px) {
		.chapter {
			margin-left: 39%;
			width: 56%;
		}
		.sheet {
			padding-left: 34px;
			padding-right: 34px;
		}
	}
	@media (max-width: 650px) {
		.journal-header {
			height: 54px;
			padding: 0 17px;
			align-items: center;
		}
		.signature {
			max-width: none;
			font-size: 18px;
		}
		.cursor {
			display: none;
		}
		nav {
			padding: 0;
			gap: 15px;
			font-size: 10px;
		}
		.journal-pages {
			padding-top: 30svh;
		}
		.chapter {
			margin-left: 17px;
			width: calc(100% - 34px);
			margin-bottom: 130px;
		}
		.sheet {
			padding: 65px 27px 38px;
		}
		.opening .sheet {
			padding-top: 65px;
		}
		h1 {
			font-size: 60px;
			margin-bottom: 26px;
		}
		h2 {
			font-size: 53px;
		}
		p {
			font-size: 16px;
		}
		.book-title {
			font-size: 29px;
		}
		.colophon {
			padding-top: 35px;
		}
		.closing {
			margin-bottom: 0;
			padding-bottom: 30px;
		}
	}

	.intro-note {
		position: fixed;
		top: calc(55px + clamp(24px, 6vh, 72px));
		left: 5%;
		width: min(330px, 31%);
		padding: 20px 23px 16px;
		background: #202225;
		border: 1px solid #77786d;
		z-index: 2;
	}
	.intro-note p {
		font-size: 15px;
		line-height: 1.75;
		margin-bottom: 18px;
	}
	.intro-note .side-card-links {
		display: flex;
		gap: 23px;
		font:
			10px/1.7 'JetBrains Mono',
			monospace;
		color: #d4c393;
		justify-content: space-between;
	}
	@media (max-width: 650px) {
		.journal-header {
			flex-wrap: wrap;
			height: 82px;
			justify-content: space-between;
			padding: 13px 17px;
			gap: 12px;
		}
		.journal-header nav {
			width: 100%;
			justify-content: space-between;
		}
		.intro-note {
			top: 94px;
			left: 17px;
			right: 17px;
			width: auto;
			margin: 0;
			padding: 11px 15px 10px;
		}
		.intro-note p {
			font-size: 13px;
			line-height: 1.65;
			margin-bottom: 12px;
		}
		.journal-pages {
			padding-top: calc(var(--side-card-height, 150px) + 40px);
		}
	}

	.painting-label {
		position: fixed;
		bottom: 28px;
		left: 5%;
		width: min(330px, 31%);
		padding: 20px 23px 16px;
		background: #202225;
		border: 1px solid #77786d;
		z-index: 2;
	}
	.painting-label p {
		margin: 0;
	}
	.painting-label .painting-name,
	.intro-note .intro-name {
		font:
			27px/1.1 'Instrument Serif',
			Georgia,
			serif;
		color: #dfd9c9;
		margin-bottom: 13px;
	}
	.painting-label .painting-artist {
		font:
			12px/1.6 'JetBrains Mono',
			monospace;
	}
	.painting-label .painting-meta {
		font:
			10px/1.8 'JetBrains Mono',
			monospace;
		color: #aaa99d;
		margin-top: 4px;
	}
	.painting-label .side-card-links {
		display: flex;
		justify-content: space-between;
		gap: 20px;
		margin-top: 17px;
		font:
			10px/1.7 'JetBrains Mono',
			monospace;
		color: #d4c393;
	}
	@media (max-width: 650px) {
		.painting-label {
			left: 17px;
			right: 17px;
			bottom: 12px;
			width: auto;
			padding: 11px 15px 10px;
		}
		.painting-label .painting-name {
			font-size: 20px;
			margin-bottom: 5px;
		}
		.intro-note .intro-name {
			font-size: 20px;
			margin-bottom: 5px;
		}
		.painting-label .painting-artist {
			display: inline;
			font-size: 9px;
		}
		.painting-label .painting-meta {
			display: inline;
			font-size: 9px;
			margin-left: 8px;
		}
		.painting-label .side-card-links {
			margin-top: 7px;
			font-size: 9px;
		}
		.journal-pages {
			padding-bottom: calc(var(--side-card-height, 135px) + 24px);
		}
		.chapter {
			scroll-margin-top: 100px;
		}
	}
	.intro-note,
	.painting-label {
		box-sizing: border-box;
		height: var(--side-card-height, auto);
	}
	.side-card-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		gap: 18px;
	}
	.side-card-copy {
		display: flow-root;
		flex-shrink: 0;
	}
	.intro-note .side-card-copy > p:last-child {
		margin-bottom: 0;
	}
	.intro-note .side-card-links,
	.painting-label .side-card-links {
		flex-shrink: 0;
		margin-top: auto;
	}
	@media (max-width: 650px) {
		.side-card-content {
			gap: 12px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.sheet {
			transition: none;
		}
	}
</style>
