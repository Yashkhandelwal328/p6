from icrawler.builtin import BingImageCrawler
import os

crawler = BingImageCrawler(storage={'root_dir': 'test_img_bing'})
# Optimized prompt to avoid kids, packets, raw ingredients, etc.
query = 'Chicken Hot Sour Soup professional restaurant food photography plating close up'
crawler.crawl(keyword=query, max_num=1)
