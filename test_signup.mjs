import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const supabaseUrl = 'https://tpagznalflgemtjbekfe.supabase.co';
const supabaseKey = 'sb_publishable_JvzZcyo48xg8KHZoxzfU1g_Py939iam'; // from .env.local

globalThis.WebSocket = WebSocket;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
  console.log("Testing RPC call...");
  const { data, error } = await supabase.rpc('create_restaurant_account', {
    p_restaurant_name: "Test Rest",
    p_owner_name: "Test Owner",
    p_owner_email: "test_xyz_123@example.com",
    p_user_id: "00000000-0000-0000-0000-000000000000",
    p_prefix: "TST",
    p_owner_phone: "1234567890",
    p_address: "123 Test St",
    p_gst_number: null,
    p_plan: "starter",
  });

  if (error) {
    console.error("RPC Error Details:", error);
  } else {
    console.log("RPC Success:", data);
  }
}

testSignup();
