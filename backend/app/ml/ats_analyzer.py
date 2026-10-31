"""
ATS (Applicant Tracking System) Compatibility & Resume Quality Analyzer.
Evaluates resume structure, action verbs, quantified metrics, contact completeness, and readability.
"""

import re
from typing import Dict, List, Any

ACTION_VERBS = [
    "built", "developed", "architected", "engineered", "implemented", "designed",
    "scaled", "optimized", "accelerated", "reduced", "increased", "maximized",
    "automated", "deployed", "orchestrated", "migrated", "refactored", "integrated",
    "spearheaded", "mentored", "managed", "collaborated", "analyzed", "forecasted",
    "delivered", "launched", "executed", "configured", "maintained", "trained"
]

class ATSAnalyzer:
    def __init__(self):
        pass

    def analyze(self, resume_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculates ATS readability score and suggestions."""
        raw_text = resume_data.get("raw_text", "")
        contact = resume_data.get("contact", {})
        sections = resume_data.get("sections", {})
        word_count = resume_data.get("word_count", len(raw_text.split()))

        score_components = {}
        tips = []
        strengths = []

        # 1. Contact Information Score (Max 20 pts)
        contact_score = 0
        if contact.get("name") and contact.get("name") != "Candidate":
            contact_score += 5
        else:
            tips.append("Include full candidate name prominently at top.")

        if contact.get("email") and contact.get("email") != "Not specified":
            contact_score += 5
        else:
            tips.append("Valid professional email address is missing.")

        if contact.get("phone") and contact.get("phone") != "Not specified":
            contact_score += 5
        else:
            tips.append("Contact phone number is missing.")

        if contact.get("linkedin") or contact.get("github"):
            contact_score += 5
            strengths.append("Contains professional profile links (LinkedIn / GitHub).")
        else:
            tips.append("Add a LinkedIn or GitHub profile link for recruiter visibility.")

        score_components["contact_info"] = contact_score

        # 2. Section Structure Score (Max 25 pts)
        section_score = 0
        present_sections = [s for s, txt in sections.items() if len(txt.strip()) > 20]
        
        if "Experience" in present_sections:
            section_score += 10
            strengths.append("Clearly delineated Work Experience section.")
        else:
            tips.append("Missing standard 'Experience' or 'Work History' heading.")

        if "Skills" in present_sections:
            section_score += 8
            strengths.append("Dedicated Skills section present.")
        else:
            tips.append("Add a dedicated 'Skills' section for ATS keyword parsers.")

        if "Education" in present_sections:
            section_score += 7
        else:
            tips.append("Clear 'Education' section heading recommended.")

        score_components["structure"] = min(25, section_score)

        # 3. Action Verbs & Power Words (Max 20 pts)
        lower_text = raw_text.lower()
        found_verbs = [verb for verb in ACTION_VERBS if re.search(rf'\b{verb}\b', lower_text)]
        verb_count = len(found_verbs)

        if verb_count >= 6:
            verb_score = 20
            strengths.append(f"Strong action-driven language ({verb_count} distinct power verbs used).")
        elif verb_count >= 3:
            verb_score = 14
        else:
            verb_score = 8
            tips.append("Use more impactful action verbs (e.g., 'Engineered', 'Optimized', 'Automated').")

        score_components["action_verbs"] = verb_score

        # 4. Quantifiable Impact & Metrics (Max 20 pts)
        metric_matches = re.findall(r'(\d+(?:\.\d+)?%|\$\d+(?:,\d+)*(?:\.\d+)?|\b\d+x\b|\b\d+\+\s*users\b|\b\d+\s*k\b|\b\d+\s*m\b|\breduced\s+by\s+\d+|\bincreased\s+by\s+\d+)', lower_text)
        metric_count = len(metric_matches)

        if metric_count >= 4:
            metric_score = 20
            strengths.append(f"High metric density ({metric_count} measurable achievements/stats detected).")
        elif metric_count >= 1:
            metric_score = 12
        else:
            metric_score = 5
            tips.append("Add quantified metrics (e.g., 'improved latency by 35%', 'managed $500k budget').")

        score_components["quantifiable_metrics"] = metric_score

        # 5. Length & Formatting Score (Max 15 pts)
        length_score = 15
        if word_count < 150:
            length_score = 5
            tips.append("Resume is too brief (<150 words); expand on project scope and responsibilities.")
        elif word_count > 1200:
            length_score = 10
            tips.append("Resume is extensive (>1200 words); consider trimming to 1-2 pages.")
        else:
            strengths.append(f"Optimal resume word count ({word_count} words).")

        score_components["length_formatting"] = length_score

        total_ats_score = sum(score_components.values())

        # Determine rating tier
        if total_ats_score >= 85:
            rating = "Excellent (ATS Optimized)"
        elif total_ats_score >= 70:
            rating = "Good (Minor Improvements)"
        elif total_ats_score >= 50:
            rating = "Average (Needs Refinement)"
        else:
            rating = "Poor (Significant formatting issues)"

        return {
            "overall_ats_score": total_ats_score,
            "rating": rating,
            "components": score_components,
            "power_verbs_found": found_verbs[:8],
            "metrics_detected_count": metric_count,
            "strengths": strengths,
            "improvement_tips": tips
        }
