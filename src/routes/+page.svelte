<script lang="ts">
	import type { Post } from '$lib/posts';

	let { data } = $props();
	const recentPosts: Post[] = data.recentPosts;

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Rituparan Reddy | Developer, Writer</title>
	<meta
		name="description"
		content="Rituparan (Ritu) Reddy – blog, projects, robotics, reading notes, and experiments."
	/>
	<meta
		name="keywords"
		content="ritu, rituparan, ritu reddy, rituparan reddy, rituparan gurrala, rituparan reddy gurrala, blog, robotics, projects, reading, programming"
	/>
</svelte:head>

<section class="home-layout py-6">
	<!-- Main Column -->
	<div class="main-column">
		<div class="animate-fade-in">
			<h1 class="mb-3 text-3xl font-bold !text-[--re]">Rituparan Reddy</h1>
			<p class="mb-6 text-lg text-[--tx-2]">Developer // Thinker // Humanist</p>
		</div>

		<div class="prose prose-base dark:prose-invert max-w-none animate-fade-in animate-delay-1">
			<p>
				Welcome to my personal corner of the internet. I'm passionate about building things with
				code, exploring new ideas, and documenting the journey.
			</p>
			<p>
				This site serves as my digital garden, notebook, and portfolio — a place where I share
				projects, reading notes, and thoughts on technology and life.
			</p>
		</div>

		<div class="mt-8 flex flex-wrap gap-3 animate-fade-in animate-delay-2">
			<a href="/projects" class="btn">Projects</a>
			<a href="/blog" class="btn">Blog</a>
			<a href="/reading" class="btn">Reading</a>
			<a href="/resume" class="btn">Resume</a>
		</div>
	</div>

	<!-- Sidebar -->
	<aside class="sidebar">
		<!-- Now Card -->
		<div class="sidebar-card animate-fade-in animate-delay-3">
			<h2 class="text-sm font-bold mb-3 text-[--tx-2]">// NOW</h2>
			<p class="text-sm mb-2">
				Big project cooking — expect updates soon. First project post and blog post will be about that.
			</p>
			<p class="text-sm text-[--tx-2]">
				Currently reading: <em>Nicomachean Ethics</em> by Aristotle
			</p>
		</div>

		<!-- Recent Posts -->
		{#if recentPosts.length > 0}
			<div class="sidebar-card animate-fade-in animate-delay-4">
				<h2 class="text-sm font-bold mb-3 text-[--tx-2]">// RECENT</h2>
				<ul class="space-y-3">
					{#each recentPosts as post}
						<li>
							<a href="/blog/{post.slug}" class="block group">
								<span class="text-xs text-[--tx-2]">{formatDate(post.metadata.date)}</span>
								<p class="text-sm group-hover:text-[--cy] transition-colors">{post.metadata.title}</p>
							</a>
						</li>
					{/each}
				</ul>
				<a href="/blog" class="inline-block mt-4 text-xs text-[--tx-2] hover:text-[--cy]">
					View all posts →
				</a>
			</div>
		{/if}

		<!-- Links -->
		<div class="sidebar-card animate-fade-in animate-delay-5">
			<h2 class="text-sm font-bold mb-3 text-[--tx-2]">// LINKS</h2>
			<ul class="space-y-2 text-sm">
				<li><a href="https://github.com" target="_blank" rel="noopener noreferrer" class="hover:text-[--cy]">GitHub ↗</a></li>
				<li><a href="mailto:contact@example.com" class="hover:text-[--cy]">Email</a></li>
			</ul>
		</div>
	</aside>
</section>

<style>
	.home-layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: calc(var(--grid) * 3);
		max-width: 900px;
		margin: 0 auto;
		padding: 0 var(--grid);
	}

	@media (min-width: 768px) {
		.home-layout {
			grid-template-columns: 1fr 0.6fr;
			padding: 0 calc(var(--grid) * 2);
		}
	}

	.main-column {
		min-width: 0;
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: calc(var(--grid) * 2);
	}

	.sidebar-card {
		padding: var(--grid);
		border: 1px solid var(--ui-3);
	}

	.sidebar-card:hover {
		border-color: var(--tx);
	}
</style>
