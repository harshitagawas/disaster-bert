# 🚨 AI Disaster Intelligence & Early Alert System

> Real-time disaster intelligence platform powered by fine-tuned BERT text classification (`harry2708/disaster-bert`), GDELT 2.0 English news stream, Indian Spatial Named Entity Recognition (NER), Geocoding, and Interactive Leaflet Maps.

---

## 🌟 Key Features

- 🤖 **Fine-Tuned BERT Inference**: Classifies live disaster events across 12 categories (`Flood`, `Earthquake`, `Cyclone`, `Wildfire`, `Drought`, `Severe Weather`, etc.) with precision confidence scores.
- 📡 **GDELT DOC 2.0 Integration**: Ingests real-time English disaster news from major Indian & global news outlets without requiring API keys.
- 📍 **NER Location Extraction & Geocoding**: Detects Indian locations, states, and districts from unstructured news titles and maps exact geographic coordinates.
- 🗺️ **Interactive Leaflet Map**: Dedicated Disaster Map tab featuring OpenStreetMap Voyager light tiles, custom hazard pins, and coordinate de-stacking.
- 📊 **Telemetry Analytics**: Real-time KPI metrics cards, category distribution pie charts, and top publisher volume charts.
- ☀️ **Modern Light Theme**: Clean, responsive UI built with React, Vite, and Tailwind CSS.

---

## 🏗️ System Architecture

```text
GDELT 2.0 API ➔ FastAPI Server ➔ Fine-Tuned BERT (harry2708/disaster-bert) ➔ Indian NER & Geocoding ➔ React Light UI Map
```

---

## 🛠️ Quick Start & Setup Guide

### Prerequisites
- Python 3.10+ & PyTorch
- Node.js 18+ & npm

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/disaster-bert-intelligence.git
cd disaster-bert-intelligence
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
pip install fastapi uvicorn torch transformers requests pydantic
```

### 4. Start FastAPI Backend (Port 3001)
*The backend automatically fetches the fine-tuned model weights directly from Hugging Face Hub (`harry2708/disaster-bert`). No manual model download is required!*

```bash
python server/app.py
```

### 5. Start React Frontend (Port 3000)
In a separate terminal window:

```bash
npm run dev
```

Open **`http://localhost:3000`** in your browser!

---

## 📊 Fine-Tuned Model Performance (`harry2708/disaster-bert`)

- **Hugging Face Model Hub**: [harry2708/disaster-bert](https://huggingface.co/harry2708/disaster-bert)
- **Test Accuracy**: `89.31%`
- **Test Macro F1-Score**: `84.66%`
- **Training Dataset**: 203,976 disaster news articles (4 fine-tuning epochs)

---

## 📜 License
Apache License 2.0
