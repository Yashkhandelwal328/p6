import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
const supabase = createClient('https://frvsunqsnrtefixsxrrn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydnN1bnFzbnJ0ZWZpeHN4cnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDk4NTYsImV4cCI6MjEwMDg4NTg1Nn0.IJOwwRO5UHcDm16yMuDR2poyChuIqJhFSFtoGb_38Fg', { realtime: { transport: ws } });
async function run() {
  const { data: items } = await supabase.from('menu_items').select('id, name, image_url').eq('name', 'Blue Lagoon');
  console.log("Blue Lagoon rows:", items);
  process.exit(0);
}
run();
