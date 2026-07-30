const url = 'https://frvsunqsnrtefixsxrrn.supabase.co/rest/v1/restaurants?select=id,name,is_open';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydnN1bnFzbnJ0ZWZpeHN4cnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDk4NTYsImV4cCI6MjEwMDg4NTg1Nn0.IJOwwRO5UHcDm16yMuDR2poyChuIqJhFSFtoGb_38Fg';
fetch(url, {
  headers: {
    'apikey': key,
    'Authorization': 'Bearer ' + key
  }
}).then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)));
