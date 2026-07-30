import requests
from bs4 import BeautifulSoup

def get_unsplash_image(query):
    url = f"https://unsplash.com/s/photos/{query.replace(' ', '-')}"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')
    for img in soup.find_all('img'):
        src = img.get('src')
        if src and 'images.unsplash.com/photo-' in src:
            return src
    return None

print(get_unsplash_image('Indian food'))
