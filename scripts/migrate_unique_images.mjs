import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = 'https://frvsunqsnrtefixsxrrn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydnN1bnFzbnJ0ZWZpeHN4cnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDk4NTYsImV4cCI6MjEwMDg4NTg1Nn0.IJOwwRO5UHcDm16yMuDR2poyChuIqJhFSFtoGb_38Fg';

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { transport: ws },
});

const usedImages = new Set();

async function getWikiImage(query, usedUrls) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=10`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.query && data.query.pages) {
      for (const key in data.query.pages) {
        const page = data.query.pages[key];
        if (page.original && page.original.source) {
          const imgUrl = page.original.source;
          if (!usedUrls.has(imgUrl)) {
            return imgUrl;
          }
        }
      }
    }
  } catch (err) {
    console.error(`Error fetching for ${query}:`, err);
  }
  return null;
}

async function run() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'owner@nirvana.com',
    password: 'Nirvana@123',
  });
  if (authError) {
    console.error('❌ Auth failed:', authError.message);
    process.exit(1);
  }
  
  const { data: categories } = await supabase.from('categories').select('id, name');
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name.toLowerCase()]));

  const { data: items, error: fetchErr } = await supabase.from('menu_items').select('id, name, category_id');
  if (fetchErr) throw fetchErr;

  console.log(`Found ${items.length} items. Migrating to unique realistic images...`);

  const updates = [];
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const catName = catMap[item.category_id] || '';
    const searchQuery = `${item.name} ${catName.includes('soup') ? 'soup' : ''} food`;
    
    let imageUrl = await getWikiImage(searchQuery, usedImages);
    
    if (!imageUrl) {
      imageUrl = await getWikiImage(item.name + ' food', usedImages);
    }
    
    if (!imageUrl) {
      const lockId = Math.floor(Math.random() * 1000000) + Date.now();
      imageUrl = `https://loremflickr.com/600/400/food?lock=${lockId}`;
    }

    usedImages.add(imageUrl);
    
    updates.push(async () => {
      const { error } = await supabase.from('menu_items').update({ image_url: imageUrl }).eq('id', item.id);
      if (error) throw error;
    });
    
    if (i % 10 === 0) {
      console.log(`Processed ${i}/${items.length} items...`);
    }
  }

  const chunkArray = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
  const batches = chunkArray(updates, 20);
  let count = 0;
  for (const batch of batches) {
    await Promise.all(batch.map(fn => fn()));
    count += batch.length;
    console.log(`✅ Updated ${count}/${updates.length} items in database`);
  }

  console.log('🎉 Done! All menu items now have completely unique pictures.');
}

run().catch(console.error);
