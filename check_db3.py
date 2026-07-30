import os, json
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.environ["VITE_SUPABASE_URL"], os.environ["VITE_SUPABASE_ANON_KEY"])
res = supabase.table("menu_items").select("name, image_url").limit(5).execute()
print(json.dumps(res.data, indent=2))
