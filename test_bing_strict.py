from icrawler.builtin import BingImageCrawler
import os, shutil

queries = [
    "Chicken Hot Sour Soup",
    "Veg Manchow Soup"
]

for q in queries:
    dir_name = f"test_strict_{q.replace(' ', '_')}"
    if os.path.exists(dir_name):
        shutil.rmtree(dir_name)
    crawler = BingImageCrawler(storage={'root_dir': dir_name})
    # very strict query
    crawler.crawl(keyword=f'"{q}" restaurant food plating professional photography -kids -people -packet -box -raw', max_num=1)
