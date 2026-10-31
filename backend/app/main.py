"""
FastAPI Server for Automated Resume Matcher & Skill Ranking Engine.
Includes Live Job Scraper, Live Market Tech Feeds, AI Interview Kit, Market Salary Estimator, and SQLite Persistence.
"""

import os
import json
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.ml.skill_extractor import SkillExtractor
from app.ml.semantic_matcher import SemanticMatcher
from app.ml.ats_analyzer import ATSAnalyzer
from app.ml.ml_classifier import MLJobClassifier
from app.ml.scoring_engine import ScoringEngine, DEFAULT_WEIGHTS
from app.ml.skills_taxonomy import SKILL_CATEGORIES
from app.parsers.resume_parser import ResumeParser
from app.parsers.jd_parser import JobDescriptionParser
from app.parsers.live_job_fetcher import LiveJobFetcher
from app.db.database import init_db, get_db, JobPosting, EvaluationRun, RecruiterPipelineItem
from app.data.sample_jobs import SAMPLE_JOBS
from app.data.sample_resumes import SAMPLE_CANDIDATES
from app.models.schemas import (
    JobDescriptionRequest,
    SkillExtractionRequest,
    WeightsConfig
)

# Initialize DB
init_db()

app = FastAPI(
    title="MatchRank AI - Automated Resume Matcher & Skill Ranking Engine API",
    description="NLP and ML-powered candidate-job matcher with live URL scraper, explainable scoring, ATS analytics, AI interview generation, and recruiter CRM pipeline.",
    version="2.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML & NLP Singletons
skill_extractor = SkillExtractor()
semantic_matcher = SemanticMatcher()
ats_analyzer = ATSAnalyzer()
ml_classifier = MLJobClassifier()
scoring_engine = ScoringEngine(skill_extractor, semantic_matcher, ats_analyzer, ml_classifier)
resume_parser = ResumeParser()
jd_parser = JobDescriptionParser(skill_extractor)
live_job_fetcher = LiveJobFetcher()

# Pre-parse sample resumes cleanly
PARSED_SAMPLE_RESUMES = []
base_samples_dir = os.path.join(os.path.dirname(__file__), "..", "sample_files")

for cand in SAMPLE_CANDIDATES:
    file_path = os.path.join(base_samples_dir, cand["filename"])
    if os.path.exists(file_path):
        with open(file_path, "rb") as f:
            file_bytes = f.read()
        parsed_meta = resume_parser.parse_file(cand["filename"], file_bytes)
    else:
        parsed_meta = {
            "filename": cand["filename"],
            "raw_text": cand["raw_text"],
            "word_count": len(cand["raw_text"].split()),
            "contact": resume_parser.extract_contact_info(cand["raw_text"], cand["filename"]),
            "experience": resume_parser.extract_experience(cand["raw_text"]),
            "education": resume_parser.extract_education(cand["raw_text"]),
            "certifications": resume_parser.extract_certifications(cand["raw_text"]),
            "sections": resume_parser.segment_sections(cand["raw_text"])
        }

    skills_meta = skill_extractor.extract_skills(cand["raw_text"])
    parsed_meta["skills"] = skills_meta
    parsed_meta["id"] = cand["id"]
    PARSED_SAMPLE_RESUMES.append(parsed_meta)


# Request schemas for live features
class ScrapeJobUrlRequest(BaseModel):
    url: str

class UpdatePipelineStatusRequest(BaseModel):
    candidate_id: str
    candidate_name: str
    candidate_email: Optional[str] = ""
    job_id: str
    job_title: str
    overall_match: float
    tier: str
    status: str # "Reviewing", "Shortlisted", "Interviewing", "Offer", "Archived"
    notes: Optional[str] = ""
    rating: Optional[int] = 3


@app.get("/")
def root():
    return {
        "name": "MatchRank AI Engine",
        "status": "operational",
        "version": "2.0.0",
        "docs_url": "/docs"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "skills_in_taxonomy": len(skill_extractor.canonical_skills),
        "categories_count": len(SKILL_CATEGORIES),
        "sample_jobs_available": len(SAMPLE_JOBS),
        "sample_resumes_available": len(SAMPLE_CANDIDATES),
        "live_scraper_active": True,
        "database_connected": True
    }


@app.get("/api/taxonomy")
def get_taxonomy():
    """Returns the full skills taxonomy grouped by category."""
    return {
        "categories": SKILL_CATEGORIES,
        "total_skills": sum(len(skills) for skills in SKILL_CATEGORIES.values())
    }


@app.get("/api/sample-jobs")
def get_sample_jobs():
    """Returns pre-configured realistic job descriptions."""
    return SAMPLE_JOBS


@app.get("/api/live-market-jobs")
async def get_live_market_jobs():
    """Fetches real-time open developer jobs from live market APIs."""
    live_jobs = await live_job_fetcher.fetch_live_market_jobs()
    return live_jobs


@app.post("/api/scrape-job-url")
async def scrape_job_from_url(request: ScrapeJobUrlRequest):
    """Scrapes a live job posting URL (LinkedIn, Greenhouse, Lever, etc.) and auto-parses requirements."""
    if not request.url.strip():
        raise HTTPException(status_code=400, detail="URL cannot be empty.")

    scraped = await live_job_fetcher.fetch_job_from_url(request.url)
    if "error" in scraped and not scraped.get("description"):
        raise HTTPException(status_code=422, detail=scraped["error"])

    # Auto parse the scraped job description
    parsed_reqs = jd_parser.parse_job_description(scraped["description"], scraped["title"])
    scraped["parsed_requirements"] = parsed_reqs
    return scraped


@app.get("/api/sample-resumes")
def get_sample_resumes():
    """Returns pre-configured realistic candidate profiles."""
    return [
        {
            "id": c["id"],
            "name": c["name"],
            "filename": c["filename"],
            "email": c["email"],
            "phone": c["phone"],
            "summary_preview": c["raw_text"][:200] + "..."
        }
        for c in SAMPLE_CANDIDATES
    ]


@app.post("/api/parse-jd")
def parse_job_description(request: JobDescriptionRequest):
    """Parses a job description text into structured requirements."""
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Job description text cannot be empty.")
    
    parsed = jd_parser.parse_job_description(request.text, request.title)
    return parsed


@app.post("/api/extract-skills")
def extract_skills_playground(request: SkillExtractionRequest):
    """Live interactive skill extraction from arbitrary text."""
    if not request.text.strip():
        return {"skills": [], "categorized": {}, "count": 0, "domain_distribution": {}}
    
    return skill_extractor.extract_skills(request.text)


# ML Model Management & Inference Endpoints
class MLPredictRequest(BaseModel):
    text: str
    top_k: Optional[int] = 5

@app.get("/api/ml-model/info")
def get_ml_model_info():
    """Returns current trained ML classifier architecture, accuracy metrics, and top features."""
    return ml_classifier.get_model_info()

@app.post("/api/ml-model/train")
def train_ml_model():
    """Triggers end-to-end retraining of the ML job classification model and updates metrics."""
    metrics = ml_classifier.retrain()
    return {
        "status": "success",
        "message": f"ML Model successfully retrained with {metrics.get('test_accuracy', 0)}% accuracy!",
        "metrics": metrics
    }

@app.post("/api/ml-model/predict")
def predict_ml_role(request: MLPredictRequest):
    """Executes real-time ML inference to predict top job roles and domain probabilities from resume text."""
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty for ML prediction.")
    return ml_classifier.predict_role(request.text, top_k=request.top_k or 5)


@app.post("/api/match-and-rank")
async def match_and_rank_candidates(
    job_title: str = Form("Software Engineer"),
    job_description: str = Form(...),
    weights_json: Optional[str] = Form(None),
    use_sample_resumes: Optional[bool] = Form(False),
    files: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db)
):
    """
    Main ranking endpoint:
    Parses Job Description, extracts requirements, processes resumes (uploaded or sample),
    applies ML scoring & ranking, and returns an explainable leaderboard with AI interview kits.
    """
    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description text is required.")

    # 1. Parse weights
    weights = dict(DEFAULT_WEIGHTS)
    if weights_json:
        try:
            custom_w = json.loads(weights_json)
            for k in DEFAULT_WEIGHTS:
                if k in custom_w:
                    weights[k] = float(custom_w[k])
        except Exception:
            pass

    # 2. Parse Job Description
    parsed_jd = jd_parser.parse_job_description(job_description, job_title)

    # 3. Gather candidate resumes
    candidates_to_match = []

    if files:
        for file in files:
            if file.filename:
                contents = await file.read()
                parsed_res = resume_parser.parse_file(file.filename, contents)
                parsed_res["skills"] = skill_extractor.extract_skills(parsed_res["raw_text"])
                parsed_res["id"] = f"upload_{file.filename}"
                candidates_to_match.append(parsed_res)

    if use_sample_resumes or not candidates_to_match:
        candidates_to_match.extend(PARSED_SAMPLE_RESUMES)

    if not candidates_to_match:
        raise HTTPException(status_code=400, detail="No resumes provided for matching.")

    # 4. Score each candidate
    candidate_matches = []
    for candidate in candidates_to_match:
        match_result = scoring_engine.match_candidate(candidate, parsed_jd, weights)
        match_result["candidate_id"] = candidate.get("id", candidate.get("filename"))
        match_result["raw_text_snippet"] = candidate.get("raw_text", "")[:350] + "..."
        match_result["full_raw_text"] = candidate.get("raw_text", "")
        candidate_matches.append(match_result)

    # 5. Rank candidates
    ranked_leaderboard = scoring_engine.rank_candidates(candidate_matches)

    # 6. Aggregate Analytics
    scores = [c["overall_match"] for c in ranked_leaderboard]
    tier_counts = {
        "Top Match": sum(1 for c in ranked_leaderboard if c["tier"] == "Top Match"),
        "Strong Fit": sum(1 for c in ranked_leaderboard if c["tier"] == "Strong Fit"),
        "Moderate Fit": sum(1 for c in ranked_leaderboard if c["tier"] == "Moderate Fit"),
        "Low Relevance": sum(1 for c in ranked_leaderboard if c["tier"] == "Low Relevance")
    }

    analytics = {
        "total_candidates": len(ranked_leaderboard),
        "average_score": round(sum(scores) / len(scores), 1) if scores else 0,
        "highest_score": max(scores) if scores else 0,
        "lowest_score": min(scores) if scores else 0,
        "tier_distribution": tier_counts,
        "required_skills_count": len(parsed_jd["required_skills"]),
        "preferred_skills_count": len(parsed_jd["preferred_skills"])
    }

    # 7. Persist Evaluation Run in SQLite DB
    try:
        run_id = f"eval_{uuid.uuid4().hex[:8]}"
        eval_record = EvaluationRun(
            id=run_id,
            job_id=f"job_{uuid.uuid4().hex[:6]}",
            job_title=parsed_jd.get("title", "Role"),
            timestamp=datetime.utcnow(),
            weights_json=json.dumps(weights),
            analytics_json=json.dumps(analytics),
            leaderboard_json=json.dumps(ranked_leaderboard)
        )
        db.add(eval_record)
        db.commit()
    except Exception as e:
        print("DB persist error:", e)

    return {
        "job_details": parsed_jd,
        "analytics": analytics,
        "leaderboard": ranked_leaderboard,
        "weights_applied": weights
    }


# Recruiter Pipeline & CRM Endpoints
@app.get("/api/pipeline")
def get_recruiter_pipeline(db: Session = Depends(get_db)):
    """Returns candidate pipeline organized by stage."""
    items = db.query(RecruiterPipelineItem).order_by(RecruiterPipelineItem.updated_at.desc()).all()
    
    stages = {
        "Reviewing": [],
        "Shortlisted": [],
        "Interviewing": [],
        "Offer": [],
        "Archived": []
    }
    
    for item in items:
        data = {
            "id": item.id,
            "candidate_id": item.candidate_id,
            "candidate_name": item.candidate_name,
            "candidate_email": item.candidate_email,
            "job_id": item.job_id,
            "job_title": item.job_title,
            "overall_match": item.overall_match,
            "tier": item.tier,
            "status": item.status,
            "notes": item.notes,
            "rating": item.rating,
            "updated_at": item.updated_at.strftime("%b %d, %Y")
        }
        if item.status in stages:
            stages[item.status].append(data)
        else:
            stages["Reviewing"].append(data)

    return stages


@app.post("/api/candidate-status")
def update_candidate_pipeline_status(req: UpdatePipelineStatusRequest, db: Session = Depends(get_db)):
    """Creates or updates candidate status in the recruiter pipeline CRM."""
    existing = db.query(RecruiterPipelineItem).filter(
        RecruiterPipelineItem.candidate_name == req.candidate_name,
        RecruiterPipelineItem.job_title == req.job_title
    ).first()

    if existing:
        existing.status = req.status
        if req.notes is not None:
            existing.notes = req.notes
        if req.rating is not None:
            existing.rating = req.rating
        existing.updated_at = datetime.utcnow()
    else:
        new_item = RecruiterPipelineItem(
            id=f"pipe_{uuid.uuid4().hex[:8]}",
            candidate_id=req.candidate_id,
            candidate_name=req.candidate_name,
            candidate_email=req.candidate_email,
            job_id=req.job_id,
            job_title=req.job_title,
            overall_match=req.overall_match,
            tier=req.tier,
            status=req.status,
            notes=req.notes or "",
            rating=req.rating or 3,
            updated_at=datetime.utcnow()
        )
        db.add(new_item)

    db.commit()
    return {"status": "success", "message": f"Updated {req.candidate_name} to {req.status}"}


@app.post("/api/match-resume-to-all-jobs")
async def match_resume_to_all_jobs(
    file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    use_sample_id: Optional[str] = Form(None),
    weights_json: Optional[str] = Form(None)
):
    """
    Evaluates a single candidate resume across all 35 pre-configured industry job positions.
    Ranks which roles the candidate is best suited for with detailed fit breakdowns.
    """
    weights = dict(DEFAULT_WEIGHTS)
    if weights_json:
        try:
            custom_w = json.loads(weights_json)
            weights.update(custom_w)
        except Exception:
            pass

    # 1. Parse the resume
    resume_data = None
    if file and file.filename:
        content = await file.read()
        resume_data = resume_parser.parse_file(file.filename, content)
        resume_data["skills"] = skill_extractor.extract_skills(resume_data["raw_text"])
    elif resume_text and resume_text.strip():
        raw = resume_text.strip()
        resume_data = {
            "filename": "Uploaded_Resume.txt",
            "raw_text": raw,
            "word_count": len(raw.split()),
            "contact": resume_parser.extract_contact_info(raw, "Uploaded_Resume.txt"),
            "experience": resume_parser.extract_experience(raw),
            "education": resume_parser.extract_education(raw),
            "certifications": resume_parser.extract_certifications(raw),
            "sections": resume_parser.segment_sections(raw),
            "skills": skill_extractor.extract_skills(raw)
        }
    elif use_sample_id:
        sample = next((c for c in PARSED_SAMPLE_RESUMES if c["id"] == use_sample_id), None)
        if sample:
            resume_data = sample
    
    if not resume_data:
        resume_data = PARSED_SAMPLE_RESUMES[0]

    # Extract candidate summary
    cand_name = resume_data.get("contact", {}).get("name") or "Candidate"
    cand_email = resume_data.get("contact", {}).get("email") or "Not specified"
    cand_phone = resume_data.get("contact", {}).get("phone") or "Not specified"
    cand_exp = resume_data.get("experience", {}).get("estimated_years", 0.0)
    cand_degree = resume_data.get("education", {}).get("highest_degree", "Bachelor")
    cand_skills = resume_data.get("skills", {}).get("skills", [])
    cand_categories = resume_data.get("skills", {}).get("categorized", {})
    
    ats_health = ats_analyzer.analyze(resume_data)

    # 2. Evaluate against all 35 jobs
    evaluated_jobs = []
    
    for job in SAMPLE_JOBS:
        parsed_jd = jd_parser.parse_job_description(job["description"], job["title"])
        match_result = scoring_engine.match_candidate(resume_data, parsed_jd, weights)
        
        overall_match = match_result.get("overall_match", 0)
        tier = match_result.get("tier", "Low Fit")
        score_breakdown = match_result.get("score_breakdown", {})
        skills_analysis = match_result.get("skills_analysis", {})
        salary_estimate = match_result.get("salary_estimate", {})
        explanation = match_result.get("explanation", {})
        interview_kit = match_result.get("interview_kit", {})

        evaluated_jobs.append({
            "job_id": job["id"],
            "title": job["title"],
            "category": job["category"],
            "department": job.get("department", "Engineering"),
            "salary_range": job.get("salary_range", "$120,000 - $160,000"),
            "required_experience": job.get("required_experience", 3.0),
            "required_education": job.get("required_education", "Bachelor"),
            "overall_match": overall_match,
            "tier": tier,
            "score_breakdown": score_breakdown,
            "skills_analysis": skills_analysis,
            "salary_estimate": salary_estimate,
            "key_strengths": explanation.get("key_strengths", []),
            "growth_areas": explanation.get("growth_areas", []),
            "summary": explanation.get("summary", ""),
            "interview_kit": interview_kit,
            "required_skills_count": len(parsed_jd.get("required_skills", [])),
            "matched_skills_count": len(skills_analysis.get("matched_required", []))
        })

    # 3. Sort by overall_match descending
    evaluated_jobs.sort(key=lambda j: j["overall_match"], reverse=True)
    
    # Assign ranks and badges
    for idx, job in enumerate(evaluated_jobs):
        job["rank"] = idx + 1
        if idx == 0:
            job["badge"] = "#1 Best Fit"
        elif idx == 1:
            job["badge"] = "#2 Strong Fit"
        elif idx == 2:
            job["badge"] = "#3 Strong Fit"
        else:
            job["badge"] = f"#{idx + 1}"

    # 4. Tier breakdown distribution
    tier_counts = {
        "Top Match": sum(1 for j in evaluated_jobs if j["tier"] == "Top Match"),
        "Strong Fit": sum(1 for j in evaluated_jobs if j["tier"] == "Strong Fit"),
        "Moderate Fit": sum(1 for j in evaluated_jobs if j["tier"] == "Moderate Fit"),
        "Low Relevance": sum(1 for j in evaluated_jobs if j["tier"] in ("Low Relevance", "Low Fit"))
    }

    best_job = evaluated_jobs[0] if evaluated_jobs else None

    return {
        "candidate_profile": {
            "name": cand_name,
            "email": cand_email,
            "phone": cand_phone,
            "estimated_years_experience": cand_exp,
            "highest_degree": cand_degree,
            "total_skills_detected": len(cand_skills),
            "top_skills": cand_skills[:16],
            "skills_by_category": cand_categories,
            "ats_score": ats_health.get("overall_ats_score", 85),
            "ats_rating": ats_health.get("rating", "Good")
        },
        "total_jobs_evaluated": len(evaluated_jobs),
        "best_match_job": {
            "title": best_job["title"] if best_job else "N/A",
            "category": best_job["category"] if best_job else "N/A",
            "department": best_job["department"] if best_job else "N/A",
            "overall_match": best_job["overall_match"] if best_job else 0,
            "tier": best_job["tier"] if best_job else "N/A",
            "salary_range": best_job["salary_range"] if best_job else "N/A",
            "matched_skills": best_job["skills_analysis"].get("matched_required", []) if best_job else [],
            "summary": best_job.get("summary", "") if best_job else ""
        },
        "tier_distribution": tier_counts,
        "ranked_jobs": evaluated_jobs
    }


@app.get("/api/download-sample/{filename}")
def download_sample_file(filename: str):
    """Allows downloading the physical sample PDF or DOCX file."""
    base_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sample_files")
    file_path = os.path.join(base_dir, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, filename=filename)
    raise HTTPException(status_code=404, detail="Sample file not found")

