# Jobs Portal – ATS & Recruitment Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8.3+-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)

Jobs Portal is a production-ready Applicant Tracking System (ATS) and intelligent job platform that bridges the gap between ambitious engineering talent and modern hiring teams. Featuring mathematical, deterministic ATS candidate scoring, automated resume extraction, multi-stage applicant screening pipelines, and personalized career roadmaps.

---

## 📑 Table of Contents

- [Key Capabilities](#-key-capabilities)
- [Deterministic ATS Matching Formula](#-deterministic-ats-matching-formula)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Local Installation & Setup](#-local-installation--setup)

---

## 🌟 Key Capabilities

### 1. Dual-Role Experience Portals
- **Candidate Portal**:
  - **Comprehensive Profile Builder**: Structured personal details, contact preferences, LinkedIn/GitHub links, and education.
  - **Resume Analyzer**: Instant extraction of technical skills taxonomy, summary, and bulleted work history from PDF and DOCX files.
  - **In-App Document Viewer**: Clean, modal-based PDF previewer with direct download and replace actions.
  - **Job Discovery & Matching**: Real-time 60/20/20 ATS match score preview across active job listings before applying.
  - **Milestone Upskilling Roadmap**: Interactive 8–12 phase technical growth roadmap tailored to bridge candidate skill gaps.
  - **Application Tracker**: Live application status lifecycle (`pending`, `reviewed`, `shortlisted`, `interview`, `accepted`, `rejected`).

- **Recruiter Portal**:
  - **Executive Analytics Dashboard**: Real-time hiring funnel, in-demand technical skill distribution charts (powered by Recharts), and interview pipelines.
  - **Company Profile Management**: Company branding, logo uploader with live preview, website, industry, description, designation, and department details.
  - **Job Management**: Multi-parameter job posting with custom skill criteria, experience thresholds, salary ranges, and remote/hybrid modes.
  - **Applicant Screening Leaderboard**: Automatically ranked candidate lists based on mathematical ATS compatibility with individual resume inspection drawers and status updates.
  - **Interview Workflow**: Direct technical interview scheduling with meeting links and candidate notifications.

---

## 📐 Deterministic ATS Matching Formula

To ensure fair, explainable, and hallucination-free candidate evaluations, Jobs Portal computes applicant match scores mathematically in Python:

$$\text{Final ATS Score} = (0.60 \times \text{Skill Alignment}) + (0.20 \times \text{Experience Fit}) + (0.20 \times \text{Keyword Relevance})$$

| Component | Weight | Implementation Details |
|---|:---:|---|
| **Skill Alignment** | **60%** | Normalized taxonomy mapping (e.g., `ReactJS` → `React`, `NodeJS` → `Node.js`) evaluated against required and preferred job competencies. |
| **Experience Fit** | **20%** | Proportional score comparing verified candidate industry years against minimum required job thresholds. |
| **Keyword Relevance** | **20%** | Semantic domain vocabulary overlap across technical descriptions, responsibilities, and previous project contributions. |

---

## 🏗️ System Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │  React 18 + Vite Frontend Client             │
                    │  (TypeScript, Tailwind CSS, Lucide, Sonner)  │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           │ HTTPS / Axios + JWT Bearer
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │  FastAPI Backend Microservices (Port 8000)   │
                    │  ├── Auth & Role-Based Access Control (RBAC) │
                    │  ├── Deterministic ATS Matcher Engine        │
                    │  ├── Resume Parsing Pipeline                 │
                    │  └── Interview & Notification Services       │
                    └──────────────────────┬───────────────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
     ┌───────────────────────────────────┐ ┌───────────────────────────────────┐
     │ MySQL 8.0 Relational Database     │ │ Local Document Repository         │
     │ (Port 3306 - jobs_portal)         │ │ (backend/uploads/)                │
     │ - users, jobs, applications       │ │ - Resumes (PDF, DOCX, TXT)        │
     │ - career_roadmaps, interviews     │ │ - Recruiter Company Logos         │
     └───────────────────────────────────┘ └───────────────────────────────────┘
```

---

## 💻 Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 8.3
- **Styling**: Tailwind CSS, Google Sans Flex typography
- **Routing**: React Router DOM v6
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **HTTP Client**: Axios with JWT request/response interceptors
- **Notifications**: Sonner

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **ASGI Server**: Uvicorn
- **ORM**: SQLAlchemy 2.0 (with universal dialect-agnostic `Uuid` support)
- **Database Driver**: PyMySQL + Cryptography
- **Database**: MySQL 8.0 (Dual-compatible with PostgreSQL)
- **Security**: Argon2 password hashing, PyJWT bearer token authentication
- **Document Processing**: `pdfplumber`, `pypdf`, `python-docx`
- **Validation**: Pydantic v2 & Pydantic-Settings

---

## 🚀 Local Installation & Setup

### Prerequisites
- **Python 3.11+** installed
- **Node.js 18+** & npm installed
- **MySQL Server 8.0** active on `localhost:3306`

### 1. Database Configuration
Ensure MySQL Server is running, then create the database:
```sql
CREATE DATABASE IF NOT EXISTS jobs_portal;
```

### 2. Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run database seeder (initializes tables & seeds sample data)
python seed.py

# Start the FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive Swagger API docs will be live at: **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

### 3. Frontend Setup
```bash
# Navigate to the frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
The web application will be live at: **[http://127.0.0.1:5173](http://127.0.0.1:5173)**


