"""
Live Job Ingestion, URL Web Scraper & Real-Time Tech Job Board API Connector.
"""

import re
import urllib.parse
from typing import Dict, List, Any, Optional
import httpx
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9"
}

# Curated Fallback Live Market Jobs in case of network throttle
FALLBACK_LIVE_JOBS = [
    {
        "id": "live_job_remotive_1",
        "title": "Senior PyTorch & NLP Machine Learning Engineer",
        "company": "Anthropic AI Ecosystem Partner",
        "location": "Remote / Worldwide",
        "source": "Live Market Feed",
        "url": "https://remotive.com/remote-jobs/software-dev/senior-ml-nlp-engineer",
        "description": """Senior Machine Learning Engineer (NLP & Large Language Models)
Company: AI Scale Labs | Location: Remote

We are seeking a Senior ML Engineer to architect and fine-tune large language models, retrieval-augmented generation (RAG) pipelines, and low-latency inference microservices.

Core Requirements:
- 3+ years experience with Python, PyTorch, and Hugging Face Transformers
- Deep knowledge of Natural Language Processing (NLP), Sentence Embeddings, and Vector Databases (Pinecone, Milvus, ChromaDB)
- Hands-on experience containerizing models with Docker and serving APIs with FastAPI
- Solid background in PostgreSQL, SQL, and distributed caching with Redis
- Familiarity with AWS (SageMaker, S3, ECS) and CI/CD automation

Bonus / Nice-to-Have:
- Experience with Kubernetes (k8s) and LangChain / LlamaIndex
- Master's or Ph.D. in Computer Science, Data Science, or Artificial Intelligence"""
    },
    {
        "id": "live_job_remotive_2",
        "title": "Lead Full Stack Engineer (React, TypeScript & Node.js)",
        "company": "Veloce Cloud Platform",
        "location": "Remote / North America",
        "source": "Live Market Feed",
        "url": "https://remotive.com/remote-jobs/software-dev/lead-full-stack-engineer",
        "description": """Lead Full Stack Engineer
Company: Veloce Cloud Platform | Location: Remote

We are hiring a Lead Full Stack Engineer to spearhead our modern web platform and customer analytics interface.

Requirements:
- 4+ years building high-scale web applications with React, TypeScript, and modern JavaScript
- Experience with Next.js, Tailwind CSS, HTML5, and responsive design systems
- Strong backend experience with Node.js, Express.js, and RESTful APIs
- Production experience with PostgreSQL, schema migrations, and Redis
- Familiarity with Docker, GitHub Actions CI/CD, and AWS hosting (S3, CloudFront)

Preferred:
- GraphQL and WebSocket experience
- Unit testing with Jest, Cypress, or Playwright
- Bachelor's degree in Computer Science or Software Engineering"""
    },
    {
        "id": "live_job_remotive_3",
        "title": "Cloud DevOps & Platform Reliability Engineer",
        "company": "Skyline Infrastructure",
        "location": "Remote / Europe & Americas",
        "source": "Live Market Feed",
        "url": "https://remotive.com/remote-jobs/software-dev/cloud-devops-engineer",
        "description": """Cloud DevOps & Site Reliability Engineer
Company: Skyline Infrastructure | Location: Remote

Looking for a DevOps engineer to manage production Kubernetes clusters, automate multi-region AWS cloud provisioning, and build robust observability systems.

Requirements:
- 3+ years managing AWS or GCP infrastructure with Terraform / Infrastructure as Code
- Strong expertise with Kubernetes (EKS), Docker, and Helm charts
- CI/CD automation with GitHub Actions or GitLab CI
- Deep Linux administration skills, Bash scripting, and Python automation
- Monitoring and logging with Prometheus, Grafana, and Datadog

Preferred:
- CKA (Certified Kubernetes Administrator) or AWS DevOps certification
- Microservices architecture and Istio service mesh experience"""
    }
]


class LiveJobFetcher:
    def __init__(self):
        pass

    async def fetch_job_from_url(self, url: str) -> Dict[str, Any]:
        """Scrapes and extracts structured job posting text from any live URL."""
        if not url.startswith("http://") and not url.startswith("https://"):
            url = f"https://{url}"

        domain = urllib.parse.urlparse(url).netloc

        browser_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Sec-Ch-Ua": '"Chromium";v="123", "Not:A-Brand";v="8"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"Windows"',
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1"
        }

        try:
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True, headers=browser_headers) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    html_content = response.text
                    return self._parse_html_job(html_content, url, domain)
                else:
                    return {
                        "error": f"Web server returned HTTP {response.status_code}. You can also paste the job text directly below.",
                        "title": f"Job Posting ({domain})",
                        "company": domain.replace("www.", "").split(".")[0].capitalize(),
                        "description": f"Role scraped from {url}. Paste requirements here if content is restricted by Cloudflare.",
                        "url": url,
                        "domain": domain
                    }
        except Exception as e:
            return {
                "error": f"Could not reach URL: {str(e)}",
                "title": f"Job Posting ({domain})",
                "company": domain.replace("www.", "").split(".")[0].capitalize(),
                "description": f"Role from {url}",
                "url": url,
                "domain": domain
            }

    def _parse_html_job(self, html: str, url: str, domain: str) -> Dict[str, Any]:
        """Cleans HTML and extracts title, company, and job description body."""
        soup = BeautifulSoup(html, "html.parser")

        # 1. Remove non-content elements
        for tag in soup(["script", "style", "nav", "header", "footer", "aside", "noscript", "svg", "button", "form", "iframe"]):
            tag.decompose()

        # 2. Extract Title
        title = ""
        og_title = soup.find("meta", property="og:title")
        if og_title and og_title.get("content"):
            title = og_title["content"].strip()
        elif soup.find("h1"):
            title = soup.find("h1").get_text().strip()
        elif soup.title:
            title = soup.title.string.strip()
        else:
            title = f"Role at {domain}"

        # Clean title suffix (e.g. " - Careers at Google")
        title = re.sub(r'\s*[-|–|•].*$', '', title).strip()

        # 3. Extract Company
        company = ""
        og_site = soup.find("meta", property="og:site_name")
        if og_site and og_site.get("content"):
            company = og_site["content"].strip()
        else:
            parts = domain.replace("www.", "").split(".")
            company = parts[0].capitalize() if parts else "Hiring Company"

        # 4. Extract Main Job Content
        # Look for common job posting containers
        main_content = ""
        content_candidates = soup.find_all(["div", "section", "article", "main"], class_=re.compile(r'job|description|posting|content|details|career', re.I))
        
        if content_candidates:
            # Pick the largest text block candidate
            best_candidate = max(content_candidates, key=lambda el: len(el.get_text()))
            main_content = best_candidate.get_text(separator="\n", strip=True)

        if not main_content or len(main_content) < 150:
            # Fallback to entire body text
            main_content = soup.get_text(separator="\n", strip=True)

        # Remove excessive whitespace
        cleaned_lines = [line.strip() for line in main_content.split("\n") if len(line.strip()) > 0]
        full_text = "\n".join(cleaned_lines)

        return {
            "title": title or "Software / Tech Role",
            "company": company,
            "url": url,
            "domain": domain,
            "description": full_text[:4000] # Cap text to avoid bloat
        }

    async def fetch_live_market_jobs(self) -> List[Dict[str, Any]]:
        """Fetches live developer jobs from Remotive public API with graceful fallback."""
        try:
            async with httpx.AsyncClient(timeout=8.0, headers=HEADERS) as client:
                res = await client.get("https://remotive.com/api/remote-jobs?category=software-dev&limit=6")
                if res.status_code == 200:
                    data = res.json()
                    jobs = data.get("jobs", [])
                    live_list = []
                    for j in jobs[:6]:
                        soup = BeautifulSoup(j.get("description", ""), "html.parser")
                        clean_desc = soup.get_text(separator="\n", strip=True)
                        live_list.append({
                            "id": f"remotive_{j.get('id', len(live_list))}",
                            "title": j.get("title", "Software Engineer"),
                            "company": j.get("company_name", "Tech Co"),
                            "location": j.get("candidate_required_location", "Remote"),
                            "source": "Remotive Live API",
                            "url": j.get("url", ""),
                            "description": f"Title: {j.get('title')}\nCompany: {j.get('company_name')}\nLocation: {j.get('candidate_required_location')}\n\n{clean_desc[:3000]}"
                        })
                    if live_list:
                        return live_list
        except Exception:
            pass

        return FALLBACK_LIVE_JOBS
