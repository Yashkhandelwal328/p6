import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = 'https://frvsunqsnrtefixsxrrn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydnN1bnFzbnJ0ZWZpeHN4cnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDk4NTYsImV4cCI6MjEwMDg4NTg1Nn0.IJOwwRO5UHcDm16yMuDR2poyChuIqJhFSFtoGb_38Fg';

const supabase = createClient(supabaseUrl, supabaseKey, { realtime: { transport: ws } });

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function run() {
  await supabase.auth.signInWithPassword({ email: 'admin@nirvanacafe.com', password: 'S3cur3Nirv@na2026' });
  
  const { data: items } = await supabase.from('menu_items').select('id, name, image_url');
  let count = 0;
  for (const item of items) {
    const filename = slugify(item.name) + '.jpg';
    const newUrl = `/images/menu/${filename}`;
    if (item.image_url !== newUrl) {
      console.log(`Updating ${item.name}...`);
      await supabase.from('menu_items').update({ image_url: newUrl }).eq('id', item.id);
      count++;
    }
  }
  console.log(`Successfully updated ${count} items.`);
  process.exit(0);
}
run();
