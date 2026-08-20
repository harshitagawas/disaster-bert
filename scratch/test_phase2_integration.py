import os
import sys
import json
import torch
import requests
from transformers import AutoTokenizer, AutoModelForSequenceClassification

print("="*70)
print("PHASE 2 INTEGRATION VERIFICATION SCRIPT")
print("="*70)

HF_REPO_ID = "harry2708/disaster-bert"

# 1. Verify Hugging Face Repository & Model Access
print("\n1. VERIFYING HUGGING FACE MODEL ACCESSIBILITY...")
hf_accessible = False
model_loaded = False
num_classes = 0

try:
    print(f"Loading AutoTokenizer.from_pretrained('{HF_REPO_ID}')...")
    tokenizer = AutoTokenizer.from_pretrained(HF_REPO_ID)
    print("Loading AutoModelForSequenceClassification.from_pretrained('{HF_REPO_ID}')...")
    model = AutoModelForSequenceClassification.from_pretrained(HF_REPO_ID)
    model.eval()
    hf_accessible = True
    model_loaded = True
    num_classes = model.config.num_labels
    print(f"✅ Hugging Face Model Loaded Successfully! Output classes: {num_classes}")
except Exception as e:
    print(f"❌ HF Load Error: {e}")
    # Fallback local
    local_dir = r"c:\Users\arvin\Desktop\bert\models\disaster_bert\model"
    print(f"Fallback: Loading from {local_dir}...")
    tokenizer = AutoTokenizer.from_pretrained(local_dir)
    model = AutoModelForSequenceClassification.from_pretrained(local_dir)
    model.eval()
    model_loaded = True
    num_classes = model.config.num_labels
    print(f"✅ Local Model Loaded Successfully! Output classes: {num_classes}")

# 2. Extract Label Mapping
if hasattr(model.config, "id2label") and model.config.id2label:
    id2label = {int(k): v for k, v in model.config.id2label.items()}
else:
    with open(r"c:\Users\arvin\Desktop\bert\models\disaster_bert\label_mapping.json", "r") as f:
        lmap = json.load(f)
        id2label = {int(k): v for k, v in lmap["id2label"].items()}

print(f"\nLabel Mapping (12 Classes):")
for cid, cname in sorted(id2label.items()):
    print(f"  Class {cid:2d}: {cname}")

# 3. Test 4 Mandatory Sentences (Requirement 13)
print("\n" + "="*70)
print("2. TESTING 4 MANDATORY TEST SENTENCES (Requirement 13)")
print("="*70)

test_sentences = [
    ("Heavy rainfall caused severe flooding in Assam.", "Flood"),
    ("A massive 7.2 magnitude earthquake struck the coast of Japan.", "Earthquake"),
    ("Forest fires spreading rapidly across California due to high winds.", "Wildfire & Fire"),
    ("The stock market reached an all time high today after corporate earnings report.", "Non-Disaster")
]

def predict_single(text):
    inputs = tokenizer(text, truncation=True, padding="max_length", max_length=128, return_tensors="pt")
    with torch.no_grad():
        logits = model(**inputs).logits
        probs = torch.softmax(logits, dim=1).squeeze(0)
        idx = torch.argmax(probs).item()
        conf = probs[idx].item()
    return id2label[idx], round(conf, 4), round(conf * 100, 2)

sentence_results = []
for text, expected in test_sentences:
    pred_class, conf, conf_pct = predict_single(text)
    match = "✅ MATCH" if pred_class.lower() == expected.lower() else "⚠️ MISMATCH"
    print(f"\nInput: \"{text}\"")
    print(f"  Predicted Class : {pred_class}")
    print(f"  Expected Class  : {expected}")
    print(f"  Confidence      : {conf} ({conf_pct}%) | Status: {match}")
    sentence_results.append({
        "text": text,
        "expected": expected,
        "predicted": pred_class,
        "confidence": conf,
        "confidence_percent": conf_pct
    })

# 4. Test Live RSS Feed Ingestion with BERT Predictions (Requirement 14)
print("\n" + "="*70)
print("3. TESTING LIVE RSS FEED INGESTION & BERT PREDICTIONS (Requirement 14)")
print("="*70)

import urllib.request
import re
import xml.etree.ElementTree as ET

rss_url = "https://rss.app/feeds/xW4HdAH1eJAyriQT.xml"
print(f"Fetching live RSS feed from: {rss_url}...")

req = urllib.request.Request(rss_url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    xml_bytes = resp.read()

root = ET.fromstring(xml_bytes)
channel = root.find('channel')
items = channel.findall('item') if channel is not None else []
print(f"Fetched {len(items)} RSS items successfully.\n")

sample_rss_articles = []
for idx, item in enumerate(items):
    title = item.find('title').text if item.find('title') is not None and item.find('title').text else "Untitled Incident"
    desc_raw = item.find('description').text if item.find('description') is not None and item.find('description').text else ""
    clean_desc = re.sub(r'<[^>]+>', ' ', desc_raw).strip()
    
    combined_text = f"{title}. {clean_desc}".strip()
    pred_class, conf, conf_pct = predict_single(combined_text)
    
    print(f"Article [{idx+1:2d}/{len(items)}]: '{title[:55]}...'")
    print(f"  ➔ Predicted Class : {pred_class}")
    print(f"  ➔ Confidence      : {conf} ({conf_pct}%)\n")
    
    if idx < 3:
        sample_rss_articles.append({
            "title": title,
            "predicted_class": pred_class,
            "confidence": conf,
            "confidence_percent": conf_pct,
            "description": clean_desc[:150]
        })

print("="*70)
print("PHASE 2 INTEGRATION VERIFICATION COMPLETE")
print("="*70)

summary = {
    "hf_accessible": hf_accessible,
    "model_loaded": model_loaded,
    "num_classes": num_classes,
    "sentence_tests": sentence_results,
    "sample_rss_articles": sample_rss_articles
}

with open(r"c:\Users\arvin\Desktop\bert\scratch\phase2_verification_summary.json", "w") as f:
    json.dump(summary, f, indent=2)
