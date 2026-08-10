import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
const supabase = createClient('https://frvsunqsnrtefixsxrrn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydnN1bnFzbnJ0ZWZpeHN4cnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDk4NTYsImV4cCI6MjEwMDg4NTg1Nn0.IJOwwRO5UHcDm16yMuDR2poyChuIqJhFSFtoGb_38Fg', { realtime: { transport: ws } });
async function run() {
  await supabase.auth.signInWithPassword({ email: 'admin@nirvanacafe.com', password: 'S3cur3Nirv@na2026' });
  const { data: item } = await supabase.from('menu_items').select('*').eq('name', 'Blue Lagoon').single();
  console.log("Before:", item.image_url);
  const { data, error } = await supabase.from('menu_items').update({ image_url: '/images/menu/blue-lagoon.jpg' }).eq('id', item.id).select();
  console.log("Update result:", data, error);
  process.exit(0);
}
run();
