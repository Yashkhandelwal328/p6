import os, json
from supabase import create_client
from dotenv import load_dotenv
from slugify import slugify

load_dotenv()
supabase = create_client(os.environ["VITE_SUPABASE_URL"], os.environ["VITE_SUPABASE_ANON_KEY"])
res = supabase.table("menu_items").select("id, name").execute()

sql_statements = []
public_dir = os.path.abspath("public/images/menu")

for item in res.data:
    filename = slugify(item['name']) + '.jpg'
    if os.path.exists(os.path.join(public_dir, filename)):
        sql = f"UPDATE menu_items SET image_url = '/images/menu/{filename}' WHERE id = '{item['id']}';"
        sql_statements.append(sql)

with open("supabase/migrations/20260730000002_update_image_urls.sql", "w") as f:
    f.write("\n".join(sql_statements) + "\n")

print(f"Generated {len(sql_statements)} update statements.")
