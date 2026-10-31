"""
Pydantic Schemas for API Requests and Responses.
"""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

class WeightsConfig(BaseModel):
    skill_match: float = Field(0.50, ge=0.0, le=1.0)
    semantic_match: float = Field(0.20, ge=0.0, le=1.0)
    experience_match: float = Field(0.15, ge=0.0, le=1.0)
    education_match: float = Field(0.10, ge=0.0, le=1.0)
    certification_match: float = Field(0.05, ge=0.0, le=1.0)

class JobDescriptionRequest(BaseModel):
    title: Optional[str] = "Software Engineer"
    text: str

class SkillExtractionRequest(BaseModel):
    text: str

class MatchRequest(BaseModel):
    job_title: Optional[str] = "Software Engineer"
    job_description: str
    weights: Optional[WeightsConfig] = None
    resume_ids: Optional[List[str]] = None
