# 🚀 MatchRank AI — Automated Resume Matcher & Skill Ranking Engine

An intelligent, explainable Machine Learning and Natural Language Processing (NLP) system that analyzes candidate resumes against job descriptions, extracts domain-specific competencies, computes multi-factor weighted match scores, and ranks candidates on an interactive recruiter dashboard.

---

## 🌟 Core Architecture & Workflow

```mermaid
flowchart TD
    JD[Job Description Text] --> JDP[JD Parser & Entity Extractor]
    JDP --> ReqSkills[Required & Preferred Skills Taxonomy]
    JDP --> ReqExp[Experience & Education Requirements]
    
    Resumes[Resume Uploads: PDF / DOCX / TXT] --> TextExt[Multi-Format Text Extraction]
    TextExt --> BioExt[Contact & Bio Info Extractor]
    TextExt --> SkillExt[N-Gram & Regex Skill Extractor]
    TextExt --> ExpExt[Timeline & Experience Calculator]
    TextExt --> ATSExt[ATS Compatibility & Action Verbs Analyzer]
    
    ReqSkills & SkillExt --> SkillMatch[1. Exact & Synonym Skill Matching (50%)]
    JD & TextExt --> SemanticMatch[2. TF-IDF & N-Gram Semantic Cosine (20%)]
    ReqExp & ExpExt --> ExpMatch[3. Experience Duration Fit (15%)]
    JDP & TextExt --> EduMatch[4. Degree & Education Fit (10%)]
    TextExt --> CertMatch[5. Verified Certifications Fit (5%)]
    
    SkillMatch & SemanticMatch & ExpMatch & EduMatch & CertMatch --> ScoringEngine[Explainable Scoring Engine]
    ScoringEngine --> Leaderboard[Ranked Candidate Leaderboard (#1 Gold, #2 Silver...)]
    Leaderboard --> Dashboard[Modern Recruiter Dashboard & Comparison Matrix]
```

---

## 🎯 Key Features

| Feature | Description |
|---|---|
| **Multi-Format Resume Parser** | Extracts raw text and structural sections from `.pdf` (via `pdfplumber` / `pypdf`), `.docx` (via `python-docx`), and `.txt`. |
| **Taxonomy & Skill Extraction** | Ontology of **350+ skills** categorized across 11 tech domains (AI/ML, Backend, Frontend, Cloud/DevOps, Databases, Big Data, etc.) with alias resolution (`k8s` → `Kubernetes`, `py` → `Python`, `js` → `JavaScript`). |
| **Job Description Parser** | Automatically identifies role title, core required skills, preferred bonus skills, minimum experience years, and degree requirements. |
| **Semantic Matching** | Sublinear TF-IDF + unigram/bigram vectorizer and cosine similarity to capture contextual relevance beyond exact keywords. |
| **Explainable Scoring Engine** | Fully transparent multi-factor weighted ranking model with customizable weights and granular strength/gap explanations. |
| **ATS Health & Quality Analyzer** | Evaluates action verbs density, quantifiable metrics, section structures, and contact completeness. |
| **Side-by-Side Comparison Matrix** | Select up to 3 candidates simultaneously and compare skill-by-skill, experience, education, and ATS metrics. |
| **Live NLP Skill Playground** | Real-time text sandbox to test skill extraction and domain categorization on arbitrary text snippets. |
| **Pre-loaded Benchmark Data** | 5 pre-configured industry job templates and 6 diverse candidate profiles ready for 1-click testing. |
| **Report Export** | Export leaderboard rankings as **CSV**, **JSON**, or print-ready scorecards. |

---

## 🧮 Explainable Scoring Model

The final candidate match score is calculated as a composite weighted sum:

$$\text{Final Score} = w_{\text{skill}} \cdot S_{\text{skill}} + w_{\text{semantic}} \cdot S_{\text{semantic}} + w_{\text{exp}} \cdot S_{\text{exp}} + w_{\text{edu}} \cdot S_{\text{edu}} + w_{\text{cert}} \cdot S_{\text{cert}}$$

### Default Weight Distribution (Configurable via UI Sliders):
- **Skill Match ($50\%$)**: Percentage of required skills matched + partial credit for synonyms & bonus preferred skills.
- **Semantic Match ($20\%$)**: Cosine similarity of TF-IDF word & n-gram feature vectors between Job Description and Resume.
- **Experience Match ($15\%$)**: Candidate's detected years of experience scaled against the target requirement range.
- **Education Match ($10\%$)**: Highest degree level comparison (Doctorate > Master's > Bachelor's > Diploma).
- **Certifications ($5\%$)**: Recognition of accredited industry credentials (e.g., AWS Certified, CKA, PMP).

---

## 💻 Tech Stack

### Backend
- **Python 3.14+**
- **FastAPI** & **Uvicorn** (RESTful API with CORS & Multipart Uploads)
- **scikit-learn** & **NumPy** (TF-IDF vectorizer, N-grams, Cosine Similarity)
- **pdfplumber**, **pypdf**, **python-docx** (Multi-format document parsing)
- **ReportLab** (Sample resume generator)

### Frontend
- **React 19** + **Vite**
- **Lucide React** (Modern iconography)
- **Canvas-Confetti** (Ranking celebration animations)
- **Tailwind CSS & Vanilla CSS Design System** (Glassmorphism, glowing badges, dark/light theme)

---

## ⚡ Quick Start & Setup Guide

### 1. Backend Setup
```bash
# Navigate to project root
cd /Users/ronak/Desktop/ml-mini-project

# Activate virtual environment
source venv/bin/activate

# Install dependencies (if not already installed)
pip install -r backend/requirements.txt

# Run FastAPI Server (Port 8000)
python backend/run.py
```
> API will be live at: **`http://localhost:8000`**  
> Interactive Swagger Docs: **`http://localhost:8000/docs`**

---

### 2. Frontend Setup
```bash
# In a new terminal window
cd /Users/ronak/Desktop/ml-mini-project/frontend

# Install dependencies
npm install

# Run Vite Dev Server
npm run dev
```
> Web Application will be live at: **`http://localhost:5174`** (or **`http://localhost:5173`**)

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and taxonomy statistics |
| `GET` | `/api/sample-jobs` | List of 5 pre-configured realistic job descriptions |
| `GET` | `/api/sample-resumes` | List of 6 pre-configured benchmark candidate resumes |
| `GET` | `/api/taxonomy` | Full 350+ categorized skills taxonomy |
| `POST` | `/api/parse-jd` | Parses job description into structured requirements |
| `POST` | `/api/extract-skills` | Live regex and taxonomy skill extraction from raw text |
| `POST` | `/api/match-and-rank` | Core endpoint: parses JD + resumes, scores, and returns ranked leaderboard |
| `GET` | `/api/download-sample/{filename}` | Download generated sample PDF/DOCX resume file |

---

## 📂 Project Structure

```
ml-mini-project/
├── backend/
│   ├── app/
│   │   ├── ml/
│   │   │   ├── skills_taxonomy.py    # 350+ skills ontology & canonical aliases
│   │   │   ├── skill_extractor.py    # Boundary regex & multi-word phrase matcher
│   │   │   ├── semantic_matcher.py   # TF-IDF & cosine vector similarity
│   │   │   ├── scoring_engine.py     # Multi-factor explainable scoring & ranking
│   │   │   └── ats_analyzer.py       # ATS readability, power verbs & metric density
│   │   ├── parsers/
│   │   │   ├── resume_parser.py      # PDF, DOCX, TXT document parser & entity extractor
│   │   │   └── jd_parser.py          # Job description requirement parser
│   │   ├── models/
│   │   │   └── schemas.py            # Pydantic schemas for API validation
│   │   ├── data/
│   │   │   ├── sample_jobs.py        # 5 Industry Job Descriptions
│   │   │   └── sample_resumes.py     # 6 Diverse Candidate Profiles
│   │   └── main.py                   # FastAPI application & route handlers
│   ├── sample_files/                 # Real generated PDF & DOCX test files
│   ├── generate_sample_files.py      # Script to generate PDF/DOCX resumes
│   ├── requirements.txt
│   └── run.py                        # Backend runner script
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── JobDescriptionPanel.jsx
│   │   │   ├── ResumeUploader.jsx
│   │   │   ├── WeightCustomizer.jsx
│   │   │   ├── CandidateCard.jsx
│   │   │   ├── CandidateDetailModal.jsx
│   │   │   ├── ComparisonModal.jsx
│   │   │   ├── AnalyticsSummary.jsx
│   │   │   ├── ATSScoreCard.jsx
│   │   │   ├── ScoreBreakdownBar.jsx
│   │   │   ├── SkillTag.jsx
│   │   │   ├── SkillExtractorPlayground.jsx
│   │   │   └── TaxonomyBrowser.jsx
│   │   ├── services/
│   │   │   └── api.js                # API connector
│   │   ├── utils/
│   │   │   └── exportUtils.js        # CSV & JSON export utilities
│   │   ├── App.jsx                   # Main React application
│   │   └── index.css                 # Glassmorphism & design system tokens
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```
