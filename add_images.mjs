import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = 'https://frvsunqsnrtefixsxrrn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydnN1bnFzbnJ0ZWZpeHN4cnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDk4NTYsImV4cCI6MjEwMDg4NTg1Nn0.IJOwwRO5UHcDm16yMuDR2poyChuIqJhFSFtoGb_38Fg';

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { transport: ws },
});

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

  console.log(`Found ${items.length} items. Updating images...`);

  const updates = items.map((item, index) => {
    let keyword = 'food';
    const catName = catMap[item.category_id] || '';
    
    if (catName.includes('soup')) keyword = 'soup';
    else if (catName.includes('beverage') || catName.includes('mocktail')) keyword = 'drink';
    else if (catName.includes('kabab') || catName.includes('starter') || catName.includes('snacks')) keyword = 'appetizer';
    else if (catName.includes('chinese')) keyword = 'noodles';
    else if (catName.includes('south indian') || catName.includes('uttapam')) keyword = 'dosa';
    else if (catName.includes('indian')) keyword = 'curry';
    else if (catName.includes('mutton') || catName.includes('egg') || catName.includes('chicken')) keyword = 'meat';
    else if (catName.includes('biryani') || catName.includes('rice')) keyword = 'rice';
    else if (catName.includes('dessert')) keyword = 'dessert';
    
    // We use a lock parameter to ensure the image stays consistent for this item
    const lockId = 1000 + index;
    const imageUrl = `https://loremflickr.com/400/300/${keyword},food?lock=${lockId}`;
    
    return {
      id: item.id,
      image_url: imageUrl
    };
  });

  const batchSize = 50;
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    const { error: updateErr } = await supabase.from('menu_items').upsert(batch);
    if (updateErr) {
      console.error(`❌ Failed batch ${i / batchSize + 1}:`, updateErr.message);
    } else {
      console.log(`✅ Updated batch ${i / batchSize + 1} with image URLs`);
    }
  }
  console.log('🎉 Done! All menu items now have pictures.');
}

run().catch(console.error);
