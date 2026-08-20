import os
import time
import json
import torch
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from torch.utils.data import Dataset, DataLoader
from transformers import AutoTokenizer, AutoModelForSequenceClassification, get_linear_schedule_with_warmup
from sklearn.metrics import classification_report, accuracy_score, f1_score, precision_recall_fscore_support, confusion_matrix

# 1. Reproducibility
SEED = 42
torch.manual_seed(SEED)
torch.cuda.manual_seed_all(SEED)
np.random.seed(SEED)

base_dir = r"c:\Users\arvin\Desktop\bert"
data_dir = os.path.join(base_dir, "data")
proc_dir = os.path.join(data_dir, "processed")
split_dir = os.path.join(data_dir, "splits")
model_dir = os.path.join(base_dir, "models", "disaster_bert")
weights_dir = model_dir

os.makedirs(model_dir, exist_ok=True)

print("="*70)
print("STARTING FULL-SCALE BERT FINE-TUNING PIPELINE")
print("="*70)

# Hardware setup
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Compute Device: {device}")
if torch.cuda.is_available():
    print(f"GPU Model: {torch.cuda.get_device_name(0)}")

# 2. Load Label Mapping and Splits
with open(os.path.join(proc_dir, "label_mapping.json"), "r") as f:
    label_mapping = json.load(f)

label2id = label_mapping["label2id"]
id2label = {int(k): v for k, v in label_mapping["id2label"].items()}
num_labels = len(label2id)

print(f"Loaded 12-class label mapping. Num classes: {num_labels}")

train_df = pd.read_csv(os.path.join(split_dir, "train.csv"))
val_df = pd.read_csv(os.path.join(split_dir, "val.csv"))
test_df = pd.read_csv(os.path.join(split_dir, "test.csv"))

print(f"Dataset Split Sizes -> Train: {len(train_df)}, Val: {len(val_df)}, Test: {len(test_df)}")
print(f"Total Records: {len(train_df) + len(val_df) + len(test_df)}")

# 3. Tokenizer & DataLoader
MODEL_NAME = "bert-base-uncased"
BATCH_SIZE = 32
MAX_LEN = 128
EPOCHS = 4
LEARNING_RATE = 2e-5
EARLY_STOPPING_PATIENCE = 2

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

class DisasterDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len=128):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len
        
    def __len__(self):
        return len(self.texts)
        
    def __getitem__(self, idx):
        text = str(self.texts[idx])
        encoding = self.tokenizer(
            text,
            truncation=True,
            padding="max_length",
            max_length=self.max_len,
            return_tensors="pt"
        )
        return {
            "input_ids": encoding["input_ids"].squeeze(0),
            "attention_mask": encoding["attention_mask"].squeeze(0),
            "labels": torch.tensor(self.labels[idx], dtype=torch.long)
        }

train_dataset = DisasterDataset(train_df['clean_text'].values, train_df['target'].values, tokenizer, MAX_LEN)
val_dataset = DisasterDataset(val_df['clean_text'].values, val_df['target'].values, tokenizer, MAX_LEN)
test_dataset = DisasterDataset(test_df['clean_text'].values, test_df['target'].values, tokenizer, MAX_LEN)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, pin_memory=True)
val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, pin_memory=True)
test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False, pin_memory=True)

# 4. Model & Optimizer Initialization
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=num_labels)
model.to(device)

optimizer = torch.optim.AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=0.01)
total_steps = len(train_loader) * EPOCHS
scheduler = get_linear_schedule_with_warmup(optimizer, num_warmup_steps=int(0.1*total_steps), num_training_steps=total_steps)

# 5. Training Loop with Best Validation Macro F1 Tracking
start_time = time.time()
best_val_macro_f1 = 0.0
best_epoch = 0
patience_counter = 0

history = {
    "train_loss": [],
    "val_loss": [],
    "val_accuracy": [],
    "val_macro_f1": [],
    "val_weighted_f1": []
}

print("\n" + "="*70)
print("COMMENCING BERT FINE-TUNING")
print("="*70)

for epoch in range(1, EPOCHS + 1):
    epoch_start = time.time()
    model.train()
    total_train_loss = 0.0
    
    for step, batch in enumerate(train_loader):
        b_input_ids = batch["input_ids"].to(device)
        b_attention_mask = batch["attention_mask"].to(device)
        b_labels = batch["labels"].to(device)
        
        optimizer.zero_grad()
        outputs = model(input_ids=b_input_ids, attention_mask=b_attention_mask, labels=b_labels)
        
        loss = outputs.loss
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()
        scheduler.step()
        
        total_train_loss += loss.item()
        
        if (step + 1) % 500 == 0 or (step + 1) == len(train_loader):
            pct_epoch = (step + 1) / len(train_loader) * 100.0
            print(f"Epoch [{epoch}/{EPOCHS}] | Step [{step+1}/{len(train_loader)}] ({pct_epoch:.1f}%) | Batch Loss: {loss.item():.4f}", flush=True)
            
    avg_train_loss = total_train_loss / len(train_loader)
    
    # Validation Pass
    model.eval()
    val_loss = 0.0
    val_preds = []
    val_targets = []
    
    with torch.no_grad():
        for batch in val_loader:
            b_input_ids = batch["input_ids"].to(device)
            b_attention_mask = batch["attention_mask"].to(device)
            b_labels = batch["labels"].to(device)
            
            outputs = model(input_ids=b_input_ids, attention_mask=b_attention_mask, labels=b_labels)
            val_loss += outputs.loss.item()
            
            preds = torch.argmax(outputs.logits, dim=1).cpu().numpy()
            val_preds.extend(preds)
            val_targets.extend(b_labels.cpu().numpy())
            
    avg_val_loss = val_loss / len(val_loader)
    val_acc = accuracy_score(val_targets, val_preds)
    val_macro_f1 = f1_score(val_targets, val_preds, average="macro")
    val_weighted_f1 = f1_score(val_targets, val_preds, average="weighted")
    epoch_duration = time.time() - epoch_start
    
    history["train_loss"].append(avg_train_loss)
    history["val_loss"].append(avg_val_loss)
    history["val_accuracy"].append(val_acc)
    history["val_macro_f1"].append(val_macro_f1)
    history["val_weighted_f1"].append(val_weighted_f1)
    
    print(f"\n--- Epoch {epoch} Results (Duration: {epoch_duration:.1f}s) ---")
    print(f"Train Loss: {avg_train_loss:.4f} | Val Loss: {avg_val_loss:.4f}")
    print(f"Val Acc: {val_acc:.4f} | Val Macro F1: {val_macro_f1:.4f} | Val Weighted F1: {val_weighted_f1:.4f}")
    
    # Save Best Model Checkpoint based on Validation Macro F1
    if val_macro_f1 > best_val_macro_f1:
        print(f"🔥 Best Validation Macro F1 improved from {best_val_macro_f1:.4f} to {val_macro_f1:.4f}! Saving checkpoint...")
        best_val_macro_f1 = val_macro_f1
        best_epoch = epoch
        patience_counter = 0
        
        # Save model, tokenizer, and config
        model.save_pretrained(weights_dir)
        tokenizer.save_pretrained(weights_dir)
    else:
        patience_counter += 1
        print(f"No improvement in Validation Macro F1 for {patience_counter} epoch(s).")
        if patience_counter >= EARLY_STOPPING_PATIENCE:
            print(f"Early stopping triggered at epoch {epoch}.")
            break

total_training_duration = time.time() - start_time
print(f"\nTraining completed in {total_training_duration/60:.2f} minutes.")
print(f"Best Epoch: {best_epoch} with Validation Macro F1: {best_val_macro_f1:.4f}")

# 6. Load Best Model Checkpoint for Final Test Evaluation
print("\n" + "="*70)
print("LOADING BEST MODEL CHECKPOINT FOR HELD-OUT TEST SET EVALUATION")
print("="*70)

best_model = AutoModelForSequenceClassification.from_pretrained(weights_dir)
best_model.to(device)
best_model.eval()

test_preds = []
test_targets = []
test_probs = []

with torch.no_grad():
    for batch in test_loader:
        b_input_ids = batch["input_ids"].to(device)
        b_attention_mask = batch["attention_mask"].to(device)
        b_labels = batch["labels"].to(device)
        
        outputs = best_model(input_ids=b_input_ids, attention_mask=b_attention_mask)
        probs = torch.softmax(outputs.logits, dim=1)
        preds = torch.argmax(probs, dim=1).cpu().numpy()
        
        test_preds.extend(preds)
        test_targets.extend(b_labels.cpu().numpy())
        test_probs.extend(probs.cpu().numpy())

# Calculate Final Test Metrics
test_acc = accuracy_score(test_targets, test_preds)
test_precision, test_recall, test_f1_macro, _ = precision_recall_fscore_support(test_targets, test_preds, average="macro")
_, _, test_f1_weighted, _ = precision_recall_fscore_support(test_targets, test_preds, average="weighted")

print(f"FINAL TEST ACCURACY:    {test_acc:.4f}")
print(f"FINAL TEST PRECISION:   {test_precision:.4f}")
print(f"FINAL TEST RECALL:      {test_recall:.4f}")
print(f"FINAL TEST MACRO F1:    {test_f1_macro:.4f}")
print(f"FINAL TEST WEIGHTED F1: {test_f1_weighted:.4f}")

# Classification Report
target_names = [id2label[i] for i in range(num_labels)]
clf_report = classification_report(test_targets, test_preds, target_names=target_names, digits=4)
print("\nFINAL CLASSIFICATION REPORT:\n", clf_report)

# Save Classification Report
with open(os.path.join(model_dir, "classification_report.txt"), "w") as f:
    f.write(f"FINAL DISASTER BERT CLASSIFICATION REPORT\n")
    f.write(f"=========================================\n\n")
    f.write(clf_report)

# Save Evaluation Metrics JSON
metrics_dict = {
    "test_accuracy": float(test_acc),
    "test_precision_macro": float(test_precision),
    "test_recall_macro": float(test_recall),
    "test_macro_f1": float(test_f1_macro),
    "test_weighted_f1": float(test_f1_weighted),
    "best_epoch": int(best_epoch),
    "best_val_macro_f1": float(best_val_macro_f1),
    "total_training_duration_seconds": float(total_training_duration)
}
with open(os.path.join(model_dir, "evaluation_metrics.json"), "w") as f:
    json.dump(metrics_dict, f, indent=2)

# Save Training Configuration JSON
config_dict = {
    "model_name": MODEL_NAME,
    "num_classes": num_labels,
    "batch_size": BATCH_SIZE,
    "max_sequence_length": MAX_LEN,
    "learning_rate": LEARNING_RATE,
    "optimizer": "AdamW",
    "loss_function": "CrossEntropyLoss",
    "random_seed": SEED,
    "total_raw_records": 259877,
    "total_cleaned_records": len(train_df) + len(val_df) + len(test_df),
    "train_samples": len(train_df),
    "val_samples": len(val_df),
    "test_samples": len(test_df),
    "epochs_trained": len(history["train_loss"])
}
with open(os.path.join(model_dir, "training_config.json"), "w") as f:
    json.dump(config_dict, f, indent=2)

with open(os.path.join(model_dir, "label_mapping.json"), "w") as f:
    json.dump(label_mapping, f, indent=2)

with open(os.path.join(model_dir, "training_history.json"), "w") as f:
    json.dump(history, f, indent=2)

# Confusion Matrix Plot
cm = confusion_matrix(test_targets, test_preds)
plt.figure(figsize=(12, 10))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=target_names, yticklabels=target_names)
plt.title('Final Disaster BERT Confusion Matrix (Test Set)', fontsize=14, fontweight='bold')
plt.xlabel('Predicted Label', fontsize=12)
plt.ylabel('True Label', fontsize=12)
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
cm_path = os.path.join(model_dir, "confusion_matrix.png")
plt.savefig(cm_path, dpi=300)
plt.close()

# Loss and Metric Curves Plot
fig, ax1 = plt.subplots(figsize=(10, 5))
ax1.plot(range(1, len(history["train_loss"]) + 1), history["train_loss"], label="Train Loss", color="blue", marker="o")
ax1.plot(range(1, len(history["val_loss"]) + 1), history["val_loss"], label="Val Loss", color="orange", marker="o")
ax1.set_xlabel("Epoch")
ax1.set_ylabel("Loss")

ax2 = ax1.twinx()
ax2.plot(range(1, len(history["val_macro_f1"]) + 1), history["val_macro_f1"], label="Val Macro F1", color="green", marker="s", linestyle="--")
ax2.set_ylabel("Macro F1")

plt.title("Disaster BERT Training & Validation Performance Curves", fontsize=14, fontweight="bold")
fig.tight_layout()
curves_path = os.path.join(model_dir, "loss_metrics_curves.png")
plt.savefig(curves_path, dpi=300)
plt.close()

# 7. Standalone Inference Verification on Mandatory Examples
print("\n" + "="*70)
print("RUNNING STANDALONE INFERENCE ON MANDATORY TEST EXAMPLES")
print("="*70)

mandatory_sentences = [
    "Heavy rainfall caused severe flooding in Assam.",
    "A massive 7.2 magnitude earthquake struck the coast of Japan.",
    "Forest fires spreading rapidly across California due to high winds.",
    "The stock market reached an all time high today after corporate earnings report."
]

def predict_disaster(text, model, tokenizer, device, id2label):
    model.eval()
    encoding = tokenizer(text, truncation=True, padding="max_length", max_length=MAX_LEN, return_tensors="pt")
    input_ids = encoding["input_ids"].to(device)
    attention_mask = encoding["attention_mask"].to(device)
    
    with torch.no_grad():
        outputs = model(input_ids=input_ids, attention_mask=attention_mask)
        probs = torch.softmax(outputs.logits, dim=1).squeeze(0).cpu().numpy()
        pred_idx = int(np.argmax(probs))
        pred_label = id2label[pred_idx]
        confidence = float(probs[pred_idx]) * 100.0
        
        prob_dist = {id2label[i]: float(probs[i]) for i in range(len(id2label))}
        return pred_label, confidence, prob_dist

inference_results = []
for text in mandatory_sentences:
    p_label, conf, dist = predict_disaster(text, best_model, tokenizer, device, id2label)
    print(f"\nInput: \"{text}\"")
    print(f"Predicted class: {p_label}")
    print(f"Confidence: {conf:.2f}%")
    top_3 = sorted(dist.items(), key=lambda x: x[1], reverse=True)[:3]
    print(f"Top 3 Probabilities: {top_3}")
    inference_results.append({
        "input": text,
        "predicted_class": p_label,
        "confidence_pct": conf,
        "top_3_probabilities": top_3
    })

with open(os.path.join(model_dir, "inference_sample_output.json"), "w") as f:
    json.dump(inference_results, f, indent=2)

print("\n" + "="*70)
print("FULL BERT FINE-TUNING PIPELINE COMPLETED SUCCESSFULLY!")
print("="*70)
