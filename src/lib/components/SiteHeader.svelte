<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	const sections = [
		{ href: '/projects', label: 'Work' },
		{ href: '/reading', label: 'Library' },
		{ href: '/blog', label: 'Journal' },
		{ href: '/resume', label: 'Résumé' }
	] as const;
</script>

<header class="site-header">
	<a
		class="site-brand"
		href={resolve('/')}
		aria-label="Rituparan Reddy — home"
		aria-current={page.url.pathname === '/' ? 'page' : undefined}
	>
		Rituparan Reddy<span aria-hidden="true">▮</span>
	</a>
	<nav aria-label="Main navigation">
		{#each sections as section (section.href)}
			<a
				href={resolve(section.href)}
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
			flex-wrap: wrap;
			gap: 8px;
			padding: 13px 17px;
		}
		nav {
			width: 100%;
			justify-content: space-between;
			gap: 16px;
		}
		nav a {
			padding: 2px 0;
		}
	}
</style>
