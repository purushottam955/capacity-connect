# CAPACITY CONNECT
### Digital Capacity Building and Learning Management Portal
> **Smart India Hackathon (SIH) 2026 | Problem Statement ID: 26075**  
> **Ministry of Earth Sciences (MoES) | India Meteorological Department (IMD)**  
> **Category: Software | Theme: Smart Education**  
> **Tagline:** *“Connecting People, Competencies and Learning.”*

---

## 1. Executive Summary & Problem Context

In operational meteorological and atmospheric research organizations such as the **India Meteorological Department (IMD)** and the **Ministry of Earth Sciences (MoES)**, training needs evolve rapidly with emerging technologies: Numerical Weather Prediction (NWP), Doppler Weather Radar (DWR) nowcasting, satellite multi-spectral telemetry, and high-performance climate modeling.

Conventional Learning Management Systems (LMS) function as passive course catalogs without context of:
1. What competencies an individual officer's role actually demands.
2. What specific capability deficits (skill gaps) exist.
3. Which learning modules directly close those verified gaps.
4. Whether competency levels actually improved after training delivery.
5. Which faculty experts across national divisions possess the exact verified competencies required to lead specialized operational training.

**CAPACITY CONNECT** transforms this paradigm into a closed-loop digital capacity-building ecosystem.

```
PEOPLE → COMPETENCY MAPPING → SKILL GAPS → PERSONALIZED LEARNING → ASSESSMENTS → COMPETENCY UPDATE → TRAINER MATCHING → ORGANIZATIONAL CAPACITY
```

---

## 2. Core Architecture & Architectural USPs

### A. Closed-Loop Competency Progression (Trainee Side)
1. **Role Benchmarks:** Job roles (e.g., *Meteorologist Grade-I*, *Weather Radar Specialist*) define required proficiency levels (Levels 1–5).
2. **Explainable Skill Gaps:** Transparent difference calculation between required benchmark and current assessed level (e.g. *Required: Level 4, Current: Level 2 → Gap: 2*).
3. **Targeted Recommendations:** Recommends specific accredited courses and displays transparent reasoning:  
   *“Recommended because your Python competency is Level 2, while your role as Meteorologist Grade-I requires Level 4 (Skill Gap: -2).”*
4. **Verifiable MCQ Assessment:** Interactive timed examination auto-scored by the system.
5. **Real-Time Competency Database Upgrade:** When a trainee scores $\ge 70\%$, their competency level in the database is automatically upgraded, closing the gap in real-time, refreshing recommendations, and auto-issuing an official MoES/IMD digital certificate.

### B. Transparent Weighted Trainer Matching Engine (Admin Side)
When leadership creates an institutional training requirement, the platform ranks faculty using a transparent weighted algorithm:
* **40% Competency Coverage:** Direct match between trainer's verified capabilities and syllabus requirements.
* **25% Subject Expertise:** Thematic keyword and domain alignment (e.g., NWP, INSAT telemetry, Doppler radar).
* **20% Relevant Operational Experience:** Years in atmospheric forecasting relative to requirement threshold.
* **15% Pedagogical Credentials & Rating:** WMO Class-I instructor certifications, doctoral degrees, and trainee feedback.
* **Explainable Output:** Transparent bullet points detailing exactly why a trainer was matched, allowing directors to assign lead faculty in one click.

### C. Human-in-the-Loop AI Assessment Generation (Trainer Side)
* Trainers enter syllabus topics or upload research notes/PDFs.
* The AI engine generates accredited MCQs with options, correct answer keys, and diagnostic atmospheric explanations.
* **Deterministic Meteorology Fallback:** Even without an external LLM API key, a robust deterministic meteorological question bank ensures 100% reliable evaluation during offline judging sessions.
* **Mandatory Faculty Review:** Generated questions can be edited, revised, or supplemented before publication.

---

## 3. Role-Based Features

| Role | Key Capabilities |
| :--- | :--- |
| **TRAINEE** | Professional profile, Competency matrix (Req vs Current), Skill gap analysis, Explainable recommendations, Course catalog & enrollment, Study materials (NetCDF guides, slides, video lectures), Timed MCQ assessments, Real-time competency upgrades, Verifiable printable certificates, Course feedback, Institutional notifications. |
| **TRAINER** | Faculty credentials & WMO certifications, Course creation with competency mapping, Resource library (PDF/PPTX/video upload), AI quiz generator with human-in-the-loop editing, Assessment publication, Trainee performance analytics & score distribution, Matched training requests. |
| **ADMIN** | User directory & role governance, Competency framework dictionary & level definitions, Job role benchmarks, Institutional training requirement creation, 40/25/20/15 Trainer Matching Engine, Department competency gap heatmaps, Announcement broadcasting, Platform settings. |

---

## 4. Tech Stack

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts.
* **Backend:** Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2, Uvicorn.
* **Database:** SQLite (default zero-setup local dev) / PostgreSQL (Render production ready).
* **Security & Auth:** OAuth2 password flow, JWT tokens (HS256), Direct bcrypt password hashing, Role-Based Access Control (RBAC).
* **Testing:** Pytest, FastTest TestClient.

---

## 5. Pre-Seeded Demo Accounts

For immediate evaluation during SIH judging sessions, the database is pre-seeded with realistic Ministry of Earth Sciences and IMD personnel:

| Role | Official Name & Designation | Email | Password |
| :--- | :--- | :--- | :--- |
| **Trainee** | Dr. Rajesh Sharma (*Meteorologist Grade-I, NWFC*) | `trainee@capacityconnect.demo` | `Demo@123` |
| **Trainer** | Prof. Ananya Sen (*Senior Principal Scientist, NWP*) | `trainer@capacityconnect.demo` | `Demo@123` |
| **Admin** | Dr. K. V. Ramanathan (*Director of Capacity Building*) | `admin@capacityconnect.demo` | `Demo@123` |

> **Pro-Tip for SIH Judges:** The top navigation bar includes an **Instant Persona Switcher** dropdown allowing one-click role switching without logging out!

---

## 6. Local Setup Guide (VS Code)

### Prerequisites
* **Node.js** v18+ (tested on v24)
* **Python** 3.10+ (tested on 3.12)
* **Git**

### Step 1: Clone Repository & Open in VS Code
```bash
git clone https://github.com/your-org/capacity-connect.git
cd capacity-connect
```

### Step 2: Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run initial database migration and seeding
python -m app.seed

# Start backend development server
uvicorn app.main:app --reload --port 8000
```
Backend API will be running at `http://localhost:8000` with interactive Swagger docs at `http://localhost:8000/docs`.

### Step 3: Frontend Setup
In a new terminal:
```bash
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev
```
Frontend portal will be live at `http://localhost:5173`.

---

## 7. Golden Demo Walkthrough (For SIH Judges)

### Flow 1: Trainee Closed-Loop Competency Upgrade
1. Click **Demo as Trainee** on the landing page or sign in as `trainee@capacityconnect.demo`.
2. Inspect the **Dashboard**: Notice active skill gap in **Python (Level 2 vs Required Level 4)**.
3. Open **Personalized Recommendations**: Observe explainable rationale card recommending *"Python for Meteorological Data Analysis"*.
4. Open the course, review syllabus and NetCDF study resources, and click **Start Assessment**.
5. Attempt the assessment:
   * Q1: `B` (xarray)
   * Q2: `A` (PlateCarree)
   * Q3: `B` (Dask lazy evaluation)
   * Q4: `A` (Broadcasting)
   * Q5: `A` (Poisson constant)
6. Click **Submit Assessment**.
7. **The Closed-Loop Payoff:** Score $100\% \ge 70\%$. Observe the green banner confirming **Python Competency upgraded to Level 3 in the live database**. Click **View Official Certificate** to render the tamper-evident certificate!

### Flow 2: Trainer AI Quiz Generation & Publishing
1. Switch to **Trainer View** via top navbar dropdown (`trainer@capacityconnect.demo`).
2. Go to **AI Quiz Generator**.
3. Topic is pre-filled with *"Numerical Weather Prediction - Primitive Equations"*.
4. Click **Generate MCQs with AI Engine**.
5. Observe synthesized questions with atmospheric physics explanations.
6. Edit option text or correct answers inline.
7. Click **Approve & Publish Assessment**. The assessment is instantly live in the catalog!

### Flow 3: Admin Competency-Based Trainer Matching
1. Switch to **Admin View** (`admin@capacityconnect.demo`).
2. Go to **Trainer Matching Engine**.
3. Select *"Advanced Weather Data Analytics & Python Automation"*.
4. Inspect the 40/25/20/15 algorithm score breakdown and transparent explainable justifications.
5. Click **Assign as Lead Faculty** for Prof. Ananya Sen.
6. Notice the confirmation notification dispatched and public training announcement broadcast!

---

## 8. Automated Test Suite

Run backend unit and integration tests using pytest:
```bash
cd backend
python -m pytest -v tests/test_api.py
```
Tests automatically verify:
* System health check
* JWT authentication and RBAC
* 40/25/20/15 Trainer Matching algorithm
* AI MCQ generation with fallback
* Real closed-loop database competency upgrading and certificate issuance

---

## 9. Render Deployment Instructions

The repository is pre-configured with `render.yaml` for 1-click Render deployment:

1. Push your code to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** → **Blueprint**.
3. Connect your GitHub repository.
4. Render automatically provisions:
   * **`capacity-connect-db`**: Managed PostgreSQL database.
   * **`capacity-connect-api`**: Python web service with automatic seeding and health check.
   * **`capacity-connect-ui`**: Vite React static site with rewrite rules.
5. Environment variables are automatically mapped via `render.yaml`.

---

## 10. Departmental Impact & Future Scope

* **Immediate IMD Impact:** Bridges forecaster skill deficits across regional meteorological centers ahead of seasonal monsoon and cyclone operational windows.
* **Explainable Governance:** Eliminates subjective faculty assignment via audited, competency-aligned matching.
* **Future Horizons:** Integration with WMO Global Training Network, automated radar telemetry question synthesis, and multi-modal satellite video analysis.
