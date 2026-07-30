import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://frvsunqsnrtefixsxrrn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydnN1bnFzbnJ0ZWZpeHN4cnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDk4NTYsImV4cCI6MjEwMDg4NTg1Nn0.IJOwwRO5UHcDm16yMuDR2poyChuIqJhFSFtoGb_38Fg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const { data, error } = await supabase.from('restaurants').select('id, name, is_open');
console.log(JSON.stringify(data, null, 2));
