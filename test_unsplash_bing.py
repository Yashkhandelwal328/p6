from icrawler.builtin import BingImageCrawler
import os, shutil

queries = [
    "Chicken Soup",
    "Manchow Soup",
    "Tomato Soup"
]

for q in queries:
    dir_name = f"test_unsplash_{q.replace(' ', '_')}"
    if os.path.exists(dir_name):
        shutil.rmtree(dir_name)
    crawler = BingImageCrawler(storage={'root_dir': dir_name})
    crawler.crawl(keyword=f'{q} food site:unsplash.com', max_num=1)
