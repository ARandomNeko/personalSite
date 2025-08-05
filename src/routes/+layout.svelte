<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import '../app.css';
	import DitheredSpheres from '$lib/background/DitheredSpheres.svelte';

	let { children } = $props();
	let isDarkMode = $state(true);
	let currentTime = $state(new Date());
	let isMobile = $state(browser ? window.innerWidth < 768 : false);

	function toggleTheme() {
		isDarkMode = !isDarkMode;
		const body = document.body;
		if (isDarkMode) {
			body.classList.remove('light-mode');
			localStorage.setItem('theme', 'dark');
		} else {
			body.classList.add('light-mode');
			localStorage.setItem('theme', 'light');
		}
	}

	function setTheme() {
		const savedTheme = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const body = document.body;

		if (savedTheme === 'light') {
			body.classList.add('light-mode');
			isDarkMode = false;
		} else if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
			body.classList.remove('light-mode');
			isDarkMode = true;
		} else {
			body.classList.add('light-mode');
			isDarkMode = false;
		}
	}

	onMount(() => {
		setTheme();
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
			if (!localStorage.getItem('theme')) {
				isDarkMode = e.matches;
				if (e.matches) {
					document.body.classList.remove('light-mode');
				} else {
					document.body.classList.add('light-mode');
				}
			}
		});

		const clockInterval = setInterval(() => {
			currentTime = new Date();
		}, 1000);

		const handleResize = () => {
			isMobile = window.innerWidth < 768;
		};

		window.addEventListener('resize', handleResize);

		return () => {
			clearInterval(clockInterval);
			window.removeEventListener('resize', handleResize);
		};
	});
</script>

<div class="relative flex min-h-screen flex-col">
	{#if !isMobile}
		<DitheredSpheres />
	{/if}

	<header class="border-b border-[--ui-3] px-4 py-2">
		<nav class="container mx-auto flex flex-wrap items-center justify-between text-sm">
			<a href="/" class="text-lg font-bold hover:text-[--cy]">Rituparan Reddy</a>
			<div class="flex items-center gap-x-4 gap-y-2 flex-wrap">
				<a href="/blog" class="hover:text-[--cy]">Blog</a>
				<a href="/reading" class="hover:text-[--cy]">Reading</a>
				<a href="/projects" class="hover:text-[--cy]">Projects</a>
				<a href="/resume" class="hover:text-[--cy]">Resume</a>
				<label class="theme-toggle">
					<input type="checkbox" checked={!isDarkMode} onchange={toggleTheme} />
					<span class="slider"></span>
				</label>
			</div>
		</nav>
	</header>

	<div class="fixed top-2 right-2 z-50 border p-1 font-mono text-xs clock-display">
		<p>{currentTime.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} {currentTime.toLocaleTimeString('en-US', { hour12: false })}</p>
	</div>

	<main class="relative z-0 container mx-auto flex-grow p-4">
		{@render children()}
	</main>

	<footer class="border-t border-[--ui-3] px-4 py-2 text-center text-xs text-[--tx-2]">
		<div class="container mx-auto">
			<p>© {new Date().getFullYear()} Rituparan Reddy</p>
		</div>
	</footer>
</div>

<style>
	.clock-display {
		border-color: var(--tx-1);
		background-color: var(--bg);
		color: var(--tx-1);
	}
</style>




