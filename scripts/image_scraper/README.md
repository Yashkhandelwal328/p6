# Automated Food Image Scraper

This script automatically reads all menu items from your Supabase database, searches DuckDuckGo for high-quality images of the food, downloads them, resizes/compresses them uniformly, and saves them to the project's public image folder. Finally, it updates the database to point to the new images.

## Requirements

You must have Python 3.8+ installed on your system.

## Installation

1. Navigate to this directory in your terminal:
   ```bash
   cd "scripts/image_scraper"
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Configuration

### Environment Variables
The script relies on the `.env` file located at the root of your project (`../../.env`).
Ensure the following variables are set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (or `SUPABASE_SERVICE_ROLE_KEY` if you want to bypass Row Level Security)

### `config.json`
You can tweak the scraping behavior in `config.json`:
- `output_dir`: Where the images will be saved (relative to the script).
- `concurrency`: Number of simultaneous downloads (keep around 5 to avoid rate limits).
- `image_size`: Resolution of the downloaded images `[width, height]`.
- `max_retries`: Number of attempts if a download fails.
- `retry_delay_seconds`: Time to wait before retrying.

## Usage

To run the scraper and fetch images for any menu items that are currently missing an image:

```bash
python scraper.py
```

### Forcing Overwrite
If you want to re-download images for *every* item in your database (overwriting existing ones):

```bash
python scraper.py --force
```

## Logs and Reports

- The script will log its progress to the terminal.
- Any items that fail (no image found, download failed, etc.) will be logged to `missing-images.json` in this directory. If the file doesn't exist, it means 100% of the items were successfully processed.
