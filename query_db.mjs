import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = 'https://frvsunqsnrtefixsxrrn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydnN1bnFzbnJ0ZWZpeHN4cnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDk4NTYsImV4cCI6MjEwMDg4NTg1Nn0.IJOwwRO5UHcDm16yMuDR2poyChuIqJhFSFtoGb_38Fg';

const supabase = createClient(supabaseUrl, supabaseKey, { realtime: { transport: ws } });

async function run() {
  const { data: items, error } = await supabase.from('menu_items').select('name, image_url').in('name', ['Blue Lagoon', 'Mint Mojito']);
  console.log(items);
  process.exit(0);
}
run();
