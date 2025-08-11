<script lang="ts">
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { page } from '$app/stores';
    import '../app.css';
    import DitheredSpheres from '$lib/background/DitheredSpheres.svelte';

	let { children } = $props();
	let isDarkMode = $state(true);
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

		const handleResize = () => {
			isMobile = window.innerWidth < 768;
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});
</script>

<svelte:head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Rituparan Reddy (Gurrala) – developer, writer, and tinkerer. Blog, projects, reading notes, robotics, distributed systems, Svelte, TypeScript." />
    <meta name="keywords" content="ritu, rituparan, ritu reddy, rituparan reddy, rituparan gurrala, rituparan reddy gurrala, ritu gurrala, blog, projects, reading, robotics, programming, svelte, typescript" />
    <meta name="author" content="Rituparan Reddy" />

    <meta property="og:site_name" content="Rituparan Reddy" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Rituparan Reddy" />
    <meta property="og:description" content="Developer, writer, and tinkerer. Blog, projects, reading notes, robotics." />
    <meta property="og:url" content={$page.url.origin + $page.url.pathname} />

    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="Rituparan Reddy" />
    <meta name="twitter:description" content="Developer, writer, and tinkerer. Blog, projects, reading notes, robotics." />

    <link rel="canonical" href={$page.url.origin + $page.url.pathname} />

    <script type="application/ld+json">
        {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: 'Rituparan Reddy',
            alternateName: ['Ritu', 'Ritu Reddy', 'Rituparan', 'Rituparan Gurrala', 'Rituparan Reddy Gurrala'],
            url: $page.url.origin,
            jobTitle: 'Developer',
            description: 'Developer, writer, and tinkerer working on code, robotics, and systems.',
            sameAs: []
        })}
    </script>
    <script type="application/ld+json">
        {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Rituparan Reddy',
            url: $page.url.origin,
            potentialAction: {
                '@type': 'SearchAction',
                target: `${$page.url.origin}/search?q={query}`,
                'query-input': 'required name=query'
            }
        })}
    </script>
</svelte:head>

<div class="relative flex h-dvh flex-col overflow-hidden">
	<DitheredSpheres isMobile={isMobile} />

<header class="border-b border-[--ui-3] px-3 h-[48px] flex items-center box-border">
    <nav class="w-full flex flex-wrap items-center justify-between text-sm" style="gap: var(--grid);">
			<a href="/" class="text-lg font-bold hover:text-[--cy]">Rituparan Reddy</a>
            <div class="flex items-center flex-wrap" style="column-gap: calc(var(--grid)); row-gap: calc(var(--grid) / 2);">
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

<main class="relative z-0 flex-1 overflow-auto px-3 py-[12px]" style="scroll-padding: var(--grid);">
		{@render children()}
	</main>

<footer class="border-t border-[--ui-3] px-3 h-[48px] text-center text-xs text-[--tx-2] flex items-center justify-center box-border">
    <div class="w-full">
        <p>© {new Date().getFullYear()} Rituparan Reddy</p>
    </div>
</footer>
</div>

<style>
</style>




