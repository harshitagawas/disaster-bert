import requests
import json

try:
    print("Testing /api/rss endpoint on http://127.0.0.1:3001/api/rss...")
    res = requests.get('http://127.0.0.1:3001/api/rss', timeout=15)
    print("STATUS CODE:", res.status_code)
    data = res.json()
    items = data.get("items", [])
    print(f"Total disaster news articles returned: {len(items)}")
    if items:
        print("\nFirst Article Sample:")
        print(" Title    :", items[0].get("title"))
        print(" Class    :", items[0].get("disasterType"))
        print(" Conf     :", items[0].get("confidence_percent"), "%")
        print(" Location :", items[0].get("location"))
except Exception as e:
    print("RSS Endpoint Test Error:", e)
