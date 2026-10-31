"""
Skill Extraction Engine using Regex Patterns, Multi-Word N-Grams, and Canonical Taxonomy Mapping.
"""

import re
from typing import Dict, List, Set, Tuple
from app.ml.skills_taxonomy import SKILL_CATEGORIES, SKILL_ALIASES, RELATED_SKILLS

class SkillExtractor:
    def __init__(self):
        # Build a flat lookup map for quick, normalized matching
        self.canonical_skills: Dict[str, str] = {} # normalized_name -> canonical_name
        self.skill_to_category: Dict[str, str] = {}

        for category, skills in SKILL_CATEGORIES.items():
            for skill in skills:
                normalized = self._normalize_term(skill)
                self.canonical_skills[normalized] = skill
                self.skill_to_category[skill] = category

        for alias, canonical in SKILL_ALIASES.items():
            norm_alias = self._normalize_term(alias)
            self.canonical_skills[norm_alias] = canonical
            if canonical in self.skill_to_category:
                self.skill_to_category[canonical] = self.skill_to_category[canonical]

        # Sort skill keys by length descending to match longest phrases first (e.g., "React Native" before "React")
        self.sorted_skill_terms = sorted(self.canonical_skills.keys(), key=lambda x: len(x), reverse=True)

    def _normalize_term(self, text: str) -> str:
        """Normalizes text while preserving special programming terms like c++, c#, .net, ci/cd"""
        text = text.lower().strip()
        return text

    def extract_skills(self, text: str) -> Dict[str, any]:
        """
        Extracts matched skills, categorized skills, confidence, and context mentions.
        """
        if not text:
            return {
                "skills": [],
                "categorized": {},
                "count": 0,
                "domain_distribution": {}
            }

        cleaned_text = " " + text.lower() + " "
        # Replace non-alphanumeric except specific programming characters (+, #, ., /, -)
        cleaned_text = re.sub(r'[,;:|()\[\]{}"\n\r\t]', ' ', cleaned_text)
        
        found_canonical_skills: Set[str] = set()
        skill_occurrences: Dict[str, int] = {}

        # 1. Exact & Multi-word phrase matching with word boundaries
        for term in self.sorted_skill_terms:
            canonical = self.canonical_skills[term]
            
            # Escape regex special characters
            escaped_term = re.escape(term)
            
            # Word boundary logic aware of +, #, etc.
            pattern = rf'(?<![a-zA-Z0-9_]){escaped_term}(?![a-zA-Z0-9_])'
            
            matches = list(re.finditer(pattern, cleaned_text))
            if matches:
                found_canonical_skills.add(canonical)
                skill_occurrences[canonical] = skill_occurrences.get(canonical, 0) + len(matches)

        # 2. Organize by category
        categorized: Dict[str, List[str]] = {}
        domain_counts: Dict[str, int] = {}
        
        for skill in sorted(found_canonical_skills):
            category = self.skill_to_category.get(skill, "Other")
            if category not in categorized:
                categorized[category] = []
            categorized[category].append(skill)
            domain_counts[category] = domain_counts.get(category, 0) + 1

        return {
            "skills": sorted(list(found_canonical_skills)),
            "categorized": categorized,
            "count": len(found_canonical_skills),
            "occurrences": skill_occurrences,
            "domain_distribution": domain_counts
        }

    def get_related_skills(self, skill_list: List[str]) -> List[str]:
        """Returns inferred related skills based on present skills."""
        suggested = set()
        for skill in skill_list:
            if skill in RELATED_SKILLS:
                for rel in RELATED_SKILLS[skill]:
                    if rel not in skill_list:
                        suggested.add(rel)
        return sorted(list(suggested))
