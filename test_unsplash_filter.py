from icrawler.builtin import BingImageCrawler
import os, shutil
from icrawler import ImageDownloader

class UnsplashDownloader(ImageDownloader):
    def get_filename(self, task, default_ext):
        # We can filter here if needed, but the URL is already chosen.
        return super().get_filename(task, default_ext)

class UnsplashBingCrawler(BingImageCrawler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Replace downloader if needed, but parser is where we filter URLs
        pass
        
import urllib.request
import json
import re

def search_unsplash(query):
    # Unsplash actually has an open endpoint if you don't use api.unsplash.com
    # The frontend uses it. But it requires a client-id.
    pass

