<script lang="ts">
  import { onMount } from 'svelte';
  import '../app.css';
	let { children } = $props();
  let isDarkMode = true;
  
  // Function to toggle between light and dark themes
  function toggleTheme() {
    isDarkMode = !isDarkMode;
    const body = document.body;
    
    if (isDarkMode) {
      body.classList.remove('light-mode');
    } else {
      body.classList.add('light-mode');
    }
    
    // Save user preference to localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }
  
  // Function to set the theme based on user preference or system preference
  function setTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const body = document.body;
    
    if (savedTheme === 'light') {
      body.classList.add('light-mode');
      isDarkMode = false;
    } else if (savedTheme === 'dark') {
      body.classList.remove('light-mode');
      isDarkMode = true;
    } else if (prefersDark) {
      body.classList.remove('light-mode');
      isDarkMode = true;
    } else {
      body.classList.add('light-mode');
      isDarkMode = false;
    }
  }
  
  onMount(() => {
    setTheme();
    
    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
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
        <label class="theme-toggle">
          <input type="checkbox" checked={!isDarkMode} on:change={toggleTheme}>
          <span class="slider"></span>
        </label>
      </div>
    </nav>
  </header>

  <main class="flex-grow container mx-auto p-4 ">
{@render children()}
  </main>

  <footer class="bg-fl-gray-100 p-4 text-fl-gray-700">
    <div class="container mx-auto text-center">
      <p>© {new Date().getFullYear()} - Built with SvelteKit, Tailwind, and Flexoki</p>
    </div>
  </footer>
</div>
