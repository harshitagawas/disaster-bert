import os
import sys
from huggingface_hub import HfApi, HfFolder

token = HfFolder.get_token()
if not token:
    print("❌ Hugging Face token not found. Please log in using 'huggingface-cli login' or 'hf auth login'.")
    sys.exit(1)

repo_id = "harry2708/disaster-bert"
folder = r"c:\Users\arvin\Desktop\bert\models\disaster_bert"
api = HfApi(token=token)

print(f"Creating/verifying PUBLIC repository: https://huggingface.co/{repo_id}")
api.create_repo(repo_id=repo_id, repo_type="model", exist_ok=True, private=False)

print(f"\n--- UPLOADING ALL MODEL FILES FROM {folder} TO {repo_id} ---")
api.upload_folder(
    folder_path=folder,
    repo_id=repo_id,
    repo_type="model",
    commit_message="Upload fine-tuned BERT disaster model weights, tokenizer, and metrics",
    ignore_patterns=["model/*", "model", "*.pyc"]
)

print(f"\n✅ SUCCESS! All model files uploaded to: https://huggingface.co/{repo_id}")

repo_files = api.list_repo_files(repo_id=repo_id)
print("\n--- REPOSITORY FILES VERIFIED ON HUGGING FACE ---")
for idx, f in enumerate(repo_files):
    print(f" {idx+1:2d}. {f}")
