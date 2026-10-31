"""
SQLite Database & SQLAlchemy ORM Layer for Persistent Jobs, Candidates, Evaluations, and Recruiter Pipeline.
"""

import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "app.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class JobPosting(Base):
    __tablename__ = "job_postings"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, default="Company")
    location = Column(String, default="Remote")
    source_url = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    required_skills = Column(Text, default="[]") # JSON string
    preferred_skills = Column(Text, default="[]") # JSON string
    required_experience = Column(Float, default=2.0)
    required_education = Column(String, default="Bachelor")
    created_at = Column(DateTime, default=datetime.utcnow)


class EvaluationRun(Base):
    __tablename__ = "evaluation_runs"

    id = Column(String, primary_key=True, index=True)
    job_id = Column(String, nullable=False)
    job_title = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    weights_json = Column(Text, default="{}")
    analytics_json = Column(Text, default="{}")
    leaderboard_json = Column(Text, default="[]")


class RecruiterPipelineItem(Base):
    __tablename__ = "recruiter_pipeline"

    id = Column(String, primary_key=True, index=True)
    candidate_id = Column(String, nullable=False)
    candidate_name = Column(String, nullable=False)
    candidate_email = Column(String, default="")
    job_id = Column(String, nullable=False)
    job_title = Column(String, nullable=False)
    overall_match = Column(Float, default=0.0)
    tier = Column(String, default="Moderate Fit")
    status = Column(String, default="Reviewing") # "Reviewing", "Shortlisted", "Interviewing", "Offer", "Archived"
    notes = Column(Text, default="")
    rating = Column(Integer, default=3) # 1 to 5 stars
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
