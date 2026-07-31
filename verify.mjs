const supabaseUrl = 'https://frvsunqsnrtefixsxrrn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydnN1bnFzbnJ0ZWZpeHN4cnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDk4NTYsImV4cCI6MjEwMDg4NTg1Nn0.IJOwwRO5UHcDm16yMuDR2poyChuIqJhFSFtoGb_38Fg';

async function run() {
  const getRes = await fetch(`${supabaseUrl}/rest/v1/menu_items?select=id,name,image_url`, {
    headers: { 'apikey': supabaseKey }
  });
  const items = await getRes.json();
  const loremFlickr = items.filter(i => i.image_url.includes('loremflickr'));
  console.log(`Found ${loremFlickr.length} items still using loremflickr.`);
}
run();
