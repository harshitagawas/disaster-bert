import os
import sys
from huggingface_hub import HfApi, HfFolder
from transformers import AutoTokenizer, AutoModelForSequenceClassification

token = HfFolder.get_token()
print(f"Token present: {bool(token)}")

api = HfApi(token=token)
repo_id = "harry2708/disaster-bert"
folder = r"c:\Users\arvin\Desktop\bert\models\disaster_bert"

# 1. Ensure repository exists and is set to PUBLIC
try:
    repo_info = api.create_repo(repo_id=repo_id, repo_type="model", exist_ok=True, private=False)
    print(f"Repository status: https://huggingface.co/{repo_id} (Private: {repo_info.private})")
except Exception as e:
    print(f"Repo status check: {e}")

# 2. Upload entire folder synchronously with single commit
print(f"Uploading all model files from {folder} to {repo_id}...")
api.upload_folder(
    folder_path=folder,
    repo_id=repo_id,
    repo_type="model",
    commit_message="Upload fine-tuned BERT 4-epoch disaster model weights and metadata",
    ignore_patterns=["model/*", "model", "*.pyc"]
)

print("✅ Folder upload completed!")

# 3. List repo files to verify
files = api.list_repo_files(repo_id=repo_id)
print("\n--- LIVE FILES ON HUGGING FACE HUB ---")
for idx, f in enumerate(files):
    print(f" {idx+1:2d}. {f}")

# 4. Test transformers loading from Hub
print("\nTesting transformers load directly from HF Hub...")
try:
    tokenizer = AutoTokenizer.from_pretrained(repo_id, token=token)
    model = AutoModelForSequenceClassification.from_pretrained(repo_id, token=token)
    print("✅ TRANSFORMERS LOAD SUCCESSFUL! Model is live and accessible on Hugging Face Hub!")
except Exception as err:
    print(f"❌ Transformers load error: {err}")
    sys.exit(1)
