import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSuperAdmin() {
  const email = 'admin@platform.com';
  const password = 'SuperSecurePassword123!';

  console.log('Creating Super Admin account...');

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'super_admin',
          full_name: 'Platform Admin',
        }
      }
    });

    if (authError) {
      console.error('Auth Error:', authError.message);
      return;
    }

    if (authData.user) {
      // Assuming you have RLS policies allowing this or using service_role key
      const { error: dbError } = await supabase.from('staff').insert({
        user_id: authData.user.id,
        auth_id: authData.user.id,
        role: 'super_admin',
        first_name: 'Platform',
        last_name: 'Admin',
        email: email,
        is_active: true
      });

      if (dbError) {
        console.error('Failed to create staff record:', dbError.message);
        console.error('Note: This might fail if you are not using the SERVICE_ROLE_KEY.');
      } else {
        console.log('Super Admin successfully created!');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
      }
    }
  } catch (e) {
    console.error('Setup failed:', e);
  }
}

setupSuperAdmin();
