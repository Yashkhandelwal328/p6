import requests, re

url = "https://www.pexels.com/search/chicken%20soup/"
headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/117.0'}
response = requests.get(url, headers=headers)
print("Status:", response.status_code)
# look for any image url ending in .jpeg or .jpg
urls = re.findall(r'https://images.pexels.com/photos/\d+/[^?"]+', response.text)
if urls:
    print("Found images:", urls[:3])
else:
    print("No images found. Response length:", len(response.text))
