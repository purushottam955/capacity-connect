# CAPACITY CONNECT - Backend API

Production-grade FastAPI REST API engine for the **CAPACITY CONNECT** Digital Capacity Building and Learning Management Portal for the Ministry of Earth Sciences (MoES) and India Meteorological Department (IMD) (SIH 2026 Problem Statement 26075).

---

## 🚀 Architecture Overview

- **Framework:** FastAPI (Python 3.10+)
- **ORM & Database:** SQLAlchemy 2.0 with PostgreSQL compatibility and automatic zero-setup SQLite fallback (`capacity_connect.db`).
- **Data Validation:** Pydantic v2 schemas (`app/schemas/`).
- **Security:** Pure `bcrypt` password hashing, JWT bearer tokens, role-based access control (RBAC: `Trainee`, `Trainer`, `Admin`).
- **Core Intelligence Engines:**
  - **Competency Service (`app/services/competency_service.py`):** Calculates competency gap deltas ($Gap = Level_{required} - Level_{current}$), explainable course recommendations, and closed-loop database upgrades upon passing assessments ($\ge 70\%$).
  - **Trainer Matching Engine (`app/services/trainer_matching_service.py`):** Multi-factor weighted scoring formula:
    $$\text{Score} = (0.40 \times \text{CompetencyMatch}) + (0.25 \times \text{SubjectExpertise}) + (0.20 \times \text{Experience}) + (0.15 \times \text{Rating})$$
    Returns transparent, audited bullet points explaining the match.
  - **AI Question Engine (`app/services/ai_service.py`):** LLM integration with automatic deterministic meteorology question bank fallback covering NWP, satellite imagery, Doppler radar, and Python for meteorological data.

---

## 🛠️ Local Development Setup

### 1. Create and Activate Virtual Environment
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

### 4. Database Initialization & Seeding
```bash
python -m app.seed
```
This initializes the database schema and populates realistic IMD job roles, competencies, courses, assessments, enrollments, and demo users.

### 5. Run API Server
```bash
uvicorn app.main:app --reload --port 8000
```
Interactive Swagger API documentation is available at:
👉 **http://localhost:8000/docs**

---

## 🧪 Running Integration Tests

```bash
pytest tests/ -v
```
All integration tests verify:
- Health endpoints
- Trainee dashboard & explainable recommendations
- Weighted trainer matching scoring
- AI assessment generation fallback
- Closed-loop database competency progression

---

## 📁 Directory Structure

```
backend/
├── app/
│   ├── config.py           # Application settings & environment parsing
│   ├── database.py         # SQLAlchemy engine & session factory
│   ├── main.py             # FastAPI entrypoint & CORS configuration
│   ├── seed.py             # Realistic IMD demo seed data
│   ├── models/
│   │   └── entities.py     # Relational database models (20+ entities)
│   ├── schemas/            # Pydantic request/response schemas
│   ├── routers/            # Role & resource modular endpoints
│   └── services/           # Competency, trainer matching, AI, auth services
├── tests/
│   └── test_api.py         # Pytest test suite
├── uploads/                # File storage for course resources & slides
├── requirements.txt        # Python package dependencies
└── render.yaml             # Render deployment configuration
```
