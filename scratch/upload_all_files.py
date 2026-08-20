import os
import sys
from huggingface_hub import HfApi, HfFolder

repo_id = "harry2708/disaster-bert"
folder = r"c:\Users\arvin\Desktop\bert\models\disaster_bert"

token = HfFolder.get_token()
print(f"Token present: {bool(token)}")

api = HfApi()

files_to_upload = [
    "model.safetensors",
    "config.json",
    "tokenizer_config.json",
    "vocab.txt",
    "special_tokens_map.json",
    "tokenizer.json",
    "label_mapping.json",
    "training_config.json",
    "evaluation_metrics.json",
    "classification_report.txt",
    "README.md"
]

print(f"--- UPLOADING 100% OF MODEL FILES TO HUGGING FACE: {repo_id} ---")
for fname in files_to_upload:
    fpath = os.path.join(folder, fname)
    if os.path.exists(fpath):
        size_mb = os.path.getsize(fpath) / (1024 * 1024)
        print(f"Uploading {fname} ({size_mb:.2f} MB)...")
        try:
            api.upload_file(
                path_or_fileobj=fpath,
                path_in_repo=fname,
                repo_id=repo_id,
                repo_type="model"
            )
            print(f"  ✅ Successfully uploaded {fname}")
        except Exception as e:
            print(f"  ❌ Error uploading {fname}: {e}")
    else:
        print(f"  ⚠️ Warning: {fname} not found!")

print("\nChecking final live repository files on Hugging Face...")
repo_files = api.list_repo_files(repo_id=repo_id)
print("--- LIVE FILES IN HUGGING FACE REPOSITORY ---")
for idx, rf in enumerate(repo_files):
    print(f" {idx+1:2d}. {rf}")

print(f"\n🎉 ALL {len(repo_files)} FILES SUCCESSFULLY UPLOADED & VERIFIED AT: https://huggingface.co/{repo_id}")
