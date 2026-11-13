# TalentSphere – AI-Powered ATS & Job Board

TalentSphere is an enterprise-grade Applicant Tracking System (ATS) and Job Board platform engineered with **React 18**, **TypeScript**, **FastAPI**, **PostgreSQL**, **SQLAlchemy 2.0**, and **Google Gemini AI**.

---

## 🌟 Key Features

### 1. Deterministic ATS Matching Engine
- **Formula:** `Final Score = (Skill Score × 0.60) + (Experience Score × 0.20) + (Relevance Score × 0.20)`
- Normalized scale between **0% and 100%**.
- Mathematical Python calculation (prevents arbitrary or halluncinated LLM scoring).
- Automated skill synonym normalization (e.g., `ReactJS` → `React`, `NodeJS` → `Node.js`).

### 2. Google Gemini AI Integration
- **Resume Parser:** Extracts contact details, technical skills, education, and career experience from PDF, DOCX, and TXT files.
- **Career Roadmap Generator:** Generates 8–12 phase learning curriculums with practical portfolio project briefs and skill gap analyses.
- **Job Description Analyzer:** Automatically extracts required skills, preferred qualifications, and core responsibilities from unstructured recruiter drafts.

### 3. Recruiter Management Console
- Interactive analytics dashboard powered by **Recharts**:
  - Live Hiring Funnel visualization.
  - Top in-demand tech skills distribution.
  - Total postings, active jobs, screening yield, and upcoming interviews.
- Job postings management with full CRUD capabilities.
- ATS-ranked applicant screening with matched/missing skill badges.
- Interview scheduler with automated candidate in-app notifications.

### 4. Candidate Experience Portal
- Multi-faceted job discovery with live filtering (Remote/Hybrid/On-site, Job Type, Salary, Experience).
- Real-time ATS match preview before applying.
- Interactive AI Career Roadmap generator with visual milestone timeline.
- Complete application tracking and notification inbox.

---

## 🏗️ System Architecture

```
React 18 + Vite (TypeScript + Tailwind CSS)
      │
      │ Axios + JWT Bearer Tokens
      ▼
FastAPI Backend (Python 3.11+)
      │
      ├── PostgreSQL Database (Port 5433 / 5432)
      ├── SQLAlchemy 2.0 ORM + Alembic Migrations
      ├── Google Gemini AI (Official GenAI SDK)
      ├── Deterministic ATS Matching Algorithm (matcher.py)
      └── Local File Storage (uploads/)
```

---

## 🚀 Quick Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- PostgreSQL running locally

### 1. Database Setup
Ensure PostgreSQL is active. Create the database:
```sql
CREATE DATABASE talentsphere;
```

### 2. Backend Setup
```bash
cd TalentSphere/backend

# Install dependencies
pip install -r requirements.txt

# Run Alembic migrations
python -m alembic upgrade head

# Seed initial demo data (Recruiter, Candidate, 4 Jobs, Applications)
python seed.py

# Start the FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: **http://127.0.0.1:8000/docs**

### 3. Frontend Setup
```bash
cd TalentSphere/frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend will be live at: **http://127.0.0.1:5173**

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Recruiter** | `recruiter@talentsphere.io` | `Password123!` |
| **Candidate** | `candidate@talentsphere.io` | `Password123!` |

*Instant 1-Click login buttons are also available on the Login page.*

---

## 📁 Repository Structure

```
TalentSphere/
│
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Modular API endpoints
│   │   ├── core/            # Config, Database, Security, Dependencies
│   │   ├── models/          # SQLAlchemy 2.0 Relational Models
│   │   ├── schemas/         # Pydantic v2 validation schemas
│   │   ├── services/        # Gemini AI, ATS Matcher, Resume Parser
│   │   └── utils/           # File validator, Skill normalizer
│   ├── alembic/             # Database migration versions
│   ├── uploads/             # Local resume file repository
│   ├── seed.py              # Initial dataset seeder
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client with JWT interceptors
│   │   ├── components/      # Common badges, modals, skeletons
│   │   ├── context/         # AuthContext
│   │   ├── layouts/         # CandidateLayout & RecruiterLayout
│   │   ├── pages/           # Candidate, Recruiter & Common pages
│   │   └── services/        # API service methods
│   └── package.json
└── README.md
```

