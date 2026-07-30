import urllib.request, json, urllib.parse

def search_unsplash(query):
    url = f"https://unsplash.com/napi/search/photos?query={urllib.parse.quote(query)}&per_page=5&page=1"
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
    })
    try:
        response = urllib.request.urlopen(req)
        data = json.loads(response.read())
        if data.get('results'):
            return data['results'][0]['urls']['regular']
    except Exception as e:
        print("Error:", e)
    return None

print("Success:", search_unsplash("Indian food"))
