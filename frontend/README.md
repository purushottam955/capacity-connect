# CAPACITY CONNECT - Frontend Web Application

Modern, accessible, responsive React 19 + TypeScript + Vite single-page application for the **CAPACITY CONNECT** Digital Capacity Building Portal (SIH 2026 Problem Statement 26075 - Ministry of Earth Sciences / IMD).

---

## 🎨 UI/UX & Design Highlights

- **Visual Theme:** Ministry of Earth Sciences / IMD thematic palette:
  - Deep Navy (`#0A2540`) & Government Blue (`#1E3A8A`)
  - Accent Cyan (`#0284C7`)
  - Crisp Slate neutrals & WCAG 2.1 AA compliant contrast
- **Instant Persona Switcher:** Switch between Trainee, Trainer, and Admin roles directly in the top navigation bar with one click during live judging sessions.
- **Interactive Visualizations:**
  - Competency Radar / Benchmark Bar Comparison charts (Recharts)
  - Color-coded gap badges (Level 1 Foundation through Level 5 Expert)
  - Explainable recommendation chips (`"Recommended because..."`)
  - Real-time timed MCQ assessment interface with instant score breakdown and competency upgrade banner
  - Interactive Trainer Matching Engine with 40/25/20/15 factor breakdown
  - Human-in-the-Loop AI Question Generator and Editor
  - Tamper-evident printable Certificate of Competency modal

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- Node.js 18+ (tested on Node.js 20+)
- Backend API running on `http://localhost:8000`

### 2. Install Dependencies
```bash
# Windows
npm install
# or
cmd.exe /c "npm install"

# macOS / Linux
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```
Default API URL in `.env`:
```
VITE_API_URL=http://localhost:8000
```

### 4. Start Development Server
```bash
npm run dev
# or on Windows
cmd.exe /c "npm run dev"
```
Open your browser to:
👉 **http://localhost:5173**

### 5. Build for Production
```bash
npm run build
```
Generates optimized static assets in `dist/`.

---

## 📁 Source Code Organization

```
frontend/src/
├── api/
│   └── client.ts            # Typed Axios/Fetch wrapper with JWT handling
├── components/
│   ├── Navbar.tsx           # Global header with instant role switcher & notifications
│   ├── Sidebar.tsx          # Dynamic role-based navigation sidebar
│   ├── CompetencyBadge.tsx  # Level 1-5 visual indicators
│   ├── GapBadge.tsx         # Skill gap severity chips
│   ├── ProtectedRoute.tsx   # Role-based route guard
│   └── CertificateModal.tsx # Printable competency achievement modal
├── context/
│   └── AuthContext.tsx      # Auth session & demo persona switcher
├── pages/
│   ├── LandingPage.tsx      # Problem statement & closed-loop showcase
│   ├── SignInPage.tsx       # Credentials login
│   ├── SignUpPage.tsx       # Role-specific registration
│   ├── trainee/             # 13 Trainee portal pages
│   ├── trainer/             # 8 Trainer portal pages
│   └── admin/               # 8 Admin portal pages
├── types/
│   └── index.ts             # TypeScript domain types & interfaces
└── App.tsx                  # App routes & role guards
```
