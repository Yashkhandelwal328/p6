from icrawler.builtin import YahooImageCrawler
import os, shutil

queries = ["Chicken Hot Sour Soup", "Veg Manchow Soup"]

for q in queries:
    dir_name = f"test_yahoo_{q.replace(' ', '_')}"
    if os.path.exists(dir_name):
        shutil.rmtree(dir_name)
    crawler = YahooImageCrawler(storage={'root_dir': dir_name})
    crawler.crawl(keyword=f'{q} professional food photography', max_num=1)
