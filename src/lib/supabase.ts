import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tpagznalflgemtjbekfe.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_JvzZcyo48xg8KHZoxzfU1g_Py939iam';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});

// Fallback for the customer-facing ordering site (no login).
// The customer site loads the restaurant dynamically by querying the first active restaurant.
export const DEFAULT_RESTAURANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
