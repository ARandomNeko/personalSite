<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount, untrack } from 'svelte';
	import { featuredBooks } from '#lib/books.js';

	import PaintedBackdrop from '#lib/art/PaintedBackdrop.svelte';
	import { dissolveCard } from '#lib/art/dissolveCard.js';
	import type { DissolveClock } from '#lib/art/NoiseDissolve.js';
	import { resolvePaintings, type Painting } from '#lib/art/collection.js';
	import { randomart } from '#lib/art/randomart.js';
	import type { PostPreview } from '#lib/posts.js';
	let { data }: { data: { recentPosts: PostPreview[]; paintingOrder: string[] } } = $props();
	// Keep this visit's dealt order even if server data refreshes while reading.
	const paintings = resolvePaintings(untrack(() => data.paintingOrder));
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

	onMount(() => {
		console.info(
			`%c${randomart(crypto.getRandomValues(new Uint8Array(32)))}`,
			'color: #d4c393; background: #202225; padding: 16px; font-family: monospace; line-height: 1.8'
		);
		function sizeSideCards() {
			// Phone panels have independent sizes: the introduction scrolls with the page.
			if (matchMedia('(max-width: 650px)').matches) {
				sideCardHeight = undefined;
				return;
			}
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
				<a href={currentPainting.source} target="_blank" rel="external noreferrer">Source ↗</a>
			</div>
		</div>
	</aside>

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
				<div class="window-bar"><span>Writing</span><a href={resolve('/blog')}>Index ↗</a></div>
				<article>
					{#if latestPost}
						<time datetime={latestPost.metadata.date}>{formatDate(latestPost.metadata.date)}</time>
						<h1 id="first-title">
							<a href={resolve('/blog/[slug]', { slug: latestPost.slug })}
								>{latestPost.metadata.title}</a
							>
						</h1>
						<p>{latestPost.metadata.description}</p>
						<a class="read-link" href={resolve('/blog/[slug]', { slug: latestPost.slug })}
							>Read entry</a
						>
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
				<div class="window-bar"><span>Library</span><a href={resolve('/reading')}>Index ↗</a></div>
				<h2 id="books-title">Library</h2>
				<ul class="featured-books" aria-label="Featured books">
					{#each featuredBooks as book (book.id)}
						<li><span>{book.title}</span><span>{book.author}</span></li>
					{/each}
				</ul>
				<a class="read-link" href={resolve('/reading')}>Explore the library ↗</a>
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
				<div class="window-bar"><span>Work</span><a href={resolve('/projects')}>Index ↗</a></div>
				<article>
					{#if nextPost}
						<time datetime={nextPost.metadata.date}>{formatDate(nextPost.metadata.date)}</time>
						<h2 id="work-title">
							<a href={resolve('/blog/[slug]', { slug: nextPost.slug })}
								>{nextPost.metadata.title}</a
							>
						</h2>
						<p>{nextPost.metadata.description}</p>
						<a class="read-link" href={resolve('/blog/[slug]', { slug: nextPost.slug })}
							>Read entry</a
						>
					{/if}
				</article>
				<div class="further-work">
					{#each data.recentPosts.slice(2) as post (post.slug)}
						<a href={resolve('/blog/[slug]', { slug: post.slug })}>{post.metadata.title}</a>
					{/each}
					<a class="read-link" href={resolve('/projects')}>All projects</a>
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
					<a href="https://github.com/ARandomNeko">GitHub</a><a href={resolve('/resume')}
						>About me</a
					><a href={resolve('/blog')}>All entries</a>
				</div>
				<details>
					<summary>The paintings</summary>
					<ul>
						{#each paintings as painting (painting.id)}<li>
								<a href={painting.source} rel="external">{painting.name}</a><span
									>{painting.artist}, {painting.year}</span
								>
								{#if painting.license && painting.licenseUrl}
									<span
										>{painting.imageCredit || painting.artist} ·
										<a href={painting.licenseUrl} rel="external">{painting.license}</a> · Resized for
										display.</span
									>
								{/if}
							</li>{/each}
					</ul>
				</details>
			</div>
		</section>
	</main>
</div>

<style>
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
	.featured-books {
		list-style: none;
		padding: 0;
		margin: 0 0 28px;
		display: grid;
		gap: 22px;
	}
	.featured-books li > span:first-child {
		display: block;
		font: 28px/1.15 var(--font-serif);
	}
	.featured-books li > span:last-child {
		display: block;
		margin-top: 5px;
		color: #aaa99d;
		font: 16px/1.5 var(--font-body);
	}
	.books-sheet {
		padding-top: 110px;
		padding-bottom: 120px;
		background: #e4e0dd;
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
		.journal-page {
			padding-top: 28px;
		}
		.intro-note {
			position: relative;
			top: auto;
			left: auto;
			right: auto;
			width: calc(100% - 40px);
			height: auto;
			margin: 0 20px 48px;
			padding: 24px;
			border: 0;
			background: #202225f2;
			z-index: auto;
		}
		.intro-note .intro-name {
			font-size: 34px;
			margin-bottom: 16px;
		}
		.intro-note p {
			font-size: 17px;
			line-height: 1.6;
		}
		.intro-note .side-card-links {
			justify-content: flex-start;
			gap: 28px;
		}
		.intro-note .side-card-links a {
			display: inline-flex;
			align-items: center;
			min-height: 44px;
		}
		.journal-pages {
			padding-top: 0;
			padding-bottom: calc(100px + env(safe-area-inset-bottom, 0px));
		}
		.chapter {
			width: calc(100% - 40px);
			margin-left: 20px;
			margin-bottom: 64px;
			scroll-margin-top: 80px;
		}
		.sheet,
		.opening .sheet {
			padding: 64px 24px 28px;
			box-shadow: none;
		}
		.sheet::before {
			display: none;
		}
		.chapter[data-focused='true'] .sheet {
			box-shadow: none;
		}
		.window-bar {
			height: 40px;
		}
		h1 {
			font-size: clamp(38px, 11vw, 48px);
			line-height: 1.05;
			margin: 20px 0;
		}
		h2 {
			font-size: 42px;
			line-height: 1.08;
			margin-bottom: 24px;
		}
		p {
			font-size: 17px;
			line-height: 1.65;
		}
		.read-link {
			min-height: 44px;
			padding-block: 12px;
		}
		.featured-books li > span:first-child {
			font-size: 26px;
		}
		.further-work {
			margin-top: 28px;
		}
		.colophon {
			padding-top: 28px;
		}
		.closing {
			margin-bottom: 0;
			padding-bottom: 0;
		}
		.painting-label {
			left: 12px;
			right: 12px;
			bottom: calc(10px + env(safe-area-inset-bottom, 0px));
			width: auto;
			height: auto;
			padding: 10px 14px;
		}
		.painting-label .side-card-content {
			flex-direction: row;
			align-items: center;
			gap: 14px;
		}
		.painting-label .side-card-copy {
			flex: 1;
			min-width: 0;
		}
		.painting-label .painting-name {
			font-size: 20px;
			line-height: 1.2;
			margin-bottom: 4px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.painting-label .painting-artist {
			display: block;
			font-size: 9px;
		}
		.painting-label .painting-meta {
			display: none;
		}
		.painting-label .side-card-links {
			margin-top: 0;
		}
		.painting-label .side-card-links a {
			display: flex;
			align-items: center;
			min-height: 44px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.sheet {
			transition: none;
		}
	}
</style>
