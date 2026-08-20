import os
import sys
from huggingface_hub import HfApi, HfFolder

repo_id = "harry2708/disaster-bert"
folder_path = r"c:\Users\arvin\Desktop\bert\models\disaster_bert"

token = HfFolder.get_token()
print(f"Token present: {bool(token)}")

api = HfApi()

try:
    print(f"Starting upload of {folder_path} to HF repo {repo_id}...")
    api.upload_folder(
        folder_path=folder_path,
        repo_id=repo_id,
        repo_type="model",
        ignore_patterns=["model/*", "model", "*.pyc"]
    )
    print(f"✅ SUCCESSFULLY UPLOADED ALL MODEL FILES TO HUGGING FACE: https://huggingface.co/{repo_id}")
except Exception as e:
    print(f"❌ Upload error: {e}")
    sys.exit(1)
