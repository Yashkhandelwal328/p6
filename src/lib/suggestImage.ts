export async function suggestImage(query: string): Promise<string | null> {
  if (!query) return null;
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&generator=search&gsrsearch=${encodeURIComponent(query + ' food')}&gsrlimit=3&origin=*`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.query && data.query.pages) {
      for (const key in data.query.pages) {
        const page = data.query.pages[key];
        if (page.original && page.original.source) {
          return page.original.source;
        }
      }
    }
  } catch (err) {
    console.error(`Error suggesting image for ${query}:`, err);
  }
  
  // Fallback
  return `https://loremflickr.com/600/400/food?lock=${Math.floor(Math.random() * 1000000)}`;
}
