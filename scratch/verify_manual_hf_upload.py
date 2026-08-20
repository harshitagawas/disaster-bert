import sys
from huggingface_hub import HfApi
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

repo_id = "harry2708/disaster-bert"
print(f"--- 1. CHECKING HUGGING FACE REPOSITORY: https://huggingface.co/{repo_id} ---")

try:
    api = HfApi()
    files = api.list_repo_files(repo_id=repo_id)
    print(f"✅ Repository is PUBLIC and accessible! Found {len(files)} files:")
    for idx, f in enumerate(files):
        print(f" {idx+1:2d}. {f}")
except Exception as e:
    print(f"❌ Failed to list repo files: {e}")

print(f"\n--- 2. TESTING DIRECT TRANSFORMERS LOAD FROM HUGGING FACE ---")
try:
    tokenizer = AutoTokenizer.from_pretrained(repo_id)
    model = AutoModelForSequenceClassification.from_pretrained(repo_id)
    print("✅ SUCCESS! AutoTokenizer and AutoModelForSequenceClassification loaded directly from Hugging Face Hub!")
    print(f"Model num_classes: {model.config.num_labels}")
    
    # Test sample inference
    text = "Flood situation in Assam improves marginally as river water recedes"
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=128)
    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1).squeeze(0)
        top_idx = torch.argmax(probs).item()
        confidence = probs[top_idx].item()

    pred_label = model.config.id2label[top_idx]
    print(f"\n--- 3. LIVE HF INFERENCE TEST ---")
    print(f"Text Input  : '{text}'")
    print(f"Predicted   : {pred_label}")
    print(f"Confidence  : {confidence * 100:.2f}%")
    print(f"\n🎉 VERIFICATION SUCCESSFUL! Model 'harry2708/disaster-bert' is 100% working directly from Hugging Face!")
    
except Exception as err:
    print(f"❌ Hugging Face Load Failed: {err}")
    sys.exit(1)
