import os, json
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
# Force using the service role key to bypass RLS!
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
print("Using Service Role Key:" if key else "Using Anon Key")
supabase = create_client(os.environ["VITE_SUPABASE_URL"], key or os.environ["VITE_SUPABASE_ANON_KEY"])
res = supabase.table("menu_items").update({"image_url": "/images/menu/test.jpg"}).eq("name", "Malai Kofta").execute()
print("Update response:", json.dumps(res.data, indent=2))
