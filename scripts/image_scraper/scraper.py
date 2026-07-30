import os
import sys
import json
import argparse
import glob
import shutil
from io import BytesIO
from PIL import Image, ImageOps
from slugify import slugify
from supabase import create_client, Client
from dotenv import load_dotenv
from icrawler.builtin import BingImageCrawler
from concurrent.futures import ThreadPoolExecutor, as_completed

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: VITE_SUPABASE_URL and SUPABASE_KEY must be set in .env")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load config
config_path = os.path.join(os.path.dirname(__file__), 'config.json')
with open(config_path, 'r') as f:
    config = json.load(f)

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), config['output_dir']))
CONCURRENCY = config.get('concurrency', 5)
IMAGE_SIZE = tuple(config.get('image_size', [512, 512]))

os.makedirs(OUTPUT_DIR, exist_ok=True)
MISSING_REPORT = os.path.join(os.path.dirname(__file__), 'missing-images.json')

def process_and_save_image(source_filepath: str, dest_filepath: str):
    """Resize, crop/pad, compress, and save image to disk"""
    try:
        img = Image.open(source_filepath)
        
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
            
        img = ImageOps.fit(img, IMAGE_SIZE, Image.Resampling.LANCZOS)
        img.save(dest_filepath, 'JPEG', quality=85, optimize=True)
        return True
    except Exception as e:
        print(f"Image processing failed for {dest_filepath}: {e}")
        return False

def process_menu_item(item, force=False, used_names=set()):
    item_id = item['id']
    name = item['name']
    current_image = item.get('image_url')
    
    if not force and current_image and current_image.startswith('/images/menu/'):
        print(f"Skipping '{name}' (already has image).")
        return None
        
    print(f"Processing: {name}")
    query = f"{name} food high quality delicious"
    
    # Temporary directory for this thread
    temp_dir = os.path.join(os.path.dirname(__file__), f"tmp_{item_id}")
    os.makedirs(temp_dir, exist_ok=True)
    
    try:
        # Suppress noisy logging from icrawler
        import logging
        logging.getLogger('icrawler').setLevel(logging.CRITICAL)

        crawler = BingImageCrawler(storage={'root_dir': temp_dir})
        crawler.crawl(keyword=query, max_num=1)
        
        downloaded_files = glob.glob(os.path.join(temp_dir, '*'))
        if not downloaded_files:
            print(f"No image found for '{name}'")
            return {"id": item_id, "name": name, "reason": "No image found"}
            
        source_img = downloaded_files[0]
        
        base_slug = slugify(name)
        filename = f"{base_slug}.jpg"
        
        if filename in used_names:
            filename = f"{base_slug}-{item_id[:4]}.jpg"
        used_names.add(filename)
        
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        success = process_and_save_image(source_img, filepath)
        if success:
            db_path = f"/images/menu/{filename}"
            supabase.table('menu_items').update({'image_url': db_path}).eq('id', item_id).execute()
            print(f"Successfully updated '{name}' -> {filename}")
            return None
        else:
            return {"id": item_id, "name": name, "reason": "Image processing failed"}
            
    except Exception as e:
        print(f"Failed to process '{name}': {e}")
        return {"id": item_id, "name": name, "reason": str(e)}
    finally:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)

def main():
    parser = argparse.ArgumentParser(description="Automated Food Image Scraper")
    parser.add_argument('--force', action='store_true', help="Overwrite existing images")
    args = parser.parse_args()

    print("Fetching menu items from Supabase...")
    response = supabase.table('menu_items').select('id, name, image_url').execute()
    menu_items = response.data
    
    if not menu_items:
        print("No menu items found.")
        return

    print(f"Found {len(menu_items)} items. Starting scraper (Concurrency: {CONCURRENCY})...")
    
    used_names = set()
    missing = []
    
    with ThreadPoolExecutor(max_workers=CONCURRENCY) as executor:
        futures = {executor.submit(process_menu_item, item, args.force, used_names): item for item in menu_items}
        for future in as_completed(futures):
            result = future.result()
            if result:
                missing.append(result)

    if missing:
        print(f"\n{len(missing)} items failed. Writing report to {MISSING_REPORT}")
        with open(MISSING_REPORT, 'w') as f:
            json.dump(missing, f, indent=2)
    else:
        print("\nAll items processed successfully!")
        if os.path.exists(MISSING_REPORT):
            os.remove(MISSING_REPORT)

if __name__ == "__main__":
    main()
