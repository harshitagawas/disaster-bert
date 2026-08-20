import urllib.request
import json
import urllib.parse

gdelt_url = (
    "https://api.gdeltproject.org/api/v2/doc/doc?"
    + urllib.parse.urlencode({
        "query": '(flood OR earthquake OR cyclone OR hurricane OR wildfire OR landslide OR tsunami OR drought OR "heat wave" OR disaster) India',
        "mode": "ArtList",
        "maxrecords": "30",
        "format": "json",
        "sort": "DateDesc"
    })
)

print(f"Testing GDELT DOC 2.0 API fetch: {gdelt_url}")

req = urllib.request.Request(
    gdelt_url,
    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
)

try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        articles = data.get("articles", [])
        print(f"✅ GDELT API Success! Returned {len(articles)} recent articles.\n")
        
        for idx, art in enumerate(articles[:5]):
            print(f"Article {idx+1}:")
            print(f"  Title: {art.get('title')}")
            print(f"  URL: {art.get('url')}")
            print(f"  Source: {art.get('domain') or art.get('source')}")
            print(f"  Date: {art.get('seendate')}")
            print(f"  Language: {art.get('language')}")
            print(f"  SocialImage: {art.get('socialimage')}\n")
except Exception as e:
    print(f"❌ GDELT Primary Fetch Error: {e}")
    # Fallback query without 'India' restriction if global is preferred
    fallback_url = (
        "https://api.gdeltproject.org/api/v2/doc/doc?"
        + urllib.parse.urlencode({
            "query": '(flood OR earthquake OR cyclone OR hurricane OR wildfire OR landslide OR tsunami OR drought OR "heat wave" OR disaster)',
            "mode": "ArtList",
            "maxrecords": "30",
            "format": "json",
            "sort": "DateDesc"
        })
    )
    print(f"Testing Fallback GDELT fetch: {fallback_url}")
    req_fb = urllib.request.Request(fallback_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req_fb, timeout=15) as resp_fb:
        data_fb = json.loads(resp_fb.read().decode("utf-8"))
        articles_fb = data_fb.get("articles", [])
        print(f"✅ Fallback GDELT Success! Returned {len(articles_fb)} articles.")
