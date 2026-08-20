import os

def get_dir_size(path):
    total = 0
    for root, dirs, files in os.walk(path):
        if 'node_modules' in root or '.git' in root or 'models' in root or 'data' in root or '__pycache__' in root or 'dist' in root:
            continue
        for f in files:
            fp = os.path.join(root, f)
            if not os.path.islink(fp):
                total += os.path.getsize(fp)
    return total

repo_size_mb = get_dir_size(r"c:\Users\arvin\Desktop\bert") / (1024 * 1024)
print(f"Git-trackable Repository Size: {repo_size_mb:.2f} MB")
print("Is < 100 MB GitHub limit?", repo_size_mb < 100)
