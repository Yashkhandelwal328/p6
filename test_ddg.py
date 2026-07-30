from duckduckgo_search import DDGS
import json

with DDGS() as ddgs:
    results = list(ddgs.images('Chicken Hot Sour Soup restaurant food photography', max_results=1))
    print(json.dumps(results, indent=2))
