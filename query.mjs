import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const { data, error } = await supabase.from('restaurants').select('id, name, is_open');
console.log(JSON.stringify(data, null, 2));
if (error) console.error(error);
