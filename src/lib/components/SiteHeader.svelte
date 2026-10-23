<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	let mounted = $state(false);
	onMount(() => (mounted = true));
	let menuOpen = $state(false);
	let menuButton: HTMLButtonElement;
	$effect(() => {
		void page.url.pathname;
		menuOpen = false;
	});
	const sections = [
		{ href: '/projects', label: 'Work' },
		{ href: '/reading', label: 'Library' },
		{ href: '/blog', label: 'Journal' },
		{ href: '/resume', label: 'Résumé' }
	] as const;
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape' && menuOpen) {
			menuOpen = false;
			menuButton.focus();
		}
	}}
/>

<header class="site-header">
	<a
		class="site-brand"
		href={resolve('/')}
		aria-label="Rituparan Reddy — home"
		aria-current={page.url.pathname === '/' ? 'page' : undefined}
	>
		Rituparan Reddy<span aria-hidden="true">▮</span>
	</a>
	<button
		class="menu-toggle"
		disabled={!mounted}
		bind:this={menuButton}
		aria-expanded={menuOpen}
		aria-controls="main-navigation"
		onclick={() => (menuOpen = !menuOpen)}
		>{menuOpen ? 'Close' : 'Menu'} <span aria-hidden="true">{menuOpen ? '−' : '+'}</span></button
	>
	<nav id="main-navigation" aria-label="Main navigation" data-open={menuOpen}>
		{#each sections as section (section.href)}
			<a
				href={resolve(section.href)}
				onclick={() => (menuOpen = false)}
				aria-current={page.url.pathname.startsWith(section.href) ? 'page' : undefined}
				>{section.label}</a
			>
		{/each}
	</nav>
</header>

<style>
	.site-header {
		position: sticky;
		top: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		height: var(--site-header-height);
		padding: 0 30px;
		color: #dfd9c9;
		background: #202225;
		border-bottom: 1px solid #77786d;
		box-shadow: 0 3px #121518;
	}
	.site-brand {
		font:
			19px/1 'Instrument Serif',
			Georgia,
			serif;
		letter-spacing: 0.02em;
		text-decoration: none;
		white-space: nowrap;
	}
	.site-brand span {
		margin-left: 12px;
		font: 12px monospace;
		color: #a9a28a;
	}
	.menu-toggle {
		display: none;
	}
	nav {
		display: flex;
		align-items: center;
		gap: 28px;
		font:
			11px/1.5 'JetBrains Mono',
			monospace;
	}
	nav a {
		padding: 10px 0;
		border-bottom: 1px solid transparent;
		text-decoration: none;
	}
	a:hover,
	nav a[aria-current='page'] {
		color: #d4c393;
	}
	nav a[aria-current='page'] {
		border-color: currentColor;
	}
	a:focus-visible {
		outline-color: #d4c393;
	}
	@media (max-width: 650px) {
		.site-header {
			gap: 16px;
			padding: 0 20px;
			box-shadow: none;
		}
		.site-brand span {
			display: none;
		}
		.menu-toggle {
			display: flex;
			align-items: center;
			gap: 12px;
			min-height: 44px;
			padding: 0 0 0 12px;
			border: 0;
			background: transparent;
			color: #dfd9c9;
			font: 11px/1.5 var(--font-mono);
		}
		nav {
			display: none;
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			padding: 8px 20px 16px;
			background: #202225;
			border-bottom: 1px solid #77786d;
			gap: 0;
		}
		nav[data-open='true'] {
			display: grid;
			grid-template-columns: 1fr 1fr;
		}
		nav a {
			padding: 14px 0;
			min-height: 44px;
		}
	}
</style>
