<script lang="ts">
	import { page } from '$app/stores';
	import '../app.css';
	import SiteHeader from '$lib/components/SiteHeader.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta
		name="description"
		content="Rituparan Reddy’s personal collection of code, robotics, literature, and writing."
	/>
	<meta name="author" content="Rituparan Reddy" />
	<meta property="og:site_name" content="Rituparan Reddy" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Rituparan Reddy" />
	<meta
		property="og:description"
		content="Developer, builder, and reader. Projects, reading notes, and writing."
	/>
	<meta property="og:url" content={$page.url.origin + $page.url.pathname} />
	<meta name="twitter:card" content="summary" />
	<link
		rel="preload"
		href="/fonts/ETBembo-Regular.woff"
		as="font"
		type="font/woff"
		crossorigin="anonymous"
	/>
	<link rel="canonical" href={$page.url.origin + $page.url.pathname} />
</svelte:head>

<div class="site-root">
	<SiteHeader />
	{#if $page.url.pathname === '/'}
		{@render children()}
	{:else}
		<div
			class="site-shell"
			class:library-shell={$page.url.pathname === '/reading'}
			class:resume-shell={$page.url.pathname === '/resume'}
			class:journal-shell={$page.url.pathname === '/blog'}
		>
			<main class="html-content">{@render children()}</main>
		</div>
	{/if}
</div>

<style>
	:global(body:has(.site-shell)) {
		overflow: auto;
	}
	.site-shell {
		--bg: #202225;
		--tx: #dfd9c9;
		--tx-1: #dfd9c9;
		--tx-2: #aaa99d;
		--ui: #303435;
		--ui-3: #60655d;
		--border: #60655d;
		--cy: #d4c393;
		--re: #dfd9c9;
		--tag-bg: #303435;
		--tag-tx: #d4c393;
		min-height: calc(100dvh - var(--site-header-height));
		height: auto;
		color: var(--tx);
		background:
			linear-gradient(#141a1f44, #141a1f44),
			url('/paintings/turner-moonlight.jpg') center/cover fixed;
	}
	.html-content {
		flex: initial;
		overflow: visible;
		width: min(850px, calc(100% - 40px));
		margin: 70px auto;
		padding: 35px;
		background: #202225;
		border: 1px solid #878779;
		box-shadow: 7px 7px #11161980;
	}
	.html-content :global(.prose) {
		font-family: var(--font-body);
		font-size: 18px;
		line-height: 1.9;
	}
	.resume-shell,
	.journal-shell {
		isolation: isolate;
		background: transparent;
	}
	.resume-shell .html-content,
	.journal-shell .html-content {
		width: 100%;
		margin: 0;
		padding: 0;
		background: transparent;
		border: 0;
		box-shadow: none;
	}
	.library-shell {
		isolation: isolate;
		background: transparent;
	}
	.library-shell .html-content {
		width: min(1180px, calc(100% - 100px));
		margin: 64px auto 48px;
		padding: 16px 0;
		background: transparent;
		border: 0;
		box-shadow: none;
	}
	@media (max-width: 1000px) {
		.library-shell .html-content {
			width: calc(100% - 72px);
		}
	}
	@media (max-width: 760px) {
		.library-shell .html-content {
			width: calc(100% - 48px);
			margin: 38px auto;
			padding: 0;
		}
	}
	@media (max-width: 640px) {
		.html-content {
			margin: 35px auto;
			padding: 23px 12px;
			width: calc(100% - 30px);
		}
		.html-content :global(.prose) {
			font-size: 16px;
		}
	}
</style>
