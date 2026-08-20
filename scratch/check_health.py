import requests
import json

try:
    res = requests.get('http://127.0.0.1:3001/api/health', timeout=5)
    print("STATUS CODE:", res.status_code)
    print(json.dumps(res.json(), indent=2))
except Exception as e:
    print("Health check error:", e)
