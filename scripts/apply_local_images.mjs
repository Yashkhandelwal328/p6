import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = 'https://frvsunqsnrtefixsxrrn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydnN1bnFzbnJ0ZWZpeHN4cnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDk4NTYsImV4cCI6MjEwMDg4NTg1Nn0.IJOwwRO5UHcDm16yMuDR2poyChuIqJhFSFtoGb_38Fg';

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { transport: ws }
});

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function run() {
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@nirvanacafe.com',
    password: 'S3cur3Nirv@na2026',
  });
  if (authError) {
    console.error('Auth failed:', authError.message);
    process.exit(1);
  }

  const { data: items, error: fetchErr } = await supabase.from('menu_items').select('id, name');
  if (fetchErr) throw fetchErr;

  let count = 0;
  for (const item of items) {
    const filename = slugify(item.name) + '.jpg';
    const newUrl = `/images/menu/${filename}`;
    
    const { error } = await supabase.from('menu_items').update({ image_url: newUrl }).eq('id', item.id);
    if (error) {
      console.error(`Error updating ${item.name}:`, error.message);
    } else {
      count++;
    }
  }
  console.log(`Successfully updated ${count} items to use local images!`);
  process.exit(0);
}

run();
