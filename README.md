# MisconceptAI

> Sistem diagnostik berbasis AI untuk mengidentifikasi kesalahan konsepsi mahasiswa dalam jawaban essay pemrograman.

Dosen input soal + jawaban ideal + jawaban mahasiswa → AI analisis pemahaman per konsep → dashboard heatmap hasil diagnostik.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Python + FastAPI |
| Database | SQLite |
| AI | Groq API — Llama 3.1 8B Instant |

---

## Fitur

- Buat sesi analisis dengan soal, konsep yang diuji, dan jawaban ideal
- Input jawaban essay per mahasiswa
- Analisis miskonsepsi otomatis via LLM dengan structured JSON output
- Klasifikasi status per konsep: **Benar / Parsial / Keliru / Kosong**
- Deteksi tipe miskonsepsi: factual error, partial understanding, overgeneralization, conceptual confusion, missing concept
- Heatmap interaktif konsep × mahasiswa dengan tooltip evidence & saran remedial
- Detail diagnostik per mahasiswa

---

## Struktur Project

misconceptai/

├── backend/

│   ├── main.py

│   ├── database.py

│   ├── models.py

│   ├── schemas.py

│   ├── routers/

│   │   ├── sessions.py

│   │   ├── answers.py

│   │   └── analysis.py

│   └── services/

│       └── groq_service.py

└── frontend/

└── src/

├── pages/

│   ├── SessionNew.jsx

│   ├── SessionAnswers.jsx

│   └── SessionResults.jsx

└── App.jsx

---

## Cara Menjalankan

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API key (gratis di [console.groq.com](https://console.groq.com))

### Backend
```bash
cd backend
pip install -r requirements.txt
```

Buat file `.env` di folder `backend/`:
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx

### Frontend + Backend (satu command)
```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:5173`

---

## Status

`v0.1` — Thesis project, in active development.
