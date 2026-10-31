"""
Job Description Parser
Extracts job title, required skills, preferred skills, minimum/maximum experience, education level, and domain keywords.
"""

import re
from typing import Dict, List, Any
from app.ml.skill_extractor import SkillExtractor
from app.ml.skills_taxonomy import EDUCATION_DEGREES

class JobDescriptionParser:
    def __init__(self, skill_extractor: SkillExtractor):
        self.skill_extractor = skill_extractor

    def parse_job_description(self, raw_text: str, custom_title: str = None) -> Dict[str, Any]:
        """Parses a job description text into structured requirements."""
        if not raw_text:
            raw_text = ""

        # 1. Skill Extraction
        extracted = self.skill_extractor.extract_skills(raw_text)
        all_skills = extracted["skills"]

        # 2. Segregate Required vs Preferred skills based on section clues
        required_skills = []
        preferred_skills = []

        lines = raw_text.split("\n")
        mode = "required" # default

        for line in lines:
            line_l = line.lower()
            if any(k in line_l for k in ["preferred", "nice to have", "plus", "bonus", "good to have", "desired"]):
                mode = "preferred"
            elif any(k in line_l for k in ["must have", "required", "requirements", "qualifications", "minimum qualifications", "key skills"]):
                mode = "required"

            line_skills = self.skill_extractor.extract_skills(line)["skills"]
            for s in line_skills:
                if mode == "preferred":
                    if s not in preferred_skills and s not in required_skills:
                        preferred_skills.append(s)
                else:
                    if s not in required_skills:
                        required_skills.append(s)

        # If all fell into one bucket or segregation wasn't distinct, use all as required
        if not required_skills and all_skills:
            required_skills = all_skills
        elif not preferred_skills and len(required_skills) > 4:
            # Leave top 70% as required, bottom 30% as preferred
            split_idx = int(len(required_skills) * 0.75)
            preferred_skills = required_skills[split_idx:]
            required_skills = required_skills[:split_idx]

        # 3. Experience requirements extraction
        exp_req = self._extract_required_experience(raw_text)

        # 4. Education requirements extraction
        edu_req = self._extract_required_education(raw_text)

        # 5. Role Title detection
        title = custom_title or self._guess_job_title(raw_text)

        return {
            "title": title,
            "raw_text": raw_text,
            "all_skills": all_skills,
            "required_skills": required_skills,
            "preferred_skills": preferred_skills,
            "categorized_skills": extracted["categorized"],
            "required_experience_years": exp_req["min_years"],
            "max_experience_years": exp_req["max_years"],
            "required_education": edu_req["required_degree"],
            "required_education_rank": edu_req["degree_rank"],
            "domain_distribution": extracted["domain_distribution"]
        }

    def _extract_required_experience(self, text: str) -> Dict[str, float]:
        """Extracts required experience numbers like '3+ years', '5-8 years', 'minimum 4 years'."""
        min_years = 2.0  # default reasonable baseline
        max_years = 10.0

        # Pattern: "X to Y years" or "X-Y years"
        range_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)', text, re.IGNORECASE)
        if range_match:
            try:
                min_years = float(range_match.group(1))
                max_years = float(range_match.group(2))
                return {"min_years": min_years, "max_years": max_years}
            except ValueError:
                pass

        # Pattern: "X+ years", "minimum X years", "at least X years"
        single_match = re.search(r'(?:minimum|at least|req(?:uiring|uires|uired)?\s+)?(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s+of)?\s*(?:experience|exp)?', text, re.IGNORECASE)
        if single_match:
            try:
                val = float(single_match.group(1))
                if 0.5 <= val <= 25:
                    min_years = val
                    max_years = min_years + 3.0
            except ValueError:
                pass

        return {"min_years": min_years, "max_years": max_years}

    def _extract_required_education(self, text: str) -> Dict[str, Any]:
        """Extracts required degree level."""
        lower_text = text.lower()
        rank_map = {"Doctorate": 4, "Master": 3, "Bachelor": 2, "Diploma": 1}
        highest_required = "Bachelor"
        degree_rank = 2

        for level, keywords in EDUCATION_DEGREES.items():
            for kw in keywords:
                if re.search(rf'\b{re.escape(kw)}\b', lower_text):
                    if rank_map[level] > degree_rank:
                        degree_rank = rank_map[level]
                        highest_required = level
                    break

        return {
            "required_degree": highest_required,
            "degree_rank": degree_rank
        }

    def _guess_job_title(self, text: str) -> str:
        """Guesses job title from first 3 lines."""
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        for line in lines[:3]:
            if len(line) < 60 and any(role in line.lower() for role in ["engineer", "developer", "scientist", "architect", "lead", "manager", "analyst", "specialist"]):
                return line.replace("#", "").strip()
        return "Software / ML Role"
