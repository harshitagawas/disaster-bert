import os
import glob
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

SEED = 42
base_dir = r"c:\Users\arvin\Desktop\bert"
data_dir = os.path.join(base_dir, "data")
proc_dir = os.path.join(data_dir, "processed")
split_dir = os.path.join(data_dir, "splits")

os.makedirs(proc_dir, exist_ok=True)
os.makedirs(split_dir, exist_ok=True)

print("="*70)
print("PHASE 1 DATASET PREPROCESSING & DEDUPLICATION PIPELINE")
print("="*70)

# 1. Load Dataset 1 (Kaggle Mini Balanced CSV)
csv_path = os.path.join(base_dir, "raw_datasets", "final_dataset_mini_balanced.csv")
df1 = pd.read_csv(csv_path)
df1['source_dataset'] = 'Kaggle_Mini_Balanced'
df1['original_id'] = [f"ds1_{i}" for i in range(len(df1))]
df1['original_label'] = df1['label']

# 2. Load Dataset 2 (Disaster Tweet Corpus 48 NDJSON files)
ndjson_files = glob.glob(os.path.join(base_dir, "raw_datasets", "*.ndjson"))
ndjson_records = []
for filepath in ndjson_files:
    fname = os.path.basename(filepath)
    category = fname.split('-')[0]
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                data = json.loads(line)
                data['source_file'] = fname
                data['category'] = category
                ndjson_records.append(data)
            except Exception:
                pass

df2 = pd.DataFrame(ndjson_records)
df2['source_dataset'] = 'Disaster_Tweet_Corpus'
df2['original_id'] = df2['id'].astype(str)
df2['original_label'] = df2.apply(lambda r: 'non_disaster' if r['relevance'] == 0 else f"disaster_{r['category']}", axis=1)

# 3. Load Dataset 3 (Hugging Face tensorboy/disaster_classification)
from datasets import load_dataset
hf_ds = load_dataset("tensorboy/disaster_classification")
df3 = pd.concat([pd.DataFrame(hf_ds['train']), pd.DataFrame(hf_ds['test'])], ignore_index=True)
df3['source_dataset'] = 'HF_tensorboy'
df3['original_id'] = [f"ds3_{i}" for i in range(len(df3))]
df3['original_label'] = df3['class']

print(f"Loaded Raw Records -> DS1: {len(df1)}, DS2: {len(df2)}, DS3: {len(df3)}")
total_raw = len(df1) + len(df2) + len(df3)
print(f"Total Raw Records Across All 3 Datasets: {total_raw}")

# 4. Refined 12-Class Mapping Function
def map_defensible_12(source_ds, orig_label, category=None):
    if source_ds == 'Kaggle_Mini_Balanced':
        mapping = {
            'Earthquake': 'Earthquake',
            'Flood': 'Flood',
            'Hurricane': 'Severe Weather & Storms',
            'Cyclone': 'Severe Weather & Storms',
            'Typhoon': 'Severe Weather & Storms',
            'Wildfire': 'Wildfire & Fire',
            'Drought': 'Drought & Extreme Heat',
            'Industrial Accident': 'Industrial & Transportation Accident',
            'Volcanic Eruption': 'Volcanic Eruption',
            'Tsunami': 'Tsunami',
            'Non-Disaster': 'Non-Disaster'
        }
        return mapping.get(orig_label, 'General & Other Disaster')
    elif source_ds == 'Disaster_Tweet_Corpus':
        if orig_label == 'non_disaster':
            return 'Non-Disaster'
        cat_mapping = {
            'earthquake': 'Earthquake',
            'flood': 'Flood',
            'hurricane': 'Severe Weather & Storms',
            'tornado': 'Severe Weather & Storms',
            'wildfire': 'Wildfire & Fire',
            'industrial': 'Industrial & Transportation Accident',
            'transportation': 'Industrial & Transportation Accident',
            'biological': 'Epidemic & Biological',
            'societal': 'Societal Event & Terrorism',
            'other': 'General & Other Disaster'
        }
        return cat_mapping.get(category, 'General & Other Disaster')
    elif source_ds == 'HF_tensorboy':
        mapping = {
            'Earthquake': 'Earthquake',
            'Flood': 'Flood',
            'Thunder': 'Severe Weather & Storms',
            'Fire': 'Wildfire & Fire',
            'Extreme Heat': 'Drought & Extreme Heat',
            'Sunstroke': 'Drought & Extreme Heat',
            'Coronavirus': 'Epidemic & Biological',
            'Corona Virus': 'Epidemic & Biological',
            'Terrorist Attack': 'Societal Event & Terrorism',
            'Terrorist attack': 'Societal Event & Terrorism',
            'General Disaster': 'General & Other Disaster',
            'Disaster': 'General & Other Disaster'
        }
        return mapping.get(orig_label, 'General & Other Disaster')
    return 'General & Other Disaster'

df1['label'] = df1.apply(lambda r: map_defensible_12(r['source_dataset'], r['original_label']), axis=1)
df2['label'] = df2.apply(lambda r: map_defensible_12(r['source_dataset'], r['original_label'], r['category']), axis=1)
df3['label'] = df3.apply(lambda r: map_defensible_12(r['source_dataset'], r['original_label']), axis=1)

cols = ['text', 'label', 'source_dataset', 'original_id', 'original_label']
df_combined = pd.concat([df1[cols], df2[cols], df3[cols]], ignore_index=True)

# Clean text: remove HTML noise (<HASHTAG>, <URL>, &amp;), normalize whitespace
def clean_text_fn(t):
    t = str(t)
    t = t.replace('<HASHTAG>', '').replace('<URL>', '').replace('<REPEAT>', '').replace('<USER>', '')
    t = t.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    t = ' '.join(t.split())
    return t

df_combined['clean_text'] = df_combined['text'].apply(clean_text_fn)
df_combined = df_combined[df_combined['clean_text'].str.len() > 0].copy()

# Case-insensitive deduplication + conflict resolution
df_combined['clean_text_lower'] = df_combined['clean_text'].str.lower()
groups = df_combined.groupby('clean_text_lower')

resolved_rows = []
exact_dup_count = 0
conflicting_count = 0

for text_lower, group in groups:
    if len(group) > 1:
        exact_dup_count += (len(group) - 1)
        classes = group['label'].unique()
        if len(classes) > 1:
            conflicting_count += len(group)
            disaster_classes = [c for c in classes if c != 'Non-Disaster']
            if len(disaster_classes) == 1:
                # Prefer specific disaster label over Non-Disaster noise
                chosen = group[group['label'] == disaster_classes[0]].iloc[0]
                resolved_rows.append(chosen)
            else:
                # Strictly conflicting disaster classes -> drop ambiguous text
                pass
        else:
            resolved_rows.append(group.iloc[0])
    else:
        resolved_rows.append(group.iloc[0])

df_final = pd.DataFrame(resolved_rows).reset_index(drop=True)
df_final = df_final[['clean_text', 'label', 'source_dataset', 'original_id', 'original_label']].copy()

print(f"\n--- AUTHORITATIVE CLEANING METRICS ---")
print(f"Total Raw Records: {total_raw}")
print(f"Authoritative Cleaned Dataset Size: {len(df_final)}")
print(f"Total Records Removed: {total_raw - len(df_final)}")
print(f"Exact Duplicate Texts Removed: {exact_dup_count}")
print(f"Conflicting Label Groups Resolved/Dropped: {conflicting_count}")

# 5. Build and Save Label Mapping
unique_classes = sorted(df_final['label'].unique().tolist())
label2id = {c: i for i, c in enumerate(unique_classes)}
id2label = {i: c for i, c in enumerate(unique_classes)}

label_mapping = {"label2id": label2id, "id2label": id2label}
with open(os.path.join(proc_dir, "label_mapping.json"), "w") as f:
    json.dump(label_mapping, f, indent=2)

df_final['target'] = df_final['label'].map(label2id)

print("\n--- FINAL AUTHORITATIVE CLASS DISTRIBUTION ---")
print(df_final['label'].value_counts())

# Save cleaned dataset
df_final.to_csv(os.path.join(proc_dir, "cleaned_disaster_dataset.csv"), index=False)

# 6. Stratified 80 / 10 / 10 Split
train_df, test_df = train_test_split(
    df_final, test_size=0.20, random_state=SEED, stratify=df_final['target']
)
val_df, test_df = train_test_split(
    test_df, test_size=0.50, random_state=SEED, stratify=test_df['target']
)

train_df.to_csv(os.path.join(split_dir, "train.csv"), index=False)
val_df.to_csv(os.path.join(split_dir, "val.csv"), index=False)
test_df.to_csv(os.path.join(split_dir, "test.csv"), index=False)

print("\n--- STRATIFIED DATASET SPLITS ---")
print(f"Train Set: {len(train_df)} ({len(train_df)/len(df_final)*100:.2f}%)")
print(f"Val Set:   {len(val_df)} ({len(val_df)/len(df_final)*100:.2f}%)")
print(f"Test Set:  {len(test_df)} ({len(test_df)/len(df_final)*100:.2f}%)")

# Check leak prevention
train_texts = set(train_df['clean_text'].str.lower())
val_texts = set(val_df['clean_text'].str.lower())
test_texts = set(test_df['clean_text'].str.lower())

print(f"Overlap Train & Val:  {len(train_texts.intersection(val_texts))}")
print(f"Overlap Train & Test: {len(train_texts.intersection(test_texts))}")
print(f"Overlap Val & Test:   {len(val_texts.intersection(test_texts))}")
print("Preprocessing completed successfully.")
