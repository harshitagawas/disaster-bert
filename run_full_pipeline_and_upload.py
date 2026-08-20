import os
import sys
import time
import json
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

base_dir = r"c:\Users\arvin\Desktop\bert"
model_dir = os.path.join(base_dir, "models", "disaster_bert")
weights_dir = os.path.join(model_dir, "model")
repo_id = "harry2708/disaster-bert"

print("="*70)
print("1. RUNNING FULL-SCALE 4-EPOCH BERT TRAINING PIPELINE")
print("="*70)

# Import and execute train.py logic directly
sys.path.append(os.path.join(base_dir, "src"))
import train

print("\n" + "="*70)
print("2. VERIFYING SAVED MODEL FILE SIZE")
print("="*70)

safetensors_path = os.path.join(weights_dir, "model.safetensors")
if not os.path.exists(safetensors_path):
    print(f"❌ ERROR: {safetensors_path} does not exist!")
    sys.exit(1)

file_size_bytes = os.path.getsize(safetensors_path)
file_size_mb = file_size_bytes / (1024 * 1024)
print(f"✅ Verified model.safetensors exists!")
print(f"   Path: {safetensors_path}")
print(f"   Size: {file_size_bytes:,} bytes ({file_size_mb:.2f} MB)")

print("\n" + "="*70)
print("3. VERIFYING MODEL & TOKENIZER LOADABILITY")
print("="*70)

try:
    tokenizer = AutoTokenizer.from_pretrained(weights_dir)
    print("✅ AutoTokenizer loaded successfully from weights directory!")
except Exception as e:
    print(f"❌ Failed to load AutoTokenizer: {e}")
    sys.exit(1)

try:
    model = AutoModelForSequenceClassification.from_pretrained(weights_dir)
    print("✅ AutoModelForSequenceClassification loaded successfully from weights directory!")
    print(f"   Model num_labels: {model.config.num_labels}")
except Exception as e:
    print(f"❌ Failed to load AutoModelForSequenceClassification: {e}")
    sys.exit(1)

print("\n" + "="*70)
print("4. UPLOADING ARTIFACTS TO HUGGING FACE REPOSITORY")
print(f"   Target Repository: https://huggingface.co/{repo_id}")
print("="*70)

try:
    from huggingface_hub import HfApi, create_repo
    api = HfApi()
    
    # Ensure repository exists
    try:
        create_repo(repo_id=repo_id, repo_type="model", exist_ok=True)
        print(f"✅ Repository '{repo_id}' ready on Hugging Face.")
    except Exception as e:
        print(f"ℹ️ Repo notice: {e}")
        
    # Upload weights, tokenizer, config
    print("Uploading model weights, config, and tokenizer files...")
    api.upload_folder(
        folder_path=weights_dir,
        repo_id=repo_id,
        repo_type="model"
    )
    print("✅ Model folder uploaded successfully.")
    
    # Upload metadata & report files
    extra_files = [
        "label_mapping.json",
        "training_config.json",
        "evaluation_metrics.json",
        "classification_report.txt"
    ]
    for ef in extra_files:
        ef_path = os.path.join(model_dir, ef)
        if os.path.exists(ef_path):
            print(f"Uploading {ef}...")
            api.upload_file(
                path_or_fileobj=ef_path,
                path_in_repo=ef,
                repo_id=repo_id,
                repo_type="model"
            )
            print(f"✅ {ef} uploaded successfully.")
            
    hf_url = f"https://huggingface.co/{repo_id}"
    print("\n" + "="*70)
    print("🚀 HUGGING FACE UPLOAD SUCCESSFUL!")
    print(f"Final Model Repository URL: {hf_url}")
    print("="*70)

except Exception as e:
    print(f"❌ Hugging Face Upload Error: {e}")
    print("\nNote: Please ensure you are logged into Hugging Face CLI via 'huggingface-cli login'.")
    sys.exit(1)
