# InterviewX AI — Your Personal AI Interviewer & Proctored Recruiter Hub

> **"Practice Smarter. Speak Confidently. Get Interview Ready."**  
> *Prepared for Academic Project Demonstration & Submission — 26 October 2026*

---

## 🌟 Executive Overview

**InterviewX AI** is an enterprise-caliber, AI-proctored conversational interview ecosystem that bridges the gap between **Recruiters/Interviewers** and **Candidates/Students**:

- **For Interviewers / Recruiters**: A dedicated portal to create job interview campaigns, configure start/end date-time submission deadlines, auto-generate questions from job descriptions or add custom mandatory questions, and review complete candidate submissions with **video recording playback**, **AI proctoring violation reports** (face out of frame, tab switches, copy/paste), identity verification scores, and final hiring decision controls.
- **For Candidates / Students**: A proctored candidate lobby that tests camera and microphone permissions, cross-matches user-declared information against their uploaded resume, and guides them through a structured interview progression:
  1. **Self-Introduction**
  2. **Resume-Based Deep Dive** (Certifications, Projects, Skills, and Experience)
  3. **Job Description & Technical Architecture Questions** (Auto-generated or recruiter-defined)
  4. **Live Voice Answers**: Answers delivered via microphone speech recognition and semantically evaluated against explicit rubrics.

---

## 🚀 Key Modules & System Capabilities

### 1. Dual-Role Portals & Authentication (`/login`)
- Separate login workflows for **Interviewer / Recruiter** and **Candidate / Student**.
- Instant 1-click demonstration accounts for seamless academic review.

### 2. Recruiter Campaign & Deadline Management (`/interviewer`)
- Define Campaign Title, Target Job Role, and Job Description (JD).
- **Question Builder**: Auto-generate questions from role/JD with one click, or add required custom questions with categories and rubrics.
- **Scheduling Window**: Set Start Date/Time and End Date/Time. When the deadline passes, submissions automatically close.
- **Submissions Hub**: Lists all candidate attempts, showing Resume Match %, Proctoring Trust Score, Tab Switch counts, Face Lost counts, and video recording status.
- **Candidate Review Dossier**: Review video recording, identity cross-match verification, full question & answer transcripts, and assign final verdicts (`Shortlisted`, `Under Review`, `Rejected`).

### 3. Candidate Onboarding & Resume Verification (`/candidate`)
- **Device Permission Gate**: Prompts student for Camera & Microphone permissions with live webcam preview.
- **Identity Cross-Matching**: Compares declared candidate name, email, and phone against extracted resume metadata, flagging any discrepancy.
- **Structured Question Pipeline**:
  - Phase 1: Self-Introduction
  - Phase 2: Resume claims, certifications, projects, and skills
  - Phase 3: JD-related questions

### 4. Live AI Proctoring & Video Recording Engine (`/interview/room`)
- **Webcam Video Recording**: Records candidate video in browser using `MediaRecorder` API and stores high-capacity video blobs in **IndexedDB** (`src/lib/video-store.ts`).
- **Face Presence & Frame Analysis**: HTML5 canvas samples video frames every 1.5 seconds to detect face centering. Flags if the student moves out of frame or obscures the camera.
- **Tab Switch Detection**: Listens to `visibilitychange` and `window.onblur`, incrementing tab switch counters and displaying warning banners.
- **Copy/Paste Detection**: Monitors and restricts unauthorized clipboard actions during the interview.
- **Proctoring HUD**: Displays real-time face centering status, tab switches, and face-lost counts.

### 5. Multi-State Animated AI Interviewer Avatar (`src/components/avatar.tsx`)
- 5 reactive states: `idle`, `speaking`, `listening`, `thinking`, `success` with cyber-humanoid styling and waveform mouth animation.

### 6. Voice Answering & Semantic Rubric Scoring (`src/lib/audio.ts` & `src/lib/scoring.ts`)
- Spoken voice answers captured via Web Speech API (`webkitSpeechRecognition`) with text typing fallback.
- Semantic matching to question rubrics across 5 dimensions: Technical Precision (35%), Relevance (25%), Reasoning (20%), Communication (10%), and Practical Application (10%).

### 7. Academic Documentation Studio & DOCX/PDF Export (`/documentation`)
- Standard 8-section submission report with prompt registries, transcripts, repeat test analysis, and one-click export to **Microsoft Word (`.docx`)** and printable **PDF**.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS 4, Custom Glassmorphism, CSS Keyframe Animations |
| **Icons & Motion** | Lucide React, Framer Motion, Canvas-Confetti |
| **Visualizations** | Recharts (Cartesian, Bar, Radar Analytics) |
| **Media & Storage** | HTML5 MediaRecorder (WebM Video), Browser IndexedDB, Web Speech API |
| **AI Proctoring** | HTML5 Canvas Video Frame Pixel Sampling, Document Visibility API |
| **Document Processing** | `pdf-parse`, `mammoth`, `docx` (Word Report Generator) |
| **AI Integration** | Server-side Gemini API Adapter (`@google/genai`), Autonomous Calibrated Demo Engine |

---

## 📂 Project Directory Structure

```text
INTERVIEW BOT/
├── .env.example                     # Environment template
├── .gitignore                       # Git exclusion for secrets and resumes
├── package.json                     # Scripts and dependencies
├── tsconfig.json                    # TypeScript configuration
├── next.config.ts                   # Next.js 16 Turbopack configuration
├── README.md                        # Documentation & manual
├── tests/
│   └── test-suite.mjs               # Automated test suite (10/10 passed)
├── src/
│   ├── types/
│   │   └── index.ts                 # Domain types (Campaign, Proctoring, Verification)
│   ├── lib/
│   │   ├── audio.ts                 # Browser Speech Recognition & TTS
│   │   ├── demo-engine.ts           # Autonomous question bank & rubrics
│   │   ├── docx-generator.ts        # Word Document (.docx) report builders
│   │   ├── gemini.ts                # Gemini API server adapter
│   │   ├── proctoring.ts            # Face presence sampling & trust score math
│   │   ├── prompts.ts               # 9 Application prompts registry
│   │   ├── resume-parser.ts         # PDF/DOCX parsing & skill-matching
│   │   ├── samples.ts               # Fictional sample resumes (Alex Morgan & Priya Sharma)
│   │   ├── scoring.ts               # Weighted score math & recommendation logic
│   │   ├── storage.ts               # LocalStorage, campaigns, and sessions store
│   │   ├── verification.ts          # Identity-resume cross-matching & question pipeline
│   │   └── video-store.ts           # IndexedDB candidate video recording store
│   ├── components/
│   │   ├── avatar.tsx               # 5-State reactive animated AI avatar
│   │   ├── navbar.tsx               # Responsive header with portal role indicator
│   │   └── footer.tsx               # Academic footer with educational disclaimers
│   └── app/
│       ├── layout.tsx               # Root layout
│       ├── page.tsx                 # Landing Page
│       ├── globals.css              # Cyber-glassmorphism & avatar keyframes
│       ├── login/                   # Dual-role Login Portal (Recruiter vs. Candidate)
│       ├── interviewer/             # Recruiter Dashboard, Campaign Builder, Submissions Hub
│       ├── candidate/               # Candidate Lobby (Permissions, Resume Match, Launch)
│       ├── dashboard/               # Candidate Performance Analytics
│       ├── resume/                  # Resume Studio
│       ├── interview/
│       │   ├── setup/               # Interview Configuration
│       │   └── room/                # Live Proctored Interview Room (Video REC, HUD)
│       ├── assessment/[id]/         # Candidate Assessment Report & DOCX/PDF export
│       ├── repeat-test/             # Dedicated Repeated Question Testing Lab
│       ├── coding/                  # Algorithmic Coding Challenge Playground
│       ├── questions/               # Question Lab & Rubric Explorer
│       ├── documentation/           # Academic Documentation Studio (8 sections)
│       └── settings/                # Settings, Gemini Key, and Custom Rubric Weights
```

---

## ⚙️ Running Locally

```powershell
# 1. Install dependencies
npm install

# 2. Run automated test suite (10/10 tests)
npm test

# 3. Start development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in Google Chrome or Microsoft Edge.

---

## 🎓 Academic Demonstration Guide (October 26, 2026)

| # | Flow | URL | Demonstration Actions |
| :--- | :--- | :--- | :--- |
| **1** | **Role-Based Login** | `/login` | Click **Demo Recruiter Login** or **Demo Candidate Login** to show role separation. |
| **2** | **Recruiter Campaign Builder** | `/interviewer` | Click **Create Interview Campaign**. Select role, paste JD, click **Auto-Generate from Role**, set start/end deadlines, and save. |
| **3** | **Deadline Enforcement** | `/interviewer` | Point out the "Accepting Responses" vs. "Submissions Closed" status based on end dates. |
| **4** | **Candidate Device Verification** | `/candidate` | Grant camera and microphone access. Observe live webcam preview and green permission checks. |
| **5** | **Identity-Resume Matching** | `/candidate` | Enter declared name and select resume. Show the live **Cross-Matching Result** (100% verification score). |
| **6** | **AI-Proctored Video Interview** | `/interview/room` | Click **Launch Proctored Video Interview**. Observe webcam PIP with **REC** badge. Move head out of frame or switch tabs to demonstrate live warning alerts. |
| **7** | **Voice Answering** | `/interview/room` | Click **Answer Through Voice** and speak. Observe speech-to-text live streaming and rubric evaluation. |
| **8** | **Recruiter Review Dossier** | `/interviewer` | Under Submissions Hub, click **Review Dossier** on candidate. Show video recording badge, proctoring violation counts (tab switches, face lost), and set decision to **Shortlisted**. |
| **9** | **Assessment Report & Export** | `/assessment/[id]` | Inspect overall score, category breakdown, and click **Export DOCX** to download the Word report. |
| **10** | **Academic Documentation** | `/documentation` | Walk through all 8 sections and click **Download DOCX Report**. |
