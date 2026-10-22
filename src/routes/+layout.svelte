<script lang="ts">
	import { page } from '$app/stores';
	import '../app.css';

	let { children } = $props();
	const sections = [
		{ href: '/projects', label: 'Work' },
		{ href: '/reading', label: 'Library' },
		{ href: '/blog', label: 'Journal' },
		{ href: '/resume', label: 'Résumé' }
	];
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

{#if $page.url.pathname === '/'}
	{@render children()}
{:else}
	<div class="site-shell">
		<header class="site-header">
			<a class="wordmark" href="/" aria-label="Rituparan Reddy’s journal">Rituparan Reddy</a>
			<nav aria-label="Main navigation">
				{#each sections as section}
					<a
						href={section.href}
						aria-current={$page.url.pathname.startsWith(section.href) ? 'page' : undefined}
						>{section.label}</a
					>
				{/each}
			</nav>
		</header>
		<main class="html-content">{@render children()}</main>
		<footer class="site-footer">
			<span>Rituparan Reddy / {new Date().getFullYear()}</span><a href="/">Return to the journal</a>
		</footer>
	</div>
{/if}

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
		min-height: 100dvh;
		height: auto;
		color: var(--tx);
		background:
			linear-gradient(#141a1f44, #141a1f44),
			url('/paintings/turner-moonlight.jpg') center/cover fixed;
	}
	.site-header {
		min-height: 55px;
		padding: 10px 30px;
		background: #202225;
		border-bottom: 1px solid #77786d;
	}
	.wordmark {
		font-size: 22px;
	}
	.site-header nav {
		font-size: 11px;
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
	.site-footer {
		margin-top: auto;
		background: #202225;
	}
	@media (max-width: 640px) {
		.site-header {
			padding: 15px 20px;
		}
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
