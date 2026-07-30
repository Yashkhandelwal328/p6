from icrawler.builtin import BingImageCrawler
import os, shutil

queries = [
    "Chicken Hot Sour Soup",
    "Veg Manchow Soup",
    "Tomato Soup",
    "Aloo Paratha",
    "Blue Lagoon drink"
]

for q in queries:
    dir_name = f"test_{q.replace(' ', '_')}"
    if os.path.exists(dir_name):
        shutil.rmtree(dir_name)
    crawler = BingImageCrawler(storage={'root_dir': dir_name})
    crawler.crawl(keyword=f'{q} recipe professional food photography high resolution', max_num=1)
