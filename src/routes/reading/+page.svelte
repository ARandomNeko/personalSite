<script>
  const books = [
    {
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      status: 'Currently Reading',
      rating: 4.5,
      coverColor: 'fl-green'
    },
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      status: 'Completed',
      rating: 5,
      review: '/reading/atomic-habits',
      coverColor: 'fl-blue'
    },
    {
      title: 'The Pragmatic Programmer',
      author: 'Andy Hunt & Dave Thomas',
      status: 'Completed',
      rating: 4,
      review: '/reading/pragmatic-programmer',
      coverColor: 'fl-orange'
    },
    {
      title: 'Gödel, Escher, Bach',
      author: 'Douglas Hofstadter',
      status: 'On Hold',
      rating: 4.5,
      coverColor: 'fl-magenta'
    }
  ];
</script>

<svelte:head>
  <title>Reading List | My Personal Site</title>
</svelte:head>

<section class="py-8">
  <div class="max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold text-fl-black mb-8">Reading List & Reviews</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      {#each books as book}
        <div class="flex bg-fl-paper rounded-lg border border-fl-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
          <div class="w-4 bg-{book.coverColor}"></div>
          <div class="p-6 flex-1">
            <div class="flex justify-between items-start">
              <div>
                <h2 class="text-xl font-bold text-fl-black mb-1">{book.title}</h2>
                <p class="text-fl-gray-600 mb-3">by {book.author}</p>
              </div>
              <span class="text-sm bg-fl-gray-100 text-fl-gray-700 px-2 py-1 rounded">{book.status}</span>
            </div>
            
            <div class="flex items-center mb-3">
              <div class="flex text-fl-yellow">
                {#each Array(Math.floor(book.rating)) as _, i}
                  <span>★</span>
                {/each}
                {#if book.rating % 1 !== 0}
                  <span>☆</span>
                {/if}
              </div>
              <span class="ml-2 text-fl-gray-600">{book.rating}/5</span>
            </div>
            
            {#if book.review}
              <a href={book.review} class="text-sm text-fl-blue hover:underline">Read Review →</a>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>
