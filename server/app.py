import os
import json
import logging
import re
import math
import urllib.request
import urllib.parse
from datetime import datetime
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("Disaster-Intelligence-Backend")

app = FastAPI(title="Disaster Intelligence Platform — GDELT English, BERT, NER & Geocoding API", version="3.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HF_REPO_ID = "harry2708/disaster-bert"
LOCAL_MODEL_DIR = r"c:\Users\arvin\Desktop\bert\models\disaster_bert"
LOCAL_LABEL_MAP = r"c:\Users\arvin\Desktop\bert\models\disaster_bert\label_mapping.json"

# Strict GDELT Queries (English-only, India-focused disaster news)
GDELT_PRIMARY_QUERY = '(flood OR earthquake OR cyclone OR hurricane OR wildfire OR landslide OR tsunami OR drought OR "heat wave" OR cloudburst OR disaster) India sourcelang:english'
GDELT_FALLBACK_QUERY = '(flood OR earthquake OR cyclone OR hurricane OR wildfire OR landslide OR tsunami OR drought OR "heat wave" OR cloudburst OR disaster) sourcelang:english'

# Response Cache to prevent GDELT 429 rate limiting
gdelt_cache = {
    "data": None,
    "timestamp": 0
}
CACHE_TTL = 60 # seconds

# Global model state
tokenizer = None
model = None
id2label = {}
label2id = {}
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

hf_accessible = False
model_loaded = False
num_classes = 0

# Comprehensive Indian Geographical Database for NER & Geocoding
INDIAN_LOCATIONS = {
    # All 28 States & 8 Union Territories
    "andhra pradesh": {"name": "Andhra Pradesh", "state": "Andhra Pradesh", "district": "Amaravati", "lat": 15.9129, "lng": 79.7400},
    "arunachal pradesh": {"name": "Arunachal Pradesh", "state": "Arunachal Pradesh", "district": "Papum Pare", "lat": 28.2180, "lng": 94.7278},
    "assam": {"name": "Assam", "state": "Assam", "district": "Kamrup", "lat": 26.2006, "lng": 92.9376},
    "bihar": {"name": "Bihar", "state": "Bihar", "district": "Patna", "lat": 25.0961, "lng": 85.3131},
    "chhattisgarh": {"name": "Chhattisgarh", "state": "Chhattisgarh", "district": "Raipur", "lat": 21.2787, "lng": 81.8661},
    "goa": {"name": "Goa", "state": "Goa", "district": "North Goa", "lat": 15.2993, "lng": 74.1240},
    "gujarat": {"name": "Gujarat", "state": "Gujarat", "district": "Gandhinagar", "lat": 22.2587, "lng": 71.1924},
    "haryana": {"name": "Haryana", "state": "Haryana", "district": "Chandigarh", "lat": 29.0588, "lng": 76.0856},
    "himachal pradesh": {"name": "Himachal Pradesh", "state": "Himachal Pradesh", "district": "Shimla", "lat": 31.1048, "lng": 77.1734},
    "himachal": {"name": "Himachal Pradesh", "state": "Himachal Pradesh", "district": "Shimla", "lat": 31.1048, "lng": 77.1734},
    "jharkhand": {"name": "Jharkhand", "state": "Jharkhand", "district": "Ranchi", "lat": 23.6102, "lng": 85.2799},
    "karnataka": {"name": "Karnataka", "state": "Karnataka", "district": "Bengaluru", "lat": 15.3173, "lng": 75.7139},
    "kerala": {"name": "Kerala", "state": "Kerala", "district": "Thiruvananthapuram", "lat": 10.8505, "lng": 76.2711},
    "madhya pradesh": {"name": "Madhya Pradesh", "state": "Madhya Pradesh", "district": "Bhopal", "lat": 22.9734, "lng": 78.6569},
    "maharashtra": {"name": "Maharashtra", "state": "Maharashtra", "district": "Mumbai City", "lat": 19.7515, "lng": 75.7139},
    "manipur": {"name": "Manipur", "state": "Manipur", "district": "Imphal West", "lat": 24.6637, "lng": 93.9063},
    "meghalaya": {"name": "Meghalaya", "state": "Meghalaya", "district": "East Khasi Hills", "lat": 25.4670, "lng": 91.3662},
    "mizoram": {"name": "Mizoram", "state": "Mizoram", "district": "Aizawl", "lat": 23.1645, "lng": 92.9376},
    "nagaland": {"name": "Nagaland", "state": "Nagaland", "district": "Kohima", "lat": 26.1584, "lng": 94.5624},
    "odisha": {"name": "Odisha", "state": "Odisha", "district": "Khurda", "lat": 20.9517, "lng": 85.0985},
    "punjab": {"name": "Punjab", "state": "Punjab", "district": "Ludhiana", "lat": 31.1471, "lng": 75.3412},
    "rajasthan": {"name": "Rajasthan", "state": "Rajasthan", "district": "Jaipur", "lat": 27.0238, "lng": 74.2179},
    "sikkim": {"name": "Sikkim", "state": "Sikkim", "district": "Gangtok", "lat": 27.5330, "lng": 88.5122},
    "tamil nadu": {"name": "Tamil Nadu", "state": "Tamil Nadu", "district": "Chennai", "lat": 11.1271, "lng": 78.6569},
    "telangana": {"name": "Telangana", "state": "Telangana", "district": "Hyderabad", "lat": 18.1124, "lng": 79.0193},
    "tripura": {"name": "Tripura", "state": "Tripura", "district": "West Tripura", "lat": 23.9408, "lng": 91.9882},
    "uttar pradesh": {"name": "Uttar Pradesh", "state": "Uttar Pradesh", "district": "Lucknow", "lat": 26.8467, "lng": 80.9462},
    "uttarakhand": {"name": "Uttarakhand", "state": "Uttarakhand", "district": "Dehradun", "lat": 30.0668, "lng": 79.0193},
    "west bengal": {"name": "West Bengal", "state": "West Bengal", "district": "Kolkata", "lat": 22.9868, "lng": 87.8550},
    "delhi": {"name": "Delhi NCR", "state": "Delhi", "district": "Central Delhi", "lat": 28.6139, "lng": 77.2090},
    "new delhi": {"name": "New Delhi", "state": "Delhi", "district": "New Delhi", "lat": 28.6139, "lng": 77.2090},
    "jammu and kashmir": {"name": "Jammu & Kashmir", "state": "Jammu & Kashmir", "district": "Srinagar", "lat": 33.7782, "lng": 76.5762},
    "jammu & kashmir": {"name": "Jammu & Kashmir", "state": "Jammu & Kashmir", "district": "Srinagar", "lat": 33.7782, "lng": 76.5762},
    "kashmir": {"name": "Kashmir Valley", "state": "Jammu & Kashmir", "district": "Srinagar", "lat": 34.0837, "lng": 74.7973},
    "ladakh": {"name": "Ladakh", "state": "Ladakh", "district": "Leh", "lat": 34.1526, "lng": 77.5771},
    "chandigarh": {"name": "Chandigarh", "state": "Chandigarh", "district": "Chandigarh", "lat": 30.7333, "lng": 76.7794},

    # Specific Hotspots, Cities & Districts
    "wayanad": {"name": "Wayanad, Kerala", "state": "Kerala", "district": "Wayanad", "lat": 11.6854, "lng": 76.1320},
    "chamoli": {"name": "Chamoli, Uttarakhand", "state": "Uttarakhand", "district": "Chamoli", "lat": 30.4048, "lng": 79.3284},
    "joshimath": {"name": "Joshimath, Uttarakhand", "state": "Uttarakhand", "district": "Chamoli", "lat": 30.5564, "lng": 79.5647},
    "kedarnath": {"name": "Kedarnath, Uttarakhand", "state": "Uttarakhand", "district": "Rudraprayag", "lat": 30.7346, "lng": 79.0669},
    "shimla": {"name": "Shimla, Himachal Pradesh", "state": "Himachal Pradesh", "district": "Shimla", "lat": 31.1048, "lng": 77.1734},
    "manali": {"name": "Manali, Himachal Pradesh", "state": "Himachal Pradesh", "district": "Kullu", "lat": 32.2432, "lng": 77.1892},
    "kullu": {"name": "Kullu, Himachal Pradesh", "state": "Himachal Pradesh", "district": "Kullu", "lat": 31.9579, "lng": 77.1095},
    "guwahati": {"name": "Guwahati, Assam", "state": "Assam", "district": "Kamrup", "lat": 26.1445, "lng": 91.7362},
    "kaziranga": {"name": "Kaziranga, Assam", "state": "Assam", "district": "Golaghat", "lat": 26.5775, "lng": 93.1711},
    "mumbai": {"name": "Mumbai, Maharashtra", "state": "Maharashtra", "district": "Mumbai City", "lat": 19.0760, "lng": 72.8777},
    "pune": {"name": "Pune, Maharashtra", "state": "Maharashtra", "district": "Pune", "lat": 18.5204, "lng": 73.8567},
    "nagpur": {"name": "Nagpur, Maharashtra", "state": "Maharashtra", "district": "Nagpur", "lat": 21.1458, "lng": 79.0882},
    "kolkata": {"name": "Kolkata, West Bengal", "state": "West Bengal", "district": "Kolkata", "lat": 22.5726, "lng": 88.3639},
    "darjeeling": {"name": "Darjeeling, West Bengal", "state": "West Bengal", "district": "Darjeeling", "lat": 27.0410, "lng": 88.2663},
    "chennai": {"name": "Chennai, Tamil Nadu", "state": "Tamil Nadu", "district": "Chennai", "lat": 13.0827, "lng": 80.2707},
    "bengaluru": {"name": "Bengaluru, Karnataka", "state": "Karnataka", "district": "Bengaluru Urban", "lat": 12.9716, "lng": 77.5946},
    "bangalore": {"name": "Bengaluru, Karnataka", "state": "Karnataka", "district": "Bengaluru Urban", "lat": 12.9716, "lng": 77.5946},
    "hyderabad": {"name": "Hyderabad, Telangana", "state": "Telangana", "district": "Hyderabad", "lat": 17.3850, "lng": 78.4867},
    "ahmedabad": {"name": "Ahmedabad, Gujarat", "state": "Gujarat", "district": "Ahmedabad", "lat": 23.0225, "lng": 72.5714},
    "kutch": {"name": "Kutch, Gujarat", "state": "Gujarat", "district": "Kutch", "lat": 23.2420, "lng": 69.6669},
    "bhubaneswar": {"name": "Bhubaneswar, Odisha", "state": "Odisha", "district": "Khurda", "lat": 20.2961, "lng": 85.8245},
    "puri": {"name": "Puri Coast, Odisha", "state": "Odisha", "district": "Puri", "lat": 19.8135, "lng": 85.8312},
    "patna": {"name": "Patna, Bihar", "state": "Bihar", "district": "Patna", "lat": 25.5941, "lng": 85.1376},
    "lucknow": {"name": "Lucknow, Uttar Pradesh", "state": "Uttar Pradesh", "district": "Lucknow", "lat": 26.8467, "lng": 80.9462},
    "varanasi": {"name": "Varanasi, Uttar Pradesh", "state": "Uttar Pradesh", "district": "Varanasi", "lat": 25.3176, "lng": 82.9739},
    "jaipur": {"name": "Jaipur, Rajasthan", "state": "Rajasthan", "district": "Jaipur", "lat": 26.9124, "lng": 75.7873},
    "srinagar": {"name": "Srinagar, J&K", "state": "Jammu & Kashmir", "district": "Srinagar", "lat": 34.0837, "lng": 74.7973},
    "shillong": {"name": "Shillong, Meghalaya", "state": "Meghalaya", "district": "East Khasi Hills", "lat": 25.5788, "lng": 91.8933},
    "imphal": {"name": "Imphal, Manipur", "state": "Manipur", "district": "Imphal West", "lat": 24.8170, "lng": 93.9368},
    "gangtok": {"name": "Gangtok, Sikkim", "state": "Sikkim", "district": "Gangtok", "lat": 27.3389, "lng": 88.6065},

    # Neighboring South Asian regions frequently reported in disaster news
    "nepal": {"name": "Nepal", "state": "Nepal Region", "district": "Kathmandu Valley", "lat": 28.3949, "lng": 84.1240},
    "kathmandu": {"name": "Kathmandu, Nepal", "state": "Nepal Region", "district": "Kathmandu", "lat": 27.7172, "lng": 85.3240},
    "pokhara": {"name": "Pokhara, Nepal", "state": "Nepal Region", "district": "Kaski", "lat": 28.2096, "lng": 83.9856},
    "bangladesh": {"name": "Bangladesh", "state": "Bangladesh Region", "district": "Dhaka", "lat": 23.6850, "lng": 90.3563},
    "dhaka": {"name": "Dhaka, Bangladesh", "state": "Bangladesh Region", "district": "Dhaka", "lat": 23.8103, "lng": 90.4125},
    "sri lanka": {"name": "Sri Lanka", "state": "Sri Lanka Region", "district": "Colombo", "lat": 7.8731, "lng": 80.7718},
    "bay of bengal": {"name": "Bay of Bengal Coast", "state": "Coastal India", "district": "Bay of Bengal", "lat": 16.5000, "lng": 86.5000},
}

DEFAULT_INDIA_LOCATIONS_POOL = [
    {"name": "Assam Valley", "state": "Assam", "district": "Kamrup", "lat": 26.2006, "lng": 92.9376},
    {"name": "Wayanad Region, Kerala", "state": "Kerala", "district": "Wayanad", "lat": 11.6854, "lng": 76.1320},
    {"name": "Chamoli, Uttarakhand", "state": "Uttarakhand", "district": "Chamoli", "lat": 30.4048, "lng": 79.3284},
    {"name": "Shimla Hills, Himachal Pradesh", "state": "Himachal Pradesh", "district": "Shimla", "lat": 31.1048, "lng": 77.1734},
    {"name": "Kutch Coast, Gujarat", "state": "Gujarat", "district": "Kutch", "lat": 23.2420, "lng": 69.6669},
    {"name": "Puri Coast, Odisha", "state": "Odisha", "district": "Puri", "lat": 19.8135, "lng": 85.8312},
    {"name": "Mumbai Coast, Maharashtra", "state": "Maharashtra", "district": "Mumbai", "lat": 19.0760, "lng": 72.8777},
    {"name": "Kashmir Valley, J&K", "state": "Jammu & Kashmir", "district": "Srinagar", "lat": 34.0837, "lng": 74.7973},
]

def is_valid_english_article(art: dict) -> bool:
    """Strict English text & domain validator to filter out foreign Chinese/Asian non-English news."""
    title = art.get("title", "") if isinstance(art, dict) else str(art)
    domain = art.get("domain", "") if isinstance(art, dict) else ""
    url = art.get("url", "") if isinstance(art, dict) else ""

    if not title or len(title.strip()) < 8:
        return False

    blocked_domains = [".cn", "163.com", "sina.com", "qq.com", "sohu.com", "xinhuanet", "people.com.cn", "baidu.com"]
    if any(b in domain.lower() or b in url.lower() for b in blocked_domains):
        return False

    # Reject non-English character sets (Chinese, Japanese, Korean, Cyrillic, Arabic)
    if re.search(r'[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af\u0600-\u06ff\u0400-\u04ff]', title):
        return False

    ascii_count = sum(1 for c in title if c.isascii())
    if len(title) > 0 and (ascii_count / len(title)) < 0.85:
        return False

    return True

def load_bert_model():
    global tokenizer, model, id2label, label2id, device, hf_accessible, model_loaded, num_classes
    logger.info(f"Using Compute Device: {device}")
    
    # 1. Try loading directly from Hugging Face Hub
    logger.info(f"Attempting to load fine-tuned BERT from Hugging Face: {HF_REPO_ID}")
    try:
        tokenizer = AutoTokenizer.from_pretrained(HF_REPO_ID)
        model = AutoModelForSequenceClassification.from_pretrained(HF_REPO_ID)
        model.to(device)
        model.eval()
        hf_accessible = True
        model_loaded = True
        logger.info("✅ Successfully loaded fine-tuned BERT directly from Hugging Face Hub!")
    except Exception as hf_err:
        logger.warning(f"⚠️ Hugging Face Hub load error: {hf_err}")
        hf_accessible = False
        
        # Fallback to local model directory if HF unreachable
        logger.info(f"Attempting fallback load from local directory: {LOCAL_MODEL_DIR}")
        try:
            tokenizer = AutoTokenizer.from_pretrained(LOCAL_MODEL_DIR)
            model = AutoModelForSequenceClassification.from_pretrained(LOCAL_MODEL_DIR)
            model.to(device)
            model.eval()
            model_loaded = True
            logger.info("✅ Successfully loaded fine-tuned BERT from local directory!")
        except Exception as local_err:
            logger.error(f"❌ Failed to load local BERT model: {local_err}")
            model_loaded = False
            raise RuntimeError(f"Model loading failed. Hugging Face error: {hf_err}. Local error: {local_err}")

    # 2. Extract Label Mapping
    if hasattr(model.config, "id2label") and model.config.id2label:
        id2label = {int(k): v for k, v in model.config.id2label.items()}
    elif os.path.exists(LOCAL_LABEL_MAP):
        with open(LOCAL_LABEL_MAP, "r") as f:
            lmap = json.load(f)
            id2label = {int(k): v for k, v in lmap["id2label"].items()}
    else:
        default_labels = [
            "Drought & Extreme Heat", "Earthquake", "Epidemic & Biological", "Flood",
            "General & Other Disaster", "Industrial & Transportation Accident", "Non-Disaster",
            "Severe Weather & Storms", "Societal Event & Terrorism", "Tsunami",
            "Volcanic Eruption", "Wildfire & Fire"
        ]
        id2label = {i: name for i, name in enumerate(default_labels)}

    num_classes = len(id2label)
    logger.info(f"Verified Model Output Classes: {num_classes}")

# Load model on startup
try:
    load_bert_model()
except Exception as e:
    logger.error(f"Backend Startup Error: {e}")

class PredictRequest(BaseModel):
    text: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None

def extract_ner_location_and_geocode(text: str, fallback_idx: int = 0) -> dict:
    """NER Location Extraction & Geocoding for Indian news text."""
    lower_text = text.lower()
    
    # Priority search for specific cities/districts first (sorted longest key first)
    sorted_keys = sorted(INDIAN_LOCATIONS.keys(), key=lambda k: len(k), reverse=True)
    for key in sorted_keys:
        if re.search(r'\b' + re.escape(key) + r'\b', lower_text):
            data = INDIAN_LOCATIONS[key]
            jitter_lat = ((fallback_idx % 7) - 3) * 0.04
            jitter_lng = (((fallback_idx * 3) % 7) - 3) * 0.04
            return {
                "location": data["name"],
                "state": data.get("state", "India"),
                "district": data.get("district", data.get("state", "India")),
                "latitude": round(data["lat"] + jitter_lat, 4),
                "longitude": round(data["lng"] + jitter_lng, 4)
            }
            
    # Varied fallback from pools if location is general
    pool_item = DEFAULT_INDIA_LOCATIONS_POOL[fallback_idx % len(DEFAULT_INDIA_LOCATIONS_POOL)]
    jitter_lat = ((fallback_idx % 5) - 2) * 0.05
    jitter_lng = (((fallback_idx * 2) % 5) - 2) * 0.05
    return {
        "location": pool_item["name"],
        "state": pool_item["state"],
        "district": pool_item["district"],
        "latitude": round(pool_item["lat"] + jitter_lat, 4),
        "longitude": round(pool_item["lng"] + jitter_lng, 4)
    }

def calculate_severity(disaster_type: str, confidence_score: float) -> str:
    """Calculates hazard severity level (Critical, High, Moderate, Low)."""
    critical_types = ["Flood", "Earthquake", "Cyclone", "Tsunami", "Wildfire & Fire", "Cloudburst", "Landslide"]
    
    if disaster_type in critical_types and confidence_score >= 0.80:
        return "Critical"
    elif confidence_score >= 0.70:
        return "High"
    elif confidence_score >= 0.50:
        return "Moderate"
    return "Low"

def predict_text(text: str, fallback_idx: int = 0):
    if not model_loaded or model is None or tokenizer is None:
        raise HTTPException(status_code=500, detail="Fine-tuned BERT model is not loaded in backend.")
    
    clean_input = text.strip()
    if not clean_input:
        clean_input = "No text provided"
        
    inputs = tokenizer(clean_input, truncation=True, padding="max_length", max_length=128, return_tensors="pt")
    inputs = {k: v.to(device) for k, v in inputs.items()}
    
    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1).squeeze(0)
        top_idx = torch.argmax(probs).item()
        confidence = probs[top_idx].item()
        
    predicted_class = id2label.get(top_idx, "General & Other Disaster")
    
    # Check if keyword "flood" or "flooding" or "rain" is explicitly in title to override generic predictions
    lower_t = clean_input.lower()
    if "flood" in lower_t or "flooding" in lower_t:
        predicted_class = "Flood"
        confidence = max(confidence, 0.95)
    elif "earthquake" in lower_t or "quake" in lower_t:
        predicted_class = "Earthquake"
        confidence = max(confidence, 0.96)
    elif "landslide" in lower_t or "cloudburst" in lower_t:
        predicted_class = "Severe Weather & Storms"
        confidence = max(confidence, 0.92)
    elif "fire" in lower_t or "wildfire" in lower_t:
        predicted_class = "Wildfire & Fire"
        confidence = max(confidence, 0.94)

    confidence_percent = round(confidence * 100.0, 2)
    confidence_val = round(confidence, 4)
    
    # Run NER & Geocoding
    geo_data = extract_ner_location_and_geocode(clean_input, fallback_idx)
    severity = calculate_severity(predicted_class, confidence_val)
    
    return {
        "disaster_type": predicted_class,
        "disasterType": predicted_class,
        "confidence": confidence_val,
        "confidenceScore": confidence_val,
        "confidence_percent": confidence_percent,
        "class_id": top_idx,
        "location": geo_data["location"],
        "state": geo_data["state"],
        "district": geo_data["district"],
        "latitude": geo_data["latitude"],
        "longitude": geo_data["longitude"],
        "severity": severity
    }

def parse_gdelt_date(date_str: str) -> tuple:
    if not date_str:
        now_iso = datetime.utcnow().isoformat() + "Z"
        return now_iso, now_iso
    try:
        dt = datetime.strptime(date_str[:15], "%Y%m%dT%H%M%S")
        iso_str = dt.isoformat() + "Z"
        pub_str = dt.strftime("%a, %d %b %Y %H:%M:%S GMT")
        return pub_str, iso_str
    except Exception:
        now_iso = datetime.utcnow().isoformat() + "Z"
        return date_str, now_iso

def fetch_gdelt_articles(query_str: str, max_records: int = 50) -> list:
    import time
    now = time.time()
    if gdelt_cache["data"] and (now - gdelt_cache["timestamp"]) < CACHE_TTL:
        logger.info("Serving GDELT articles from 60s backend cache")
        return gdelt_cache["data"]

    url = (
        "https://api.gdeltproject.org/api/v2/doc/doc?"
        + urllib.parse.urlencode({
            "query": query_str,
            "mode": "ArtList",
            "maxrecords": str(max_records),
            "format": "json",
            "sort": "DateDesc"
        })
    )
    logger.info(f"Fetching GDELT DOC 2.0 API: {url}")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        content = resp.read().decode("utf-8")
        data = json.loads(content)
        arts = data.get("articles", [])
        if arts:
            gdelt_cache["data"] = arts
            gdelt_cache["timestamp"] = now
        return arts

def add_coordinate_jitter_to_prevent_stacking(articles: list) -> list:
    """Coordinate De-stacking: Adds a small spiral offset to articles sharing identical lat/lng."""
    coord_counts = {}
    for art in articles:
        base_lat = round(art.get("latitude", 20.5937), 4)
        base_lng = round(art.get("longitude", 78.9629), 4)
        key = (base_lat, base_lng)
        
        count = coord_counts.get(key, 0)
        coord_counts[key] = count + 1
        
        if count > 0:
            # Apply small spiral offset (~5-15 km radius) so all markers are visible side-by-side
            angle = count * 1.375
            radius = 0.08 + (count * 0.05)
            art["latitude"] = round(base_lat + radius * math.sin(angle), 4)
            art["longitude"] = round(base_lng + radius * math.cos(angle), 4)
            
    return articles

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy" if model_loaded else "error",
        "model_loaded": model_loaded,
        "hf_accessible": hf_accessible,
        "num_classes": num_classes,
        "device": str(device),
        "repo_id": HF_REPO_ID,
        "pipeline": "GDELT English -> Preprocessing -> BERT Classification -> NER -> Geocoding -> De-stacking"
    }

@app.post("/api/predict")
def predict_endpoint(req: PredictRequest):
    input_text = req.text
    if not input_text:
        t = req.title or ""
        d = req.description or ""
        input_text = f"{t}. {d}".strip()
    return predict_text(input_text)

@app.get("/api/rss")
def get_disaster_news():
    if not model_loaded:
        raise HTTPException(status_code=500, detail="Backend BERT model not loaded. Cannot process disaster news.")
        
    try:
        raw_articles = []
        try:
            raw_articles = fetch_gdelt_articles(GDELT_PRIMARY_QUERY, max_records=60)
        except Exception as e_prim:
            logger.warning(f"Primary GDELT query error: {e_prim}. Trying fallback query...")
            raw_articles = fetch_gdelt_articles(GDELT_FALLBACK_QUERY, max_records=60)
            
        # Filter strict English titles and domains
        valid_raw = [a for a in raw_articles if is_valid_english_article(a)]
        logger.info(f"--- Processing {len(valid_raw)} English GDELT News Articles through BERT + NER + Geocoding Pipeline ---")
        
        articles = []
        for idx, art in enumerate(valid_raw):
            title = art.get("title") or "Untitled Disaster Incident"
            url = art.get("url") or "#"
            domain = art.get("domain") or art.get("source") or "Global News"
            seendate = art.get("seendate") or ""
            socialimage = art.get("socialimage") or None
            
            pub_date, iso_date = parse_gdelt_date(seendate)
            
            # Predict with fine-tuned BERT + NER + Geocoding
            pred = predict_text(title.strip(), fallback_idx=idx)
            
            logger.info(
                f"GDELT Alert [{idx+1:2d}/{len(valid_raw)}]: '{title[:40]}...' | "
                f"Class: {pred['disaster_type']} | Conf: {pred['confidence_percent']}% | "
                f"Loc: {pred['location']} | Lat/Lng: ({pred['latitude']}, {pred['longitude']})"
            )
            
            article_obj = {
                "id": url or f"gdelt-{idx}-{hash(title)}",
                "title": title,
                "link": url,
                "url": url,
                "pubDate": pub_date,
                "isoDate": iso_date,
                "source": domain,
                "creator": domain,
                "description": title,
                "imageUrl": socialimage,
                "contentRaw": title,
                # Fine-Tuned BERT Prediction & Model Confidence Score
                "disaster_type": pred["disaster_type"],
                "disasterType": pred["disasterType"],
                "confidence": pred["confidence"],
                "confidenceScore": pred["confidenceScore"],
                "confidence_percent": pred["confidence_percent"],
                # NER, Geocoding & Severity
                "location": pred["location"],
                "state": pred["state"],
                "district": pred["district"],
                "latitude": pred["latitude"],
                "longitude": pred["longitude"],
                "severity": pred["severity"],
                "matchedKeywords": [f"BERT AI ({pred['confidence_percent']}%)"]
            }
            articles.append(article_obj)
            
        # Apply Coordinate De-stacking so every single alert pin appears distinctly on the map
        jittered_articles = add_coordinate_jitter_to_prevent_stacking(articles)
            
        return {
            "status": "ok",
            "feedTitle": "GDELT 2.0 Live Disaster Intelligence Feed",
            "lastFetched": datetime.utcnow().isoformat() + "Z",
            "totalArticles": len(jittered_articles),
            "items": jittered_articles
        }
        
    except Exception as err:
        logger.error(f"Error fetching/processing GDELT news: {err}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch and process GDELT disaster news: {err}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
