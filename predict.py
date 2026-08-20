import os
import sys
import json
import torch
import numpy as np
import argparse
from transformers import AutoTokenizer, AutoModelForSequenceClassification

def main():
    parser = argparse.ArgumentParser(description="Disaster News Text Classification Inference CLI")
    parser.add_argument("--text", type=str, required=True, help="Input news headline or tweet text")
    parser.add_argument("--model_dir", type=str, default=r"c:\Users\arvin\Desktop\bert\models\disaster_bert", help="Path to saved model directory")
    args = parser.parse_args()

    weights_dir = os.path.join(args.model_dir, "model")
    mapping_file = os.path.join(args.model_dir, "label_mapping.json")

    if not os.path.exists(weights_dir) or not os.path.exists(mapping_file):
        print(f"Error: Model directory '{args.model_dir}' not found or incomplete.")
        sys.exit(1)

    with open(mapping_file, "r") as f:
        mapping = json.load(f)
    
    id2label = {int(k): v for k, v in mapping["id2label"].items()}

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    tokenizer = AutoTokenizer.from_pretrained(weights_dir)
    model = AutoModelForSequenceClassification.from_pretrained(weights_dir)
    model.to(device)
    model.eval()

    inputs = tokenizer(args.text, truncation=True, padding="max_length", max_length=128, return_tensors="pt")
    input_ids = inputs["input_ids"].to(device)
    attention_mask = inputs["attention_mask"].to(device)

    with torch.no_grad():
        outputs = model(input_ids=input_ids, attention_mask=attention_mask)
        probs = torch.softmax(outputs.logits, dim=1).squeeze(0).cpu().numpy()
        pred_idx = int(np.argmax(probs))
        pred_label = id2label[pred_idx]
        confidence = float(probs[pred_idx]) * 100.0

    print("\n--- Disaster Intelligence Text Classifier ---")
    print(f"Input text: \"{args.text}\"")
    print(f"Predicted disaster class: {pred_label}")
    print(f"Confidence score: {confidence:.2f}%\n")
    print("Class Probability Distribution:")
    sorted_probs = sorted([(id2label[i], float(probs[i]) * 100.0) for i in range(len(id2label))], key=lambda x: x[1], reverse=True)
    for cls_name, prob in sorted_probs:
        bar = "█" * int(prob / 5)
        print(f"  {cls_name:<38} : {prob:6.2f}% {bar}")

if __name__ == "__main__":
    main()
