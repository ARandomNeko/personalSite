<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import DitheredSpheres from '$lib/background/DitheredSpheres.svelte';

	let { children } = $props();
	let isDarkMode = $state(true);
	let currentTime = $state(new Date());

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
			// Default to light mode as per the image aesthetic
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

		// Update clock every second
		const clockInterval = setInterval(() => {
			currentTime = new Date();
		}, 1000);

		return () => {
			clearInterval(clockInterval);
		};
	});
</script>

<div class="relative flex min-h-screen flex-col">
	<DitheredSpheres />

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
					<input type="checkbox" checked={!isDarkMode} onchange={toggleTheme} />
					<span class="slider"></span>
				</label>
			</div>
		</nav>
	</header>

	<!-- Clock Tool - Fixed Position -->
	<div class="fixed top-4 right-4 z-50 p-2 border-2 font-mono text-xs clock-display">
		<p>{currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' })} {currentTime.toLocaleTimeString('en-US', { hour12: false })}</p>
	</div>

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

	/* Clock display styling with theme support */
	.clock-display {
		border-color: var(--tx-1);
		background-color: var(--bg);
		color: var(--tx-1);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	/* Light mode clock adjustments */
	:global(.light-mode) .clock-display {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}
</style>




