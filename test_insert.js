const url = process.env.VITE_SUPABASE_URL + '/rest/v1/';
const key = process.env.VITE_SUPABASE_ANON_KEY;

fetch(url, {
  headers: {
    'apikey': key,
    'Authorization': 'Bearer ' + key,
  }
}).then(r => r.json()).then(data => {
  const ordersDef = data.definitions.orders;
  console.log(ordersDef.properties);
}).catch(e => console.error(e));
