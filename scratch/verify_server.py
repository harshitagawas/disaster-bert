import urllib.request
import json

try:
    with urllib.request.urlopen("http://127.0.0.1:3001/api/health", timeout=5) as resp:
        health = json.loads(resp.read().decode())
        print("✅ Backend Health Check SUCCESS:", health)
        
    with urllib.request.urlopen("http://127.0.0.1:3001/api/rss", timeout=15) as resp:
        rss = json.loads(resp.read().decode())
        print("✅ GDELT + BERT API SUCCESS!")
        print("Total Items Returned:", len(rss.get("items", [])))
        if rss.get("items"):
            print("Sample Alert 1:", rss["items"][0]["title"])
except Exception as e:
    print("❌ Verification failed:", e)
