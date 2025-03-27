<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import BackgroundAnimation from '$lib/components/BackgroundAnimation.svelte'; // Import the background

	let { children } = $props();
	let isDarkMode = true;

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
		// Update Three.js particle color if needed (more complex, optional)
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
			body.classList.add('light-mode'); // Default to light if no preference/save
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
	});
</script>

<div class="relative flex min-h-screen flex-col">
	<BackgroundAnimation />
	<!-- Add the background component -->

	<header class="border-b border-[--ui-3] px-4 py-3">
		<nav
			class="container mx-auto flex items-center justify-between text-sm tracking-wider uppercase"
		>
			<a href="/" class="text-base font-bold normal-case hover:text-[--cy]">Rituparan Reddy</a>
			<div class="flex items-center gap-4">
				<a href="/blog" class="hover:text-[--cy]">Blog</a>
				<a href="/reading" class="hover:text-[--cy]">Reading</a>
				<a href="/projects" class="hover:text-[--cy]">Projects</a>
				<a href="/resume" class="hover:text-[--cy]">Resume</a>
				<label class="theme-toggle">
					<input type="checkbox" checked={!isDarkMode} on:change={toggleTheme} />
					<span class="slider"></span>
				</label>
			</div>
		</nav>
	</header>

	<!-- Ensure main content is scrollable and above the background -->
	<main class="relative z-0 container mx-auto flex-grow overflow-y-auto p-4 md:p-6 lg:p-8">
		{@render children()}
	</main>

	<footer class="border-t border-[--ui-3] px-4 py-3 text-center text-xs text-[--tx-2]">
		<div class="container mx-auto">
			<p>© {new Date().getFullYear()} Rituparan Reddy</p>
			<!-- <p>Built with SvelteKit, Tailwind, Mdsvex, Three.js, Flexoki</p> -->
		</div>
	</footer>
</div>

<style>
	/* Ensure main content area allows scrolling if needed */
	main {
		/* Set a max-height and allow scrolling if content exceeds viewport height */
		/* Adjust max-height calculation as needed, considering header/footer */
		max-height: calc(100vh - 80px); /* Example: adjust 80px based on header/footer height */
	}

	/* Optionally add a subtle background to main content if needed over complex animations */
	/* main { background-color: rgba(var(--bg-rgb), 0.95); } */
	/* Add --bg-rgb definition if using above: */
	/* :root { --bg-rgb: 40, 39, 38; } /* Dark mode black */
	/* .light-mode { --bg-rgb: 255, 252, 240; } /* Light mode paper */
</style>

