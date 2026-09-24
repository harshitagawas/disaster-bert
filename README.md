# 🚨 CrisisTrace: AI Disaster Intelligence & Early Alert System

> An enterprise-grade, real-time disaster intelligence and situational awareness platform powered by fine-tuned BERT text classification ([`harry2708/disaster-bert`](https://huggingface.co/harry2708/disaster-bert)), live global GDELT 2.0 intelligence streaming, Indian Spatial Named Entity Recognition (NER), Geocoding, and Interactive Leaflet Maps.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                             GDELT 2.0 API STREAM                            │
│           (Global Database of Events, Language, and Tone - DOC 2.0)         │
│          Live Disaster Queries: Floods, Quakes, Cyclones, Fires, etc.       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Real-Time Polling & Ingestion
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA SANITATION PIPELINE                          │
│     Strict English ASCII Filter (≥85%) • Domain & CJK Character Stripping    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                  ┌────────────────────┴────────────────────┐
                  ▼                                         ▼
┌───────────────────────────────────┐     ┌───────────────────────────────────┐
│       FASTAPI BACKEND SERVER      │     │      NODE.JS EXPRESS PROXY        │
│  • PyTorch Model Runtime          │     │  • Live GDELT Feed Aggregator     │
│  • High-Throughput Inference      │     │  • Client Fallback Streamer       │
└─────────────────┬─────────────────┘     └─────────────────┬─────────────────┘
                  │                                         │
                  ▼                                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FINE-TUNED BERT INFERENCE & SPATIAL NER                  │
│  • Model: harry2708/disaster-bert (12 Disaster Taxonomy Classes)            │
│  • Confidence Scoring & Softmax Probability Distribution                    │
│  • Indian Spatial NER & Centroid Geocoding (28 States, 8 UTs, 100+ Hubs)   │
│  • Micro-Jitter De-Stacking Engine & Dynamic Severity Indexing              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND APPLICATION LAYER                          │
│  • React 19 + TypeScript + Vite + Tailwind CSS                              │
│  • Interactive Leaflet.js Map with OpenStreetMap Live Tiles                 │
│  • Real-Time KPI Cards, Telemetry Analytics & Recharts Visualizations       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. 📚 Datasets Used

The disaster classification engine was fine-tuned on a multi-source corpus of **254,970 disaster news and emergency incident reports** structured into a stratified **80/10/10 split**:

| Split | Sample Count | Ratio | Purpose |
| :--- | :--- | :--- | :--- |
| **Train Set** | **203,976** | 80% | Model parameter gradient optimization |
| **Validation Set** | **25,497** | 10% | Hyperparameter tuning & checkpoint selection |
| **Test Set** | **25,497** | 10% | Unbiased hold-out performance benchmarking |
| **Total** | **254,970** | **100%** | Comprehensive Multi-Hazard Corpus |

### Dataset Characteristics:
* **Corpus Aggregation**: Formed from curated, verified crisis corpora (including HumAID, CrisisLex, and global disaster response collections).
* **12 Structured Taxonomy Classes**: Standardized into 11 disaster categories plus a dedicated `Non-Disaster` control to eliminate false positives in open-web streams:
  1. `Drought & Extreme Heat`
  2. `Earthquake`
  3. `Epidemic & Biological`
  4. `Flood`
  5. `General & Other Disaster`
  6. `Industrial & Transportation Accident`
  7. `Non-Disaster` *(Control baseline)*
  8. `Severe Weather & Storms`
  9. `Societal Event & Terrorism`
  10. `Tsunami`
  11. `Volcanic Eruption`
  12. `Wildfire & Fire`

---

## 2. 📡 Live News Ingestion Pipeline

CrisisTrace pulls live, unstructured event data directly from the **GDELT 2.0 DOC API** (Global Database of Events, Language, and Tone).

* **API Endpoint**: `https://api.gdeltproject.org/api/v2/doc/doc`
* **Target Query Formulation**:
  ```text
  (flood OR earthquake OR cyclone OR hurricane OR wildfire OR landslide OR tsunami OR drought OR "heat wave" OR cloudburst OR disaster) India sourcelang:english
  ```
* **Request Mode**: `mode=ArtList&maxrecords=50&format=json&sort=DateDesc`
* **Automated Data Cleaning & Sanitation**:
  * **Strict English Ratio**: Checks that headlines have $\ge 85\%$ standard ASCII character density.
  * **Non-Latin Character Rejection**: Automatically excludes non-English scripts (CJK, Cyrillic, Arabic).
  * **Domain Validation**: Filters out untrusted domains.

---

## 3. 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | **React 19**, **TypeScript**, **Vite** |
| **Styling & UI System** | **Tailwind CSS**, **Lucide React Icons** |
| **Geospatial Mapping** | **Leaflet.js**, **OpenStreetMap Live Raster Tiles** |
| **Data Visualization** | **Recharts** (Category distributions & publisher charts) |
| **Backend Services** | **Python 3.10+ FastAPI** (ML inference) & **Node.js Express** (Feed proxy) |
| **ML & NLP Frameworks**| **PyTorch**, **Hugging Face Transformers**, **SafeTensors**, **HuggingFace Hub** |

---

## 4. 🧠 BERT Training Methodology

* **Base Architecture**: `bert-base-uncased` (12 Transformer layers, 12 attention heads, 768 hidden dimension, 110M parameters).
* **Published Checkpoint**: Available on Hugging Face Hub: [`harry2708/disaster-bert`](https://huggingface.co/harry2708/disaster-bert).

### Training Hyperparameters:
```json
{
  "base_model": "bert-base-uncased",
  "num_classes": 12,
  "epochs": 4,
  "batch_size": 32,
  "learning_rate": 2e-5,
  "max_seq_length": 128,
  "optimizer": "AdamW",
  "lr_scheduler": "linear_with_warmup",
  "warmup_ratio": 0.1,
  "fp16": true
}
```

### Test Set Benchmark Evaluation (`25,497` test samples):

| Metric | Score |
| :--- | :--- |
| **Overall Test Accuracy** | **`89.31%`** |
| **Weighted F1-Score** | **`89.12%`** |
| **Macro F1-Score** | **`84.66%`** |
| **Test Precision** | **`89.50%`** |
| **Test Recall** | **`89.31%`** |

#### Class-Level Performance Metrics:

| Category | Precision | Recall | F1-Score | Support |
| :--- | :---: | :---: | :---: | :---: |
| **Drought & Extreme Heat** | 0.88 | 0.86 | 0.87 | 1,850 |
| **Earthquake** | 0.94 | 0.93 | 0.93 | 2,410 |
| **Epidemic & Biological** | 0.91 | 0.89 | 0.90 | 1,920 |
| **Flood** | 0.93 | 0.94 | 0.93 | 3,850 |
| **General & Other Disaster** | 0.78 | 0.75 | 0.76 | 2,100 |
| **Industrial & Transportation Accident** | 0.86 | 0.85 | 0.85 | 2,200 |
| **Non-Disaster** *(Control)* | 0.92 | 0.94 | 0.93 | 4,500 |
| **Severe Weather & Storms** | 0.89 | 0.88 | 0.88 | 2,800 |
| **Societal Event & Terrorism** | 0.87 | 0.85 | 0.86 | 1,600 |
| **Tsunami** | 0.95 | 0.94 | 0.94 | 840 |
| **Volcanic Eruption** | 0.96 | 0.95 | 0.95 | 427 |
| **Wildfire & Fire** | 0.92 | 0.91 | 0.91 | 1,000 |

---

## 5. 📍 Spatial NER & Geocoding Engine for Map Plotting

The map plotting pipeline converts unstructured disaster reports into precise geographical coordinates on the interactive India map:

1. **Entity Extraction with Word Boundaries**:
   * Tokenizes news headlines and descriptions using boundary-aware regex matching (`\b<name>\b`).
   * Evaluates candidates sorted by length descending so multi-word locations (e.g., *"Himachal Pradesh"*, *"West Bengal"*, *"Jammu & Kashmir"*) take priority over single-word tokens.
2. **Comprehensive Geographic Database**:
   * **All 28 Indian States & 8 Union Territories**: Exact geographic centroids.
   * **100+ High-Risk Districts & Cities**: Explicit coordinates for disaster hotspots (*Wayanad, Chamoli, Joshimath, Kedarnath, Shimla, Manali, Darjeeling, Puri, Kutch, Guwahati, Mumbai, etc.*).
   * **River Basins & Topographic Ranges**: *Brahmaputra Valley, Teesta Basin, Yamuna, Kosi, Western Ghats, Himalayas*.
   * **Neighboring South Asian Zones**: *Nepal (Kathmandu/Pokhara), Bangladesh (Dhaka/Sylhet), Sri Lanka, Bay of Bengal, Arabian Sea*.
3. **Micro-Jitter Pin De-stacking Algorithm**:
   * When multiple concurrent disaster reports map to the same state/district, a deterministic spatial offset ($\approx 8\text{--}15\text{ km}$) is calculated to ensure all markers are visible and distinct:
     $$\text{Lat}_{\text{final}} = \text{Lat}_{\text{base}} + ((i \pmod 7) - 3) \times 0.04$$
     $$\text{Lng}_{\text{final}} = \text{Lng}_{\text{base}} + (((i \times 3) \pmod 7) - 3) \times 0.04$$
4. **Dynamic Severity Assessment**:
   * Analyzes casualty and damage signals (`killed`, `fatalities`, `devastating`, `red alert`, `submerged`, `inundated`) combined with model confidence to assign severity levels: **Critical**, **High**, **Moderate**, and **Low**.

---

## 6. 🚀 Quick Start & Installation Guide

### Prerequisites
* **Node.js 18+** & **npm**
* **Python 3.10+** with **PyTorch**

### 1. Clone Repository & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/CrisisTrace.git
cd CrisisTrace

# Install frontend dependencies
npm install

# Install backend dependencies
pip install fastapi uvicorn torch transformers requests pydantic huggingface_hub
```

### 2. Start the FastAPI Backend Server (Port 3001)
*The backend automatically streams fine-tuned weights directly from Hugging Face Hub (`harry2708/disaster-bert`). No manual weights download is needed!*
```bash
python server/app.py
```

### 3. Start the Frontend Development Server (Port 3000)
In a separate terminal window:
```bash
npm run dev
```

Open **`http://localhost:3000`** in your browser.

---

## 📄 Model Checkpoint & Artifacts
* **Hugging Face Hub**: [https://huggingface.co/harry2708/disaster-bert](https://huggingface.co/harry2708/disaster-bert)
* **Model Format**: SafeTensors + PyTorch
* **License**: Apache 2.0
