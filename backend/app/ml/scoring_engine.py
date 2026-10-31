"""
Explainable Multi-Factor Scoring & Ranking Engine with Recency Weighting,
AI Interview Kit Generation, Market Compensation Benchmarks, and Trained ML Classifier Integration.
"""

from typing import Dict, List, Any, Optional
import numpy as np
from app.ml.skill_extractor import SkillExtractor
from app.ml.semantic_matcher import SemanticMatcher
from app.ml.ats_analyzer import ATSAnalyzer
from app.ml.interview_generator import AIInterviewAndSalaryEngine
from app.ml.ml_classifier import MLJobClassifier

DEFAULT_WEIGHTS = {
    "skill_match": 0.50,
    "semantic_match": 0.20,
    "experience_match": 0.15,
    "education_match": 0.10,
    "certification_match": 0.05
}

class ScoringEngine:
    def __init__(
        self,
        skill_extractor: SkillExtractor,
        semantic_matcher: SemanticMatcher,
        ats_analyzer: ATSAnalyzer,
        ml_classifier: Optional[MLJobClassifier] = None
    ):
        self.skill_extractor = skill_extractor
        self.semantic_matcher = semantic_matcher
        self.ats_analyzer = ats_analyzer
        self.ml_classifier = ml_classifier or MLJobClassifier()
        self.ai_engine = AIInterviewAndSalaryEngine()

    def match_candidate(self, resume_data: Dict[str, Any], jd_data: Dict[str, Any], weights: Dict[str, float] = None) -> Dict[str, Any]:
        """
        Evaluates candidate resume against job description and produces an explainable match scorecard.
        """
        if not weights:
            weights = DEFAULT_WEIGHTS

        # Normalize weights so they sum to 1.0
        total_w = sum(weights.values()) or 1.0
        normalized_weights = {k: v / total_w for k, v in weights.items()}

        candidate_skills = set(resume_data.get("skills", {}).get("skills", []))
        required_skills = set(jd_data.get("required_skills", []))
        preferred_skills = set(jd_data.get("preferred_skills", []))

        # Check section-level skill depth (Experience vs Summary)
        exp_text = resume_data.get("sections", {}).get("Experience", "")
        exp_skills = set(self.skill_extractor.extract_skills(exp_text)["skills"]) if exp_text else candidate_skills

        # 1. Skill Match Calculation
        matched_required = sorted(list(candidate_skills.intersection(required_skills)))
        missing_required = sorted(list(required_skills - candidate_skills))
        
        matched_preferred = sorted(list(candidate_skills.intersection(preferred_skills)))
        missing_preferred = sorted(list(preferred_skills - candidate_skills))

        # Additional candidate skills not strictly in JD
        all_jd_skills = required_skills.union(preferred_skills)
        bonus_skills = sorted(list(candidate_skills - all_jd_skills))

        # Check related skills for partial credit
        related_matches = []
        for missing in list(missing_required):
            cand_related = self.skill_extractor.get_related_skills(list(candidate_skills))
            if missing in cand_related:
                related_matches.append(missing)

        req_count = len(required_skills) if len(required_skills) > 0 else 1
        pref_count = len(preferred_skills) if len(preferred_skills) > 0 else 1

        # Skill score computation:
        if len(matched_required) == 0:
            if len(related_matches) > 0:
                raw_skill_score = min(20.0, len(related_matches) * 5.0)
            else:
                raw_skill_score = 5.0
        else:
            # Saturation scaling for required skills
            req_ratio = len(matched_required) / req_count
            scaled_req_score = min(1.0, (req_ratio ** 0.75) * 1.1)
            
            # Bonus if required skills were demonstrated in practical work experience
            exp_demonstrated_bonus = min(0.08, (len(exp_skills.intersection(required_skills)) / req_count) * 0.08)
            # Partial credit for related technologies
            partial_related_credit = min(0.10, (len(related_matches) * 0.03))
            # Bonus for preferred skills
            pref_bonus = min(0.12, (len(matched_preferred) / pref_count) * 0.12) if preferred_skills else 0.04
            
            raw_skill_score = min(1.0, scaled_req_score * 0.80 + exp_demonstrated_bonus + partial_related_credit + pref_bonus) * 100.0

        skill_score = round(float(raw_skill_score), 1)

        # 2. Semantic & ML Role Match Calculation
        raw_resume_text = resume_data.get("raw_text", "")
        semantic_result = self.semantic_matcher.calculate_semantic_similarity(
            jd_data.get("raw_text", ""),
            raw_resume_text
        )
        raw_semantic = semantic_result.get("semantic_score", 40.0)

        # ML Classifier Role Probability
        target_role_title = jd_data.get("title", "")
        ml_role_prob = self.ml_classifier.get_role_probability(raw_resume_text, target_role_title)

        # Ensemble semantic & ML confidence: 60% TF-IDF Cosine + 40% ML Classifier
        ensemble_semantic_score = round(raw_semantic * 0.60 + ml_role_prob * 0.40, 1)

        # 3. Experience Match Calculation
        cand_exp = resume_data.get("experience", {}).get("estimated_years", 1.0)
        req_min_exp = jd_data.get("required_experience_years", 2.0)
        
        if req_min_exp <= 0:
            exp_score = 100.0
        elif cand_exp >= req_min_exp:
            exp_score = min(100.0, 95.0 + min(5.0, (cand_exp - req_min_exp) * 2))
        else:
            exp_score = max(30.0, (cand_exp / req_min_exp) * 90.0)
        exp_score = round(float(exp_score), 1)

        # 4. Education Match Calculation
        cand_edu_rank = resume_data.get("education", {}).get("degree_rank", 2)
        req_edu_rank = jd_data.get("required_education_rank", 2)

        if cand_edu_rank >= req_edu_rank:
            edu_score = 100.0
        elif cand_edu_rank == req_edu_rank - 1:
            edu_score = 80.0
        else:
            edu_score = 65.0
        edu_score = round(float(edu_score), 1)

        # 5. Certification Match Calculation
        cand_certs = resume_data.get("certifications", [])
        if len(cand_certs) >= 2:
            cert_score = 95.0
        elif len(cand_certs) == 1:
            cert_score = 85.0
        elif skill_score >= 80:
            cert_score = 75.0
        else:
            cert_score = 60.0
        cert_score = round(float(cert_score), 1)

        # Overall Composite Score
        overall_score = (
            skill_score * normalized_weights.get("skill_match", 0.50) +
            ensemble_semantic_score * normalized_weights.get("semantic_match", 0.20) +
            exp_score * normalized_weights.get("experience_match", 0.15) +
            edu_score * normalized_weights.get("education_match", 0.10) +
            cert_score * normalized_weights.get("certification_match", 0.05)
        )
        overall_score = round(float(overall_score), 1)

        # ATS Analysis
        ats_result = self.ats_analyzer.analyze(resume_data)

        # Generate Explainable Summary & Strengths
        explanation = self._generate_explanation(
            name=resume_data.get("contact", {}).get("name", "Candidate"),
            overall_score=overall_score,
            matched_skills=matched_required,
            missing_skills=missing_required,
            bonus_skills=bonus_skills,
            cand_exp=cand_exp,
            req_exp=req_min_exp,
            cand_degree=resume_data.get("education", {}).get("highest_degree", "Bachelor"),
            req_degree=jd_data.get("required_education", "Bachelor")
        )

        # Build candidate base object for AI generators
        candidate_eval = {
            "candidate_name": resume_data.get("contact", {}).get("name", "Candidate"),
            "filename": resume_data.get("filename", ""),
            "contact": resume_data.get("contact", {}),
            "overall_match": overall_score,
            "tier": self._get_tier(overall_score),
            "score_breakdown": {
                "skill_match": skill_score,
                "semantic_match": ensemble_semantic_score,
                "raw_tfidf_similarity": raw_semantic,
                "ml_classifier_confidence": ml_role_prob,
                "experience_match": exp_score,
                "education_match": edu_score,
                "certification_match": cert_score
            },
            "weights_used": normalized_weights,
            "skills_analysis": {
                "matched_required": matched_required,
                "missing_required": missing_required,
                "matched_preferred": matched_preferred,
                "missing_preferred": missing_preferred,
                "bonus_skills": bonus_skills[:10],
                "related_matches": related_matches,
                "total_candidate_skills": len(candidate_skills),
                "experience_verified_skills": list(exp_skills.intersection(required_skills))
            },
            "experience_analysis": {
                "candidate_years": cand_exp,
                "required_years": req_min_exp,
                "status": "Qualified" if cand_exp >= req_min_exp else "Under Requirement"
            },
            "education_analysis": {
                "candidate_degree": resume_data.get("education", {}).get("highest_degree", "Not Specified"),
                "required_degree": jd_data.get("required_education", "Bachelor"),
                "fields_of_study": resume_data.get("education", {}).get("fields_of_study", [])
            },
            "certifications": cand_certs,
            "semantic_details": {
                "top_terms": semantic_result.get("top_overlapping_terms", []),
                "raw_cosine": semantic_result.get("raw_cosine", 0.0),
                "ml_model_confidence": ml_role_prob
            },
            "ats_compatibility": ats_result,
            "explanation": explanation
        }

        # Generate AI Interview Kit & Market Salary Benchmarks
        candidate_eval["interview_kit"] = self.ai_engine.generate_interview_kit(candidate_eval, jd_data)
        candidate_eval["salary_estimate"] = self.ai_engine.estimate_market_salary(candidate_eval, jd_data)
        candidate_eval["learning_roadmap"] = self.ai_engine.generate_learning_roadmap(missing_required)

        return candidate_eval

    def rank_candidates(self, candidate_evals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Sorts candidate evaluations and assigns ranking positions."""
        sorted_candidates = sorted(candidate_evals, key=lambda c: c["overall_match"], reverse=True)
        for idx, candidate in enumerate(sorted_candidates):
            candidate["rank"] = idx + 1
        return sorted_candidates

    def _get_tier(self, score: float) -> str:
        if score >= 85:
            return "Top Match"
        elif score >= 70:
            return "Strong Fit"
        elif score >= 50:
            return "Moderate Fit"
        else:
            return "Low Relevance"

    def _generate_explanation(self, name: str, overall_score: float, matched_skills: List[str],
                              missing_skills: List[str], bonus_skills: List[str],
                              cand_exp: float, req_exp: float,
                              cand_degree: str, req_degree: str) -> Dict[str, Any]:
        """Creates actionable recruiter narrative & bullet points."""
        strengths = []
        growth_areas = []

        if matched_skills:
            strengths.append(f"Strong match on core skills: {', '.join(matched_skills[:6])}.")
        if bonus_skills:
            strengths.append(f"Brings valuable extra domain capabilities: {', '.join(bonus_skills[:4])}.")
        if cand_exp >= req_exp:
            strengths.append(f"Meets or exceeds required experience level ({cand_exp:.1f} yrs vs {req_exp:.1f} yrs required).")
        else:
            growth_areas.append(f"Candidate has {cand_exp:.1f} years experience, below the {req_exp:.1f} years target.")

        if missing_skills:
            growth_areas.append(f"Lacks specific required tools: {', '.join(missing_skills[:5])}.")

        if overall_score >= 85:
            summary = f"{name} is an exceptional fit for this role with strong skill alignment and relevant domain background."
        elif overall_score >= 70:
            summary = f"{name} is a strong candidate with most required technical capabilities and relevant experience."
        elif overall_score >= 50:
            summary = f"{name} demonstrates transferable skills but may require onboarding in specific key technologies."
        else:
            summary = f"{name} has limited overlap with the primary requirements for this position."

        return {
            "summary": summary,
            "key_strengths": strengths,
            "growth_areas": growth_areas
        }
