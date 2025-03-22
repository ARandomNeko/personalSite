<script>
  import { onMount } from 'svelte';
  
  let greeting = "";
  
  onMount(() => {
    const hour = new Date().getHours();
    if (hour < 12 && hour > 6) greeting = "Good morning";
    else if (hour < 18 && hour > 12) greeting = "Good afternoon";
    else greeting = "Good evening";
  });
</script>

<svelte:head>
  <title>My Personal Site</title>
</svelte:head>

<section class="py-12">
  <div class="max-w-3xl mx-auto">
    <h1 class="text-4xl font-bold mb-2 ">{greeting}, I'm Rituparan Reddy</h1>
    <p class="text-xl mb-8">Developer, Designer, Thinker</p>
    
    <div class="max-w-none">
      <p>Welcome to my personal corner of the internet. I'm a [your profession] passionate about [your interests].</p>
      
      <p>I build things with code, explore new ideas, and document my journey along the way.</p>
    </div>
    
    <div class="mt-8">
      <a href="/projects" class="btn btn-primary mr-4">View Projects</a>
      <a href="/blog" class="btn bg-fl-gray-200 text-fl-gray-800 hover:bg-fl-gray-300">Read Blog</a>
    </div>
  </div>
</section>

<section class="py-8 bg-fl-gray-50 rounded-lg">
  <div class="max-w-3xl mx-auto">
    <h2 class="text-2xl font-bold text-fl-black mb-6 ">Featured Projects</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <a href="/projects/flow-solver" class="block p-6 bg-white rounded-lg border border-fl-gray-200 hover:shadow-md transition-shadow">
        <h3 class="text-xl font-bold text-fl-blue mb-2">Flow Solver</h3>
        <p class="text-fl-gray-700">An algorithm to solve Flow puzzles efficiently.</p>
      </a>
      
      <a href="/projects/ed-tech" class="block p-6 bg-white rounded-lg border border-fl-gray-200 hover:shadow-md transition-shadow">
        <h3 class="text-xl font-bold text-fl-green mb-2">Ed Tech Tool</h3>
        <p class="text-fl-gray-700">Interactive learning platform for students.</p>
      </a>
    </div>
  </div>
</section>

<section class="py-8">
  <div class="max-w-3xl mx-auto">
    <h2 class="text-2xl font-bold text-fl-black mb-6">Recent Posts</h2>
    
    <div class="space-y-6">
      <a href="/blog/post-1" class="block p-6 bg-fl-paper rounded-lg border border-fl-gray-200 hover:shadow-md transition-shadow">
        <span class="text-sm text-fl-gray-600">March 15, 2025</span>
        <h3 class="text-xl font-bold text-fl-magenta mb-2">Getting Started with SvelteKit</h3>
        <p class="text-fl-gray-700">Exploring the features and benefits of SvelteKit for modern web development.</p>
      </a>
      
      <a href="/blog/post-2" class="block p-6 bg-fl-paper rounded-lg border border-fl-gray-200 hover:shadow-md transition-shadow">
        <span class="text-sm text-fl-gray-600">March 1, 2025</span>
        <h3 class="text-xl font-bold text-fl-cyan mb-2">The Beauty of Flexoki Color Scheme</h3>
        <p class="text-fl-gray-700">Why I chose Flexoki for my personal site and how it enhances readability.</p>
      </a>
    </div>
  </div>
</section>
