from huggingface_hub import HfApi

repo_id = "harry2708/disaster-bert"
api = HfApi()

print(f"Checking files present in Hugging Face repository {repo_id}...")
files = api.list_repo_files(repo_id=repo_id)

print("\n--- FILES PRESENT IN HUGGING FACE REPOSITORY ---")
for idx, f in enumerate(files):
    print(f" {idx+1:2d}. {f}")

print(f"\nTotal Files in Repository: {len(files)}")
