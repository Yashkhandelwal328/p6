const supabaseUrl = 'https://frvsunqsnrtefixsxrrn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydnN1bnFzbnJ0ZWZpeHN4cnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDk4NTYsImV4cCI6MjEwMDg4NTg1Nn0.IJOwwRO5UHcDm16yMuDR2poyChuIqJhFSFtoGb_38Fg';

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function run() {
  // 1. Login
  const authRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': supabaseKey },
    body: JSON.stringify({ email: 'owner@nirvana.com', password: 'Nirvana@123' })
  });
  const authData = await authRes.json();
  const token = authData.access_token;
  if (!token) {
    console.error("No token!", authData);
    process.exit(1);
  }

  // 2. Fetch all menu items
  const getRes = await fetch(`${supabaseUrl}/rest/v1/menu_items?select=id,name,image_url`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${token}` }
  });
  const items = await getRes.json();
  
  let count = 0;
  for (const item of items) {
    const filename = slugify(item.name) + '.jpg';
    const newUrl = `/images/menu/${filename}`;
    if (item.image_url !== newUrl) {
      console.log(`Updating ${item.name} from ${item.image_url} to ${newUrl}...`);
      const patchRes = await fetch(`${supabaseUrl}/rest/v1/menu_items?id=eq.${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${token}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ image_url: newUrl })
      });
      if (patchRes.ok) {
        count++;
      } else {
        console.error(`Failed to update ${item.name}:`, await patchRes.text());
      }
    }
  }
  console.log(`Successfully updated ${count} items.`);
}
run();
