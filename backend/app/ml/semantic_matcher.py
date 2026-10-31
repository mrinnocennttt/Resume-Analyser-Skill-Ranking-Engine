"""
Semantic Matching Engine using TF-IDF N-grams, Sublinear Frequency Scaling, and Calibrated Cosine Similarity.
"""

import re
import numpy as np
from typing import Dict, List, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class SemanticMatcher:
    def __init__(self):
        self.stop_words = {
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
            "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
            "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't",
            "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
            "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
            "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's",
            "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll",
            "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself",
            "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not",
            "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
            "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll",
            "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's",
            "the", "their", "theirs", "them", "themselves", "then", "there", "there's",
            "these", "they", "they'd", "they'll", "they're", "they've", "this", "those",
            "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we",
            "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when",
            "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why",
            "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're",
            "you've", "your", "yours", "yourself", "yourselves"
        }

    def _preprocess_text(self, text: str) -> str:
        """Cleans and standardizes text for NLP analysis."""
        if not text:
            return ""
        text = text.lower()
        # Keep letters, numbers, common symbols (+, #, -, .)
        text = re.sub(r'[^a-z0-9+#\-\.\s]', ' ', text)
        tokens = [w for w in text.split() if w not in self.stop_words and len(w) > 1]
        return " ".join(tokens)

    def calculate_semantic_similarity(self, job_text: str, resume_text: str) -> Dict[str, any]:
        """
        Computes multi-level semantic similarity:
        1. Unigram + Bigram TF-IDF Cosine Similarity
        2. Important overlapping keyword concepts
        3. Calibrated normalized semantic match score (0 - 100)
        """
        cleaned_jd = self._preprocess_text(job_text)
        cleaned_resume = self._preprocess_text(resume_text)

        if not cleaned_jd or not cleaned_resume:
            return {
                "semantic_score": 0.0,
                "raw_cosine": 0.0,
                "top_overlapping_terms": []
            }

        # Vectorize with sublinear TF and n-grams
        vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
            max_features=1500
        )

        try:
            tfidf_matrix = vectorizer.fit_transform([cleaned_jd, cleaned_resume])
            cos_sim = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])
            
            # Calibrated scaling for document-level TF-IDF overlap:
            # cos_sim 0.05 -> ~24%, 0.15 -> ~56%, 0.25 -> ~75%, 0.35 -> ~85%, 0.45 -> ~92%
            scaled_score = float(np.clip(100.0 * (1.0 - np.exp(-5.5 * cos_sim)), 0.0, 100.0))

            # Extract top matching terms by TF-IDF product
            feature_names = vectorizer.get_feature_names_out()
            jd_vec = tfidf_matrix[0].toarray()[0]
            resume_vec = tfidf_matrix[1].toarray()[0]
            
            overlap_weights = jd_vec * resume_vec
            top_indices = np.argsort(overlap_weights)[::-1]
            
            top_terms = []
            for idx in top_indices:
                if overlap_weights[idx] > 0 and len(top_terms) < 8:
                    term = feature_names[idx]
                    if len(term) > 2 and term not in top_terms:
                        top_terms.append(term)

            return {
                "semantic_score": round(scaled_score, 1),
                "raw_cosine": round(float(cos_sim), 4),
                "top_overlapping_terms": top_terms
            }
        except Exception as e:
            return {
                "semantic_score": 0.0,
                "raw_cosine": 0.0,
                "top_overlapping_terms": [],
                "error": str(e)
            }
