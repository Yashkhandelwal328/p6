from icrawler.builtin import GoogleImageCrawler

crawler = GoogleImageCrawler(storage={'root_dir': 'test_img_google'})
crawler.crawl(keyword='Chicken Hot Sour Soup restaurant food photography', max_num=1)
