"""
ML Inference Engine for Role Probability Estimation, Confidence Scoring, and Model Management.
Loads pre-trained TF-IDF N-gram vectorizer and calibrated classifier to provide real-time ML predictions.
"""

import os
import json
import joblib
import numpy as np
from typing import Dict, List, Any, Optional

from app.ml.model_trainer import ModelTrainer, MODEL_FILE, VECTORIZER_FILE, METRICS_FILE
from app.data.sample_jobs import SAMPLE_JOBS

class MLJobClassifier:
    def __init__(self):
        self.classifier = None
        self.vectorizer = None
        self.metrics: Dict[str, Any] = {}
        self.job_title_to_category: Dict[str, str] = {
            j["title"]: j["category"] for j in SAMPLE_JOBS
        }
        self.load_or_train()

    def load_or_train(self) -> bool:
        """Loads trained model artifacts or triggers training if not present."""
        if os.path.exists(MODEL_FILE) and os.path.exists(VECTORIZER_FILE) and os.path.exists(METRICS_FILE):
            try:
                self.classifier = joblib.load(MODEL_FILE)
                self.vectorizer = joblib.load(VECTORIZER_FILE)
                with open(METRICS_FILE, "r") as f:
                    self.metrics = json.load(f)
                return True
            except Exception as e:
                print(f"Error loading ML model artifacts: {e}. Retraining...")

        # Train fresh model
        trainer = ModelTrainer()
        self.metrics = trainer.train_and_evaluate()
        self.classifier = trainer.classifier
        self.vectorizer = trainer.vectorizer
        return True

    def predict_role(self, text: str, top_k: int = 5) -> Dict[str, Any]:
        """
        Runs ML inference on arbitrary resume / bio text.
        Returns top-k predicted roles with calibrated confidence percentages.
        """
        if not text or not text.strip() or self.classifier is None or self.vectorizer is None:
            return {
                "top_predictions": [],
                "primary_role": "N/A",
                "primary_category": "N/A",
                "confidence_score": 0.0,
                "domain_distribution": {}
            }

        try:
            vec = self.vectorizer.transform([text])
            probabilities = self.classifier.predict_proba(vec)[0]
            classes = self.classifier.classes_

            # Sort classes by descending probability
            sorted_indices = np.argsort(probabilities)[::-1]

            top_predictions = []
            domain_probs: Dict[str, float] = {}

            for idx in sorted_indices[:top_k]:
                role_name = classes[idx]
                prob = float(probabilities[idx])
                percentage = round(prob * 100.0, 1)
                category = self.job_title_to_category.get(role_name, "General Engineering")
                
                top_predictions.append({
                    "role": role_name,
                    "category": category,
                    "probability": round(prob, 4),
                    "confidence_percentage": percentage
                })

            # Aggregate domain-level probabilities across all classes
            for idx, prob in enumerate(probabilities):
                role_name = classes[idx]
                cat = self.job_title_to_category.get(role_name, "Other")
                domain_probs[cat] = domain_probs.get(cat, 0.0) + float(prob)

            sorted_domains = [
                {"domain": d, "percentage": round(p * 100.0, 1)}
                for d, p in sorted(domain_probs.items(), key=lambda x: x[1], reverse=True)
                if p > 0.01
            ]

            primary = top_predictions[0] if top_predictions else None

            return {
                "top_predictions": top_predictions,
                "primary_role": primary["role"] if primary else "N/A",
                "primary_category": primary["category"] if primary else "N/A",
                "confidence_score": primary["confidence_percentage"] if primary else 0.0,
                "domain_distribution": sorted_domains
            }
        except Exception as e:
            print("ML inference error:", e)
            return {
                "top_predictions": [],
                "primary_role": "N/A",
                "primary_category": "N/A",
                "confidence_score": 0.0,
                "error": str(e)
            }

    def get_role_probability(self, text: str, target_role_title: str) -> float:
        """
        Returns the specific calibrated class probability for a target job role (0.0 to 100.0).
        Used by the composite scoring engine for ML-grounded ranking.
        """
        if not text or not text.strip() or self.classifier is None or self.vectorizer is None:
            return 50.0

        try:
            vec = self.vectorizer.transform([text])
            probabilities = self.classifier.predict_proba(vec)[0]
            classes = list(self.classifier.classes_)

            if target_role_title in classes:
                idx = classes.index(target_role_title)
                raw_p = float(probabilities[idx])
                # Scale probability: for 35 classes, uniform random is 1/35 = 2.8%.
                # A probability of 0.15+ is strong, 0.35+ is dominant.
                # Use soft curve mapping:
                ml_score = float(np.clip((raw_p ** 0.5) * 100.0 * 1.3, 5.0, 98.0))
                return round(ml_score, 1)

            # Check partial match on title keywords if exact string differed slightly
            target_lower = target_role_title.lower()
            for idx, c in enumerate(classes):
                if c.lower() in target_lower or target_lower in c.lower():
                    raw_p = float(probabilities[idx])
                    ml_score = float(np.clip((raw_p ** 0.5) * 100.0 * 1.3, 5.0, 98.0))
                    return round(ml_score, 1)

            return 40.0
        except Exception:
            return 50.0

    def get_model_info(self) -> Dict[str, Any]:
        """Returns the current model metrics and architecture summary."""
        return self.metrics

    def retrain(self) -> Dict[str, Any]:
        """Triggers dynamic re-training, updates disk models, and refreshes in-memory instances."""
        trainer = ModelTrainer()
        self.metrics = trainer.train_and_evaluate()
        self.classifier = trainer.classifier
        self.vectorizer = trainer.vectorizer
        return self.metrics
