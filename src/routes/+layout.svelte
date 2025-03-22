<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>
<div class="min-h-screen flex flex-col">
  <header class="bg-fl-black text-fl-paper p-4">
    <nav class="container mx-auto flex justify-between items-center">
      <a href="/" class="text-xl font-bold">My Personal Site</a>
      <div class="flex gap-6">
        <a href="/" class="hover:text-fl-cyan">Home</a>
        <a href="/blog" class="hover:text-fl-cyan">Blog</a>
        <a href="/reading" class="hover:text-fl-cyan">Reading</a>
        <a href="/projects" class="hover:text-fl-cyan">Projects</a>
        <a href="/resume" class="hover:text-fl-cyan">Resume</a>
      </div>
    </nav>
  </header>

  <main class="flex-grow container mx-auto p-4">
{@render children()}
  </main>

  <footer class="bg-fl-gray-100 p-4 text-fl-gray-700">
    <div class="container mx-auto text-center">
      <p>© {new Date().getFullYear()} - Built with SvelteKit, Tailwind, and Flexoki</p>
    </div>
  </footer>
</div>
