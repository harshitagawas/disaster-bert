from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

repo_id = "harry2708/disaster-bert"
print(f"Testing direct load from Hugging Face Hub: {repo_id}...")

tokenizer = AutoTokenizer.from_pretrained(repo_id)
model = AutoModelForSequenceClassification.from_pretrained(repo_id)

print("✅ Model and Tokenizer loaded successfully from Hugging Face Hub!")
print(f"Number of classes: {model.config.num_labels}")
print("Label mapping sample:", {k: v for k, v in list(model.config.id2label.items())[:3]})

text = "Flood situation in Assam improves marginally as river water recedes"
inputs = tokenizer(text, return_tensors="pt")
with torch.no_grad():
    logits = model(**inputs).logits
    probs = torch.softmax(logits, dim=1).squeeze(0)
    top_idx = torch.argmax(probs).item()
    conf = probs[top_idx].item()

pred_label = model.config.id2label[top_idx]
print(f"Inference Test: '{text}' ➔ Prediction: {pred_label} ({conf*100:.2f}% Conf)")
