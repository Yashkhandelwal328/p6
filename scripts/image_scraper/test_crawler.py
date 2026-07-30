from icrawler.builtin import BingImageCrawler
import os

crawler = BingImageCrawler(storage={'root_dir': 'test_img'})
crawler.crawl(keyword='Aloo Paratha food delicious', max_num=1)
