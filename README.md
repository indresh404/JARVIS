<div align="center">

# 🏥 Swasthya AI

### Continuous Clinical Decision Support & Patient Engagement — Built for India

**A two-sided clinical intelligence system that ensures doctors always have complete patient context, flags health patterns early, prevents drug conflicts, reduces treatment costs, and celebrates patient recovery — all before the patient walks into the clinic.**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React Native](https://img.shields.io/badge/Mobile-React%20Native%20(Expo)-61DAFB?style=flat-square&logo=react)](https://expo.dev)
[![React](https://img.shields.io/badge/Dashboard-React%20%2B%20Vite-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Groq](https://img.shields.io/badge/AI-Groq%20LLaMA%203.3%2070B-F55036?style=flat-square)](https://groq.com)
[![Docker](https://img.shields.io/badge/DevOps-Docker-2496ED?style=flat-square&logo=docker)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

> **Important:** Every risk output carries the disclaimer: *"Risk indicator only — all clinical decisions rest with your doctor."* Swasthya AI is a **Clinical Decision Support + Continuous Monitoring + Patient Engagement Platform** — not a doctor replacement.

</div>

---

## Table of Contents

1. [What is Swasthya AI?](#1-what-is-swasthya-ai)
2. [The Problem We Solve](#2-the-problem-we-solve)
3. [The Five Pillars](#3-the-five-pillars)
4. [System Overview](#4-system-overview)
5. [Feature Breakdown](#5-feature-breakdown)
6. [How the AI Works](#6-how-the-ai-works)
7. [Architecture](#7-architecture)
8. [Tech Stack](#8-tech-stack)
9. [Project Structure](#9-project-structure)
10. [Getting Started](#10-getting-started)
11. [Environment Variables](#11-environment-variables)
12. [API Reference](#12-api-reference)
13. [Database Schema](#13-database-schema)
14. [AI Safety Rules](#14-ai-safety-rules)
15. [Deployment](#15-deployment)
16. [N8N Automation Workflows](#16-n8n-automation-workflows)
17. [Contributing](#17-contributing)
18. [Team](#18-team)
19. [License](#19-license)

---

## 1. What is Swasthya AI?

Swasthya AI (स्वास्थ्य = "health") is a full-stack clinical intelligence platform bridging the gap between patients managing chronic conditions and the care they need.

| Part | Who Uses It | What It Does |
|---|---|---|
| **Mobile App** | Patients | AI check-ins, symptom tracking, body heatmap, medicines, family health |
| **Doctor Dashboard** | Doctors | Morning briefing, patient analytics, async Q&A, recovery tracking |
| **AI Backend** | Both | Risk scoring, anomaly detection, drug safety, RAG-grounded clinical Q&A |

---

## 2. The Problem We Solve

Healthcare in India is not broken — it is fragmented, reactive, and disconnected between visits. Meaningful clinical signals build silently in the invisible space between appointments.

| Gap | What's Broken |
|---|---|
| Scattered health data | A father's hypertension, a mother's pre-diabetes, and a sibling's kidney history live in three separate paper files. No system connects them. |
| 10-minute consults | The first five minutes go toward gathering context that already exists somewhere but is never accessible. |
| Unsafe OTC medication | Patients buy medicines without knowing what they already take. Nobody warns them. |
| Zero between-visit monitoring | No system watches all signals together and acts autonomously. |
| Financial aid disconnect | Patients with high-risk conditions have no idea a government scheme covers their treatment. |

---

## 3. The Five Pillars

**Pillar 1 — Continuous Patient Intelligence**
Daily adaptive AI check-ins, structured symptom extraction, body heatmap with recency decay, smartwatch anomaly detection with Signal Quality Index (SQI) and Personal Baseline calibration.

**Pillar 2 — Clinical Decision Support for Doctors**
Morning briefing card (One-Look Rule: full patient status in 5 seconds), AI 7-day summary, natural language Q&A, async bidirectional doctor–patient Q&A loop, low engagement flags.

**Pillar 3 — Safety Layer**
Drug conflict detection (blocking, not advisory), adherence tracking, deterministic escalation matrix with Critical Single-Symptom Override List, human-in-the-loop framing on every escalation.

**Pillar 4 — Financial Access Layer**
Medicine affordability engine, Jan Aushadhi PDF export (branded → generic prescription ready for pharmacist), government scheme eligibility with nearest empanelled hospital.

**Pillar 5 — Recovery & Trust System**
Recovery Confirmation milestone, doctor Recovery Counter as a measurable professional impact metric, family health overview with sensitive condition filtering.

---

## 4. System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SWASTHYA AI PLATFORM                         │
│                                                                     │
│  ┌──────────────────┐   ┌──────────────────┐   ┌─────────────────┐ │
│  │   Patient App    │   │ Doctor Dashboard │   │   AI Backend    │ │
│  │ (React Native /  │◄──►  (React + Vite)  │◄──►  (FastAPI +    │ │
│  │  Expo)           │   │                  │   │  Groq LLaMA)    │ │
│  └────────┬─────────┘   └────────┬─────────┘   └───────┬─────────┘ │
│           └──────────────────────┴──────────────────────┘           │
│                                  │                                  │
│                    ┌─────────────▼──────────────┐                   │
│                    │         SUPABASE            │                   │
│                    │  PostgreSQL + Auth +         │                   │
│                    │  Realtime + Row Security     │                   │
│                    └────────────────────────────┘                   │
│                                                                     │
│  Wearable ──► HealthKit / Health Connect ──► SQI ──► Risk Engine   │
│  N8N ──► Morning Briefing ──► Escalation Alerts ──► Async Q&A Loop │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Feature Breakdown

### Patient Mobile App

#### AI Conversational Onboarding
No forms. No dropdowns. A multi-turn AI conversation collects chronic conditions with follow-up (diabetes → insulin or oral? dosage?), medications, allergies, past surgeries, family history, and income category for scheme matching. Ends with a structured Profile Confirmation Card for review before saving.

#### Adaptive Daily Check-In
2–3 personalised questions generated daily from the patient's conditions, recent symptoms, active medications, and last 24 hours of wearable data. If the smartwatch showed elevated resting heart rate overnight, one question asks about chest comfort — without the patient mentioning it. Event-triggered check-ins also fire after wearable anomalies, missed medicine streaks, or risk indicator changes.

#### Symptom Extraction & Structured Memory
Every natural language input passes through an NLP extraction pipeline that outputs: symptom type (clinical term), body zone, severity (1–10), duration, onset, resolution status. Confidence < 70% → clarifying question asked. Severity ≥ 7 → confirmation required before saving.

#### Body Heatmap
SVG human body (front + back) divided into anatomical zones. Zone colour computed from symptom frequency, severity, and a recency decay function — zones fade back to green as symptoms resolve. Smartwatch anomalies contribute to zone scores even without patient-reported symptoms. Tap any zone for: contributing symptoms, timeline, severity trend, and zone Health Index.

#### Symptom Escalation (Deterministic Matrix)

**Tier 1 — Critical Single-Symptom Override (bypasses all two-signal logic):**
Sudden severe headache, chest pain at rest, unilateral weakness/numbness, slurred speech, sudden vision loss, unconsciousness, severe breathing difficulty, severe allergic reaction → *"Consult a doctor immediately"* + Call Doctor button.

**Tier 2 — Two-Signal Combinations:**
Chest pain + breathlessness, fever 3+ days + joint pain, severe abdominal pain + vomiting → graded escalation with 24–48 hour or immediate recommendation.

All escalation outputs show: *"This is an AI-generated pattern suggestion. Final clinical decisions rest with your licensed physician."*

#### RAG-Augmented Risk Indicator
Hybrid of a deterministic base score (Python rules: conditions, severity, adherence, wearable anomalies, family history, age) and a bounded RAG adjustment (–15 to +15, must cite named WHO/ICMR guideline). Output is always a **range with a confidence band** — never a single precise number. Wider band = less data = honest uncertainty.

#### Signal Quality Index (SQI)
Before any wearable reading enters any calculation, SQI filters: HR 0 or >200 with no accelerometer movement, SpO2 < 70, impossible step counts, sleep > 18 hours. Poor-quality readings excluded and flagged: *"Reading excluded — sensor data quality insufficient."* First 7 days establish a Personal Baseline; anomaly detection uses personal mean + 1.5 standard deviations, not population averages.

#### Medicine Tracker & Drug Conflict Detection
Every new medicine triggers a synchronous OpenFDA API check against all active medications before saving. If a conflict is found: which medicines interact, nature and severity (Informational / Caution / Do not take without doctor guidance), plain-language warning in both app and dashboard. Doctor can override with a clinical note. Flag permanently recorded.

#### Medicine Affordability Engine + Jan Aushadhi PDF
Triggered automatically when risk indicator crosses elevated threshold. Reads active medicines, fetches Jan Aushadhi generic prices, calculates monthly and annual savings, matches government scheme eligibility, shows nearest Jan Aushadhi Kendra.

Patient downloads a **Jan Aushadhi Ready Prescription PDF** — branded prescription mapped to generic equivalents, ready to show a pharmacist directly. Not a medical prescription; clearly labelled.

#### Government Scheme Eligibility
Condition-specific eligibility panel showing PM-JAY, Rashtriya Arogya Nidhi, PMJAP, and applicable state schemes with: conditions covered, age/income requirements, coverage amount, documents required, nearby empanelled hospitals.

#### Family Health System
One QR code per family. Individual records fully private. **Sensitive condition filter:** HIV, mental health diagnoses, STDs, and cancer are filtered at the data layer before any family summary — never appear in the family view. Each patient has a per-category sharing toggle, defaulting to OFF for all sensitive categories. Family view shows only: non-sensitive risk levels, condition tags, shared symptom patterns.

#### Recovery Confirmation
When risk indicator drops significantly and stays low for 3 consecutive days, the system triggers a Recovery Confirmation: personalised positive message to the patient, episode logged as "Recovered" in medical timeline, and the linked doctor's Recovery Counter increments automatically.

---

### Doctor Dashboard

#### Morning Briefing Card (One-Look Rule)
AI-generated every night at 11 PM. Lists every patient needing attention, why, and what was flagged overnight — sorted by urgency. Low-risk patients with no alerts not shown. A doctor understands who needs attention **within 5 seconds** of opening the dashboard.

#### AI 7-Day Patient Summary
One click generates: symptoms reported and how they evolved, medicine adherence, wearable anomalies, concerning patterns, AI guidance given to patient, and body zones with new or worsening flags — grounded in retrieved clinical guidelines. Shown **front and centre** on the patient profile.

#### Async Bidirectional Doctor–Patient Q&A Loop
Doctor types a question. System searches all patient data. If found → answered with source date and data type cited. If not found → system automatically rewrites the question in conversational language and queues it for the patient's next check-in. When the patient answers, the doctor is notified: *"Your query has been answered."* Questions expire after 7 days, are prioritised by patient risk level, and can be cancelled at any time.

#### Doctor Recovery Counter
A live count of patients who reached a Recovery Confirmation milestone under that doctor's care. Visible to patients when choosing a doctor. A measurable professional impact metric based on objective health trajectory data.

#### Low Engagement Flag
If a patient misses 2+ consecutive check-ins, the Safety layer flags them in the morning briefing. A missed check-in cannot silently pretend the patient is fine.

#### QR Scan Entry
Doctor scans family QR → family overview loads. Individual QR → full patient profile. Complete clinical context in under 3 seconds.

---

## 6. How the AI Works

| Rule | Description |
|---|---|
| **Confidence before saving** | Symptom extracted at < 70% confidence → clarifying question asked, not saved |
| **Severity confirmation** | Severity ≥ 7 requires explicit patient confirmation before recording |
| **Two-signal escalation** | Escalation only fires when two independent danger signals appear simultaneously |
| **Single-symptom override** | 8 critical symptoms bypass all two-signal logic — hardcoded deterministic matrix |
| **Grounded doctor answers** | AI only answers from data in that patient's actual records; cites source and date |
| **Score protection** | AI adjusts risk score ±15 max; must cite specific guideline. Base score is protected |
| **Medicine safety gate** | New medicine cannot be saved until drug interaction check completes |
| **No PII in family summaries** | Family summaries use "adult member" / "child member" only — no names or diagnoses |

---

## 7. Architecture

### Patient Sends a Symptom

```
Patient types in chat
        │
        ▼
FastAPI /chat/message
        │
   ┌────┴────┐  (parallel)
   ▼         ▼
Groq LLM   Groq LLM
(reply)    (symptom extraction)
   │         │
   └────┬────┘
        │
   Confidence < 70%? ──► Ask clarification
        │ (≥70%)
   Severity ≥ 7? ──► Ask confirmation
        │ (confirmed or < 7)
   Save symptom → Supabase
        │
   Update risk score
        │
   Check escalation matrix
        │ (if triggered)
   N8N webhook ──► Doctor notification
```

### Risk Score Calculation

```
Patient data (conditions, symptoms, meds, wearable flags, age, family history)
      │
      ▼
Step 1: Deterministic base score (pure Python rules)
      │
      ▼
Step 2: FAISS search on medical guidelines (RAG retrieval)
      │
      ▼
Step 3: Groq LLM adjusts ±15 max (must cite guideline)
      │
      ▼
Step 4: Confidence band calculated (based on data quantity)
      │
      ▼
Final RiskScore saved to Supabase (shown as range, not single number)
```

### Wearable Anomaly Detection

```
Wearable reading arrives
      │
      ▼
SQI check (filter noise/bad sensors)
      │
  ┌───┴────────────────────────────┐
  ▼                                ▼
Isolation Forest              Statistical check
(ML model per patient)       (mean ± 1.5× std dev)
  │                                │
  └──────────────┬─────────────────┘
                 │
          Either fires? ──► anomaly_detected = true → risk score updated
```

---

## 8. Tech Stack

### Patient Mobile App (`/app`)

| Category | Technology |
|---|---|
| Framework | React Native 0.81 + Expo 54 |
| Language | TypeScript |
| Navigation | Expo Router v6 |
| State | Zustand |
| Graphics | Expo GL + React Native Skia (body heatmap) |
| Auth & DB | Supabase JS |
| Wearables | Apple HealthKit + Google Health Connect |
| Notifications | Expo Notifications |

### Doctor Dashboard (`/web`)

| Category | Technology |
|---|---|
| Framework | React 19 + Vite 6 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| QR Scanner | html5-qrcode |
| Animations | Motion (Framer Motion) |

### AI Backend (`/backend`)

| Category | Technology |
|---|---|
| API Framework | FastAPI (Python 3.11) |
| LLM | Groq API — LLaMA 3.3 70B |
| Drug Safety | OpenFDA API |
| RAG | LangChain + FAISS + sentence-transformers (MiniLM-L6-v2) |
| Anomaly Detection | Isolation Forest (scikit-learn) |
| Trend Indicator | Linear Regression (scikit-learn) |
| Validation | Pydantic v2 |
| Containerization | Docker |

### Infrastructure

| Category | Technology |
|---|---|
| Database | Supabase (PostgreSQL + RLS + Realtime) |
| Auth | Supabase Auth (OTP + Email) |
| Automation | N8N (notifications, async Q&A loop) |
| Backend Hosting | Render (Docker) |
| Dashboard Hosting | Vercel |
| Mobile Builds | Expo EAS Build |

---

## 9. Project Structure

```
Jugaad-Coders-Swasthya-AI/
│
├── app/                          # Patient Mobile App (React Native + Expo)
│   ├── app/
│   │   ├── (auth)/               # Login, OTP, Welcome
│   │   ├── (onboarding)/         # AI conversational onboarding
│   │   └── (tabs)/
│   │       ├── home/             # Dashboard, risk score, heatmap
│   │       ├── checkin/          # Daily check-in flow
│   │       ├── aibot/            # AI health chat + symptom entry
│   │       ├── meds/             # Medicine tracker + conflict detection
│   │       └── profile/          # Profile, family group, scheme eligibility
│   ├── components/
│   │   ├── bodymap/              # Interactive body zone selector
│   │   ├── heatmap/              # Symptom heatmap visualization
│   │   └── watch_simulator/      # Wearable data display
│   ├── store/                    # Zustand stores (auth, chat, patient)
│   └── services/                 # Supabase + API service layer
│
├── web/                          # Doctor Dashboard (React + Vite)
│   └── src/
│       ├── pages/
│       │   ├── DashboardPage.tsx       # Patient list + morning briefing
│       │   ├── PatientDetailPage.tsx   # Full patient profile, Q&A, recovery
│       │   └── ScannerPage.tsx         # QR code scanner
│       └── components/                 # Charts, layout, cards
│
├── backend/                      # AI Backend (FastAPI)
│   ├── routes/
│   │   ├── chat.py               # AI chat, symptom extraction
│   │   ├── risk.py               # Risk scoring, trajectory indicator
│   │   ├── agents.py             # Onboarding, doctor Q&A, escalation, family
│   │   ├── safety.py             # Drug interactions, wearable anomalies
│   │   ├── meds.py               # Medication management
│   │   ├── checkins.py           # Daily check-in questions
│   │   ├── family.py             # Family group, QR
│   │   └── schemes.py            # Government scheme matching
│   ├── ml/
│   │   ├── anomaly_detector.py   # Isolation Forest per patient
│   │   ├── predict.py            # Linear Regression trend indicator
│   │   └── saved_models/         # Persisted .joblib files per patient
│   ├── rag/
│   │   ├── embedder.py           # PDF → chunks → FAISS index
│   │   ├── retriever.py          # Semantic search
│   │   └── guidelines/           # Place medical guideline PDFs here
│   ├── prompts/                  # All Groq LLM prompts (agents, chat, risk, safety)
│   ├── schemas/models.py         # Pydantic request/response models
│   ├── services/                 # Groq client, Supabase, OpenFDA, QR
│   ├── n8n/                      # N8N workflow JSON exports
│   ├── Dockerfile
│   └── requirements.txt
│
└── README.md
```

---

## 10. Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Python | 3.11+ |
| Node.js | 18+ |
| Docker | Latest |
| Expo CLI | Latest (`npm install -g expo-cli`) |

You also need free accounts on [Supabase](https://supabase.com), [Groq](https://console.groq.com), and [Render](https://render.com).

---

### Backend Setup

```bash
git clone https://github.com/your-org/Jugaad-Coders-Swasthya-AI.git
cd Jugaad-Coders-Swasthya-AI/backend

python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

pip install -r requirements.txt   # Downloads torch + sentence-transformers (~2 GB, 5–10 min)
```

Create `backend/.env`:
```env
GROQ_API_KEY=your_groq_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Place medical guideline PDFs in `backend/rag/guidelines/` (e.g. `cardio_guidelines.pdf`, `diabetes_management.pdf`). The FAISS index builds automatically on first startup.

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
# API at http://localhost:8000 | Docs at http://localhost:8000/docs
```

Or with Docker:
```bash
docker build -t swasthya-backend .
docker run -p 8000:8000 --env-file .env swasthya-backend
```

---

### Mobile App Setup

```bash
cd ../app
npm install
```

Create `app/.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
EXPO_PUBLIC_N8N_WEBHOOK_URL=your_n8n_webhook_url
```

```bash
npx expo start
# Press 'a' for Android emulator, 'i' for iOS simulator, or scan QR with Expo Go
```

---

### Doctor Dashboard Setup

```bash
cd ../web
npm install
```

Create `web/.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8000
```

```bash
npm run dev    # http://localhost:3000
```

---

## 11. Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Groq API key for LLaMA 3.3 70B |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Admin key — **never expose client-side** |

### Mobile App (`app/.env`)

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | Supabase URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `EXPO_PUBLIC_API_BASE_URL` | Yes | Backend URL |
| `EXPO_PUBLIC_N8N_WEBHOOK_URL` | No | N8N webhook for notifications |

### Doctor Dashboard (`web/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `VITE_API_BASE_URL` | Yes | Backend URL |

> **Security:** Never commit `.env` files. `SUPABASE_SERVICE_ROLE_KEY` bypasses row-level security — backend only, never in client code.

---

## 12. API Reference

Full interactive docs at `/docs` when the backend is running.

### Chat
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/chat/message` | Send patient message → AI reply + symptom extraction |
| `POST` | `/chat/checkin-questions` | Generate personalised daily check-in questions |

### Risk
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/risk/generate` | Calculate risk score (deterministic + RAG-adjusted) |
| `POST` | `/risk/predict` | Generate 7-day health trend indicator |

### Agent
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/agent/onboard` | Multi-turn AI onboarding conversation |
| `POST` | `/agent/doctor-answer` | Grounded answer for doctor Q&A (data-cited) |
| `POST` | `/agent/escalate` | Check two-signal escalation conditions |
| `POST` | `/agent/family-summary` | Shared family health pattern summary |

### Safety
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/safety/drug-interaction` | Check new medicine against active medications |
| `POST` | `/safety/smartwatch` | Run SQI + anomaly detection on wearable data |

### Other
| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/meds/{patient_id}` | Get medications; log adherence |
| `GET/POST` | `/checkins/...` | Pending check-ins; submit answers |
| `POST` | `/family/create` | Create family group + QR code |
| `POST` | `/family/join` | Join via QR code |
| `POST` | `/schemes/match` | Match patient to eligible government schemes |
| `GET/POST` | `/profiles/{id}` | Get/save patient profile |

---

## 13. Database Schema

Row-Level Security (RLS) is enabled on all sensitive tables. Patients read/write only their own data. Doctors read only records of assigned patients.

| Table | Purpose |
|---|---|
| `patients` | Core patient record linked to Supabase Auth |
| `patient_profiles` | Conditions, medications, allergies, family history |
| `chat_sessions` | Chat sessions with rolling AI summary |
| `messages` | Individual chat messages |
| `symptoms` | Extracted structured symptoms (zone, severity, duration) |
| `risk_scores` | Daily risk scores with confidence bands |
| `health_predictions` | 7-day trend indicator outputs |
| `medications` | Active medications per patient |
| `adherence_logs` | Daily taken/missed log |
| `wearable_readings` | Raw HR, SpO2, steps, sleep data |
| `anomaly_flags` | SQI-validated anomaly detections |
| `family_groups` | Family units with join codes |
| `family_memberships` | Patients ↔ family groups |
| `pending_checkin_questions` | AI-generated questions awaiting patient answers |
| `doctor_questions` | Async doctor→patient question queue |

---

## 14. AI Safety Rules

These rules are hardcoded and cannot be overridden by any prompt or user instruction.

| Rule | Description |
|---|---|
| Confidence threshold | Symptom not saved if extraction confidence < 70%; clarifying question asked instead |
| High-severity confirmation | Severity ≥ 7 requires explicit patient confirmation before saving |
| Two-signal escalation | Escalation requires ≥ 2 independent danger signals simultaneously |
| Critical single-symptom override | 8 critical symptoms (stroke, cardiac, etc.) bypass two-signal rule entirely |
| Grounded doctor answers | Must cite exact data source and date; never infer from general knowledge |
| Score protection | AI adjusts base score ±15 max; must cite specific RAG guideline |
| Medicine safety gate | New medicine cannot be saved until drug interaction check completes |
| No PII in family summaries | Only "adult member" / "child member" — no names, IDs, or sensitive diagnoses |

### Regulatory Awareness

- All outputs labelled as risk indicators, not diagnoses; the word "diagnosis" never appears in the system
- Every risk output and escalation carries explicit physician-decision disclaimer
- Escalation logic is a deterministic Python matrix — LLM writes the language, never makes the trigger decision
- Designed with awareness of CDSCO Medical Devices Rules 2017 (Class A/B voluntary registration path)
- DPDPA 2023 compliant: consent logged at onboarding, sensitive conditions filtered, data deletable on request

---

## 15. Deployment

### Backend on Render

1. Push to GitHub → create new **Web Service** on Render
2. Connect repository; set Build: `pip install -r requirements.txt`, Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Add all backend environment variables
4. RAG index builds on first startup (~2–3 min). For Docker: select **Docker** environment — Render auto-uses the `Dockerfile`.

### Dashboard on Vercel

```bash
cd web && npm run build
npx vercel --prod
```
Add environment variables in Vercel dashboard under **Settings → Environment Variables**.

### Mobile App via Expo EAS

```bash
cd app
eas build:configure
eas build --platform all --profile production
eas submit --platform android
eas submit --platform ios
```

---

## 16. N8N Automation Workflows

Import these from `backend/n8n/` into your N8N instance.

| Workflow | File | Description |
|---|---|---|
| All Workflows | `All_Workflow.json` | Master bundle |
| Doctor Agent Loop | `doctor_agent.json` | Routes answered check-ins to doctor notifications |
| Async Q&A Loop | `async_qna_loop.json` | Manages doctor question-and-answer flow with expiry |
| Medicine Safety | `medicine_safety.json` | Drug safety alert dispatch |
| Patient Agent | `patient_agent.json` | Patient-side notification triggers |
| Safety Agent | `safety_agent.json` | Escalation and emergency alert pipeline |

Import: N8N → **Workflows → Import from File** → select JSON → update Supabase credentials → activate.

---

## 17. Contributing

### Branch Naming
```
feature/your-feature-name
fix/bug-description
docs/update-section
```

### Pull Request Checklist
- TypeScript: no `any` types
- Backend: all routes have Pydantic models for inputs/outputs
- AI prompts: do not bypass safety rules in Section 14
- No sensitive patient data in logs or error responses
- App builds without errors (`expo start`, `uvicorn main:app`)

### Coding Standards
- **Python:** PEP 8, `async/await` for all I/O
- **TypeScript:** strict mode, interfaces over type aliases
- **Commits:** conventional format (`feat:`, `fix:`, `docs:`, `refactor:`)

---

## 18. Team

**Jugaad Coders** — built this during a hackathon to solve real problems in Indian healthcare.

> *"Jugaad" (जुगाड़) — a clever, frugal fix. We built a world-class AI health system, the Jugaad way.*

---

## 19. License

This project is licensed under the **MIT License** — free to use, modify, and distribute for any purpose with the original copyright notice included. See [LICENSE](LICENSE) for the full text.

---

<div align="center">

**Built with care for patients who deserve better healthcare access.**

*Swasthya AI — System flags patterns for doctor review. Doctors make decisions. Patients get better.*

</div>