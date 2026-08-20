import urllib.request
import json
import urllib.parse

gdelt_url = (
    "https://api.gdeltproject.org/api/v2/doc/doc?"
    + urllib.parse.urlencode({
        "query": '(flood OR earthquake OR cyclone OR hurricane OR wildfire OR landslide OR tsunami OR drought OR "heat wave" OR cloudburst OR disaster) India sourcelang:english',
        "mode": "ArtList",
        "maxrecords": "50",
        "format": "json",
        "sort": "DateDesc"
    })
)

print(f"Testing GDELT English API fetch: {gdelt_url}")
req = urllib.request.Request(gdelt_url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})

with urllib.request.urlopen(req, timeout=15) as resp:
    data = json.loads(resp.read().decode("utf-8"))
    articles = data.get("articles", [])
    print(f"✅ GDELT English Fetch returned {len(articles)} articles.\n")
    
    flood_count = 0
    for idx, art in enumerate(articles):
        title = art.get("title", "")
        if "flood" in title.lower() or "rain" in title.lower():
            flood_count += 1
        print(f"Article {idx+1:2d}: [{art.get('domain')}] {title[:75]}")
        
    print(f"\nTotal Flood/Rain Related Articles: {flood_count}/{len(articles)}")
