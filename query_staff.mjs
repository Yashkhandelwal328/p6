import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = 'https://frvsunqsnrtefixsxrrn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydnN1bnFzbnJ0ZWZpeHN4cnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDk4NTYsImV4cCI6MjEwMDg4NTg1Nn0.IJOwwRO5UHcDm16yMuDR2poyChuIqJhFSFtoGb_38Fg';

const supabase = createClient(supabaseUrl, supabaseKey, { realtime: { transport: ws } });

async function run() {
  const { data: authUser, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'owner@nirvana.com',
    password: 'Nirvana@123',
  });
  console.log("Auth user id:", authUser?.user?.id);
  const { data: staff, error: staffErr } = await supabase.from('staff').select('*').eq('user_id', authUser?.user?.id);
  console.log("Staff record:", staff);
  
  const { data: menu_items } = await supabase.from('menu_items').select('restaurant_id').limit(1);
  console.log("Menu item restaurant_id:", menu_items);
  process.exit(0);
}
run();
