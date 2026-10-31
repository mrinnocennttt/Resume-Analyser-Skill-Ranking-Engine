"""
AI-Powered Interview Question Generator, Market Salary Estimator, and Skill Gap Roadmap.
"""

from typing import Dict, List, Any

# Skill question bank for deep-dive technical probing
TECHNICAL_PROMPTS = {
    "Python": "How do you optimize CPU-bound vs IO-bound tasks in Python (multiprocessing, asyncio, GIL implications)?",
    "FastAPI": "How do you structure dependency injection, asynchronous request handlers, and background tasks in FastAPI for high-concurrency workloads?",
    "PyTorch": "Explain how you handle gradient accumulation, mixed-precision training with torch.cuda.amp, and custom loss functions in PyTorch.",
    "TensorFlow": "How do you optimize TensorFlow graphs for production serving with TensorFlow Serving or TensorRT?",
    "scikit-learn": "How do you prevent data leakage in scikit-learn cross-validation pipelines and handle high-cardinality categorical features?",
    "Natural Language Processing": "Compare TF-IDF vectorization with dense Sentence Transformers for semantic search. What are the latency and accuracy tradeoffs?",
    "Large Language Models": "How do you design a robust Retrieval-Augmented Generation (RAG) system with chunking, re-ranking, and hallucination safeguards?",
    "React": "How do you manage complex server state vs client state in React 19, and when would you use useMemo/useCallback vs architectural restructuring?",
    "TypeScript": "Explain conditional types, template literal types, and how you enforce strict discriminated unions in large TypeScript codebases.",
    "Node.js": "How does the Node.js event loop handle phases (timers, I/O callbacks, close callbacks), and how do you profile memory leaks?",
    "Docker": "How do you construct secure, multi-stage Docker builds with non-root users and minimal image layer footprint?",
    "Kubernetes": "Describe how you configure Horizontal Pod Autoscaling (HPA), readiness/liveness probes, and zero-downtime rolling updates in Kubernetes.",
    "PostgreSQL": "How do you diagnose slow queries in PostgreSQL using EXPLAIN ANALYZE, and how do composite indexes affect query planner execution?",
    "Redis": "What strategies do you use for cache invalidation, cache stampede prevention, and Redis clustering in distributed systems?",
    "AWS": "How do you architect high-availability, multi-AZ systems on AWS using VPC, IAM least privilege, and auto-scaling groups?",
    "CI/CD": "How do you design automated canary deployments and rollback strategies within GitHub Actions or GitLab CI?"
}

SKILL_LEARNING_RESOURCES = {
    "Kubernetes": {
        "duration": "2 - 3 Weeks",
        "resource": "Official Kubernetes Documentation & CKA Exam Prep",
        "focus": "Pods, Deployments, Services, Ingress, and Helm Chart orchestration."
    },
    "AWS": {
        "duration": "3 - 4 Weeks",
        "resource": "AWS Certified Solutions Architect Associate Path",
        "focus": "IAM, S3, EC2, ECS, VPC networking, and CloudWatch."
    },
    "Docker": {
        "duration": "1 Week",
        "resource": "Docker Mastery: Containerization & Compose Guide",
        "focus": "Multi-stage builds, volume management, networking, and Docker Compose."
    },
    "FastAPI": {
        "duration": "1 Week",
        "resource": "FastAPI Official Interactive Tutorial & Pydantic v2",
        "focus": "Pydantic models, async endpoints, OAuth2 JWT auth, and background tasks."
    },
    "PyTorch": {
        "duration": "3 Weeks",
        "resource": "DeepLearning.AI PyTorch for Deep Learning & Hugging Face NLP",
        "focus": "Tensors, autograd, custom neural network modules, and GPU training."
    },
    "React": {
        "duration": "2 Weeks",
        "resource": "React.dev Official Interactive Guide & Epic React",
        "focus": "Hooks, Component lifecycles, state management, and Server Components."
    },
    "TypeScript": {
        "duration": "1 - 2 Weeks",
        "resource": "Total TypeScript & TypeScript Handbook",
        "focus": "Generics, utility types, narrowing, and type safety across API boundaries."
    },
    "PostgreSQL": {
        "duration": "1 - 2 Weeks",
        "resource": "Use The Index, Luke! & PostgreSQL Query Optimization",
        "focus": "Indexing strategies, partitioning, transactions (ACID), and query planning."
    }
}


class AIInterviewAndSalaryEngine:
    def __init__(self):
        pass

    def generate_interview_kit(self, candidate_data: Dict[str, Any], job_details: Dict[str, Any]) -> Dict[str, Any]:
        """Generates targeted technical questions, gap probing, and behavioral interview kit."""
        matched_skills = candidate_data.get("skills_analysis", {}).get("matched_required", [])
        missing_skills = candidate_data.get("skills_analysis", {}).get("missing_required", [])
        cand_name = candidate_data.get("candidate_name", "Candidate")
        exp_years = candidate_data.get("experience_analysis", {}).get("candidate_years", 2.0)

        questions = []

        # 1. Technical Deep-Dive on verified matched skills
        for skill in matched_skills[:3]:
            if skill in TECHNICAL_PROMPTS:
                questions.append({
                    "category": "Technical Mastery",
                    "skill": skill,
                    "question": TECHNICAL_PROMPTS[skill],
                    "target": f"Verify deep production experience in {skill} as highlighted on resume."
                })

        # Fallback technical if none in bank
        if len(questions) < 2 and matched_skills:
            for skill in matched_skills:
                if len(questions) >= 2: break
                questions.append({
                    "category": "Technical Architecture",
                    "skill": skill,
                    "question": f"Can you walk us through a challenging production issue you resolved involving {skill}?",
                    "target": f"Assess problem-solving depth with {skill}."
                })

        # 2. Probing Questions on Missing Skills
        for skill in missing_skills[:2]:
            questions.append({
                "category": "Skill Gap & Adaptability",
                "skill": skill,
                "question": f"This role heavily utilizes {skill}, which was not prominent on your resume. How would you approach ramping up on {skill} within your first 30 days?",
                "target": f"Evaluate learning agility and willingness to adopt {skill}."
            })

        # 3. System Design / Architecture based on seniority
        if exp_years >= 4.0:
            questions.append({
                "category": "Senior System Design",
                "skill": "Architecture",
                "question": f"Design a high-throughput, fault-tolerant service for {job_details.get('title', 'our core platform')}. How would you manage data consistency, cache invalidation, and monitoring?",
                "target": "Gauge senior-level architectural intuition and scalability awareness."
            })
        else:
            questions.append({
                "category": "Code Quality & Testing",
                "skill": "Engineering Practices",
                "question": "How do you approach unit testing, code reviews, and maintaining clean code standards under tight delivery deadlines?",
                "target": "Evaluate craftsmanship and team collaboration standards."
            })

        return {
            "candidate_name": cand_name,
            "questions": questions,
            "total_questions": len(questions)
        }

    def estimate_market_salary(self, candidate_data: Dict[str, Any], job_details: Dict[str, Any]) -> Dict[str, Any]:
        """Calculates market compensation band based on experience, skill premiums, and role."""
        cand_exp = candidate_data.get("experience_analysis", {}).get("candidate_years", 2.0)
        matched_skills = candidate_data.get("skills_analysis", {}).get("matched_required", [])
        overall_match = candidate_data.get("overall_match", 75.0)

        # Baseline US Market Tech Base Salary
        # Junior (0-2 yrs): $90k - $120k
        # Mid (2-5 yrs): $120k - $160k
        # Senior (5-8 yrs): $160k - $210k
        # Lead/Staff (8+ yrs): $210k - $270k

        if cand_exp < 2.0:
            base_min, base_max = 95000, 125000
            level = "Associate / Junior"
        elif cand_exp < 5.0:
            base_min, base_max = 130000, 168000
            level = "Mid-Level Engineer"
        elif cand_exp < 8.0:
            base_min, base_max = 170000, 215000
            level = "Senior Engineer"
        else:
            base_min, base_max = 215000, 275000
            level = "Lead / Principal Engineer"

        # Domain Premiums
        premium = 0
        ai_skills = {"PyTorch", "TensorFlow", "Large Language Models", "Natural Language Processing", "RAG"}
        cloud_skills = {"Kubernetes", "Terraform", "AWS"}
        
        if any(s in matched_skills for s in ai_skills):
            premium += 12000
        if any(s in matched_skills for s in cloud_skills):
            premium += 8000

        # Adjust by match score
        multiplier = 0.9 + (overall_match / 100.0) * 0.2

        est_min = int((base_min + premium) * multiplier)
        est_max = int((base_max + premium) * multiplier)
        est_median = int((est_min + est_max) / 2)

        return {
            "seniority_level": level,
            "currency": "USD",
            "range_display": f"${est_min:,} - ${est_max:,}",
            "median_salary": f"${est_median:,}",
            "min_salary": est_min,
            "max_salary": est_max,
            "market_confidence": "High (Benchmark Data)"
        }

    def generate_learning_roadmap(self, missing_skills: List[str]) -> List[Dict[str, Any]]:
        """Generates step-by-step learning paths for missing required skills."""
        roadmap = []
        for skill in missing_skills:
            if skill in SKILL_LEARNING_RESOURCES:
                info = SKILL_LEARNING_RESOURCES[skill]
                roadmap.append({
                    "skill": skill,
                    "estimated_time": info["duration"],
                    "recommended_resource": info["resource"],
                    "key_focus_topics": info["focus"]
                })
            else:
                roadmap.append({
                    "skill": skill,
                    "estimated_time": "1 - 2 Weeks",
                    "recommended_resource": f"Official {skill} Documentation & Hands-on Projects",
                    "key_focus_topics": f"Core concepts, syntax, and integration testing with {skill}."
                })
        return roadmap
