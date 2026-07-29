import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkSchema() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/orders?select=*&limit=1';
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  // wait, earlier I saw VITE_ variables in .env.local?
  // Let me just read the file first to know what to use.
}
