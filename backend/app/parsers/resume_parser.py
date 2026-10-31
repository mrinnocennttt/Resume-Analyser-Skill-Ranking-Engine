"""
Multi-Format Resume Parser (PDF, DOCX, TXT)
Extracts clean raw text, contact information, experience duration, education, certifications, and structural sections.
"""

import re
import io
from typing import Dict, List, Any, Optional
from datetime import datetime
import pypdf
import pdfplumber
import docx
from app.ml.skills_taxonomy import EDUCATION_DEGREES, CERTIFICATIONS_LIST

class ResumeParser:
    def __init__(self):
        pass

    def extract_text_from_pdf(self, file_bytes: bytes) -> str:
        """Extracts text from PDF using pdfplumber with pypdf fallback and whitespace normalization."""
        text = ""
        try:
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text(layout=True) or page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception:
            pass

        if not text.strip():
            try:
                reader = pypdf.PdfReader(io.BytesIO(file_bytes))
                for page in reader.pages:
                    p_text = page.extract_text()
                    if p_text:
                        text += p_text + "\n"
            except Exception:
                pass

        # Normalize special whitespace and carriage returns
        text = text.replace('\r\n', '\n').replace('\r', '\n')
        # Remove consecutive blank lines
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()

    def extract_text_from_docx(self, file_bytes: bytes) -> str:
        """Extracts text from DOCX file including tables."""
        try:
            doc = docx.Document(io.BytesIO(file_bytes))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            for table in doc.tables:
                for row in table.rows:
                    row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                    if row_text:
                        paragraphs.append(row_text)
            return "\n".join(paragraphs).strip()
        except Exception as e:
            return f"Error reading docx: {str(e)}"

    def extract_text_from_txt(self, file_bytes: bytes) -> str:
        """Extracts text from raw TXT bytes with multi-encoding support."""
        for enc in ["utf-8", "latin-1", "utf-16", "cp1252"]:
            try:
                return file_bytes.decode(enc).strip()
            except Exception:
                continue
        return file_bytes.decode("utf-8", errors="ignore").strip()

    def parse_file(self, filename: str, file_bytes: bytes) -> Dict[str, Any]:
        """Parses file based on extension and extracts full metadata."""
        ext = filename.lower().split(".")[-1]
        raw_text = ""

        if ext == "pdf":
            raw_text = self.extract_text_from_pdf(file_bytes)
        elif ext in ["docx", "doc"]:
            raw_text = self.extract_text_from_docx(file_bytes)
        else:
            raw_text = self.extract_text_from_txt(file_bytes)

        if not raw_text or len(raw_text.strip()) < 10:
            raw_text = "No readable text extracted from document."

        # Extract structured entities
        sections = self.segment_sections(raw_text)
        contact_info = self.extract_contact_info(raw_text, filename)
        experience_info = self.extract_experience(raw_text, sections.get("Experience", ""))
        education_info = self.extract_education(raw_text)
        certifications = self.extract_certifications(raw_text)

        return {
            "filename": filename,
            "raw_text": raw_text,
            "word_count": len(raw_text.split()),
            "contact": contact_info,
            "experience": experience_info,
            "education": education_info,
            "certifications": certifications,
            "sections": sections
        }

    def extract_contact_info(self, text: str, filename: str) -> Dict[str, Any]:
        """Extracts candidate name, email, phone, links."""
        # 1. Email extraction
        email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
        email = email_match.group(0) if email_match else "Not specified"

        # 2. Phone extraction
        phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
        phone = phone_match.group(0) if phone_match else "Not specified"

        # 3. Links extraction
        linkedin_match = re.search(r'linkedin\.com/in/[a-zA-Z0-9_-]+', text, re.IGNORECASE)
        linkedin = f"https://{linkedin_match.group(0)}" if linkedin_match else None

        github_match = re.search(r'github\.com/[a-zA-Z0-9_-]+', text, re.IGNORECASE)
        github = f"https://{github_match.group(0)}" if github_match else None

        # 4. Name extraction
        name = self._guess_name(text, filename)

        return {
            "name": name,
            "email": email,
            "phone": phone,
            "linkedin": linkedin,
            "github": github
        }

    def _guess_name(self, text: str, filename: str) -> str:
        """Extracts candidate name from first lines, explicit label, or fallback to filename."""
        lines = [line.strip() for line in text.split("\n") if line.strip()]

        # Check for explicit "Name: John Doe"
        for line in lines[:8]:
            m = re.match(r'^(?:name|candidate name|full name)\s*[:\-]\s*([a-zA-Z\s\.\'\-]+)$', line, re.IGNORECASE)
            if m:
                cand = m.group(1).strip()
                if 2 <= len(cand.split()) <= 4:
                    return cand.title()

        # Scan top 5 lines for clean person name
        for line in lines[:5]:
            cleaned = re.sub(r'[^a-zA-Z\s]', '', line).strip()
            words = cleaned.split()
            lower_line = line.lower()
            if 2 <= len(words) <= 4:
                # Exclude lines that have common resume header words
                if not any(k in lower_line for k in [
                    "resume", "curriculum", "vitae", "cv", "page", "developer", "engineer",
                    "contact", "email", "phone", "profile", "summary", "experience", "education"
                ]):
                    return cleaned.title()

        # Fallback to filename without extension
        base = re.sub(r'[_\-.]', ' ', filename.split('.')[0]).strip()
        cleaned_base = re.sub(r'\bresume\b|\bcv\b|\bprofile\b|\bdocument\b', '', base, flags=re.IGNORECASE).strip()
        return cleaned_base.title() if cleaned_base else "Candidate"

    def extract_experience(self, text: str, exp_section_text: str = "") -> Dict[str, Any]:
        """
        Estimates total years of experience using:
        1. Explicit statements ("X years of experience", "X+ yrs")
        2. Date ranges in experience section, avoiding education date confusion.
        """
        years_found = []
        current_year = datetime.now().year

        # 1. Explicit years pattern
        explicit_matches = re.findall(r'(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s+of)?\s*(?:experience|exp)?', text, re.IGNORECASE)
        for m in explicit_matches:
            try:
                val = float(m)
                if 0.5 <= val <= 35:
                    years_found.append(val)
            except ValueError:
                pass

        # 2. Date ranges from experience section or filtered text
        target_text = exp_section_text if exp_section_text.strip() else text
        
        # Filter out obvious education lines from date scanning
        filtered_lines = []
        for line in target_text.split('\n'):
            line_l = line.lower()
            if not any(edu in line_l for edu in ['bachelor', 'master', 'phd', 'degree', 'university', 'college', 'school', 'gpa', 'b.tech', 'b.e.', 'b.s.', 'm.s.', 'm.tech']):
                filtered_lines.append(line)
        
        scan_text = '\n'.join(filtered_lines)
        year_range_matches = re.findall(r'(20\d{2}|19\d{2})\s*(?:-|–|to)\s*(20\d{2}|19\d{2}|present|current|now)', scan_text, re.IGNORECASE)
        
        intervals = []
        calculated_ranges = []

        for start_str, end_str in year_range_matches:
            try:
                start_yr = int(start_str)
                end_yr = current_year if end_str.lower() in ["present", "current", "now"] else int(end_str)
                if 1985 <= start_yr <= current_year and end_yr >= start_yr:
                    duration = max(0.5, float(end_yr - start_yr))
                    calculated_ranges.append(f"{start_yr}-{end_yr} ({duration:.1f} yrs)")
                    intervals.append((start_yr, end_yr))
            except Exception:
                pass

        # Merge overlapping intervals for true total experience duration
        total_range_years = 0.0
        if intervals:
            intervals.sort(key=lambda x: x[0])
            merged = [intervals[0]]
            for current in intervals[1:]:
                prev_start, prev_end = merged[-1]
                curr_start, curr_end = current
                if curr_start <= prev_end:
                    merged[-1] = (prev_start, max(prev_end, curr_end))
                else:
                    merged.append(current)
            for s, e in merged:
                total_range_years += max(0.5, float(e - s))

        # Final estimated years
        if explicit_matches and years_found:
            # If explicit mention matches closely with ranges, use explicit
            explicit_val = max(years_found)
            if total_range_years > 0:
                estimated_years = min(round(total_range_years, 1), 30.0)
            else:
                estimated_years = explicit_val
        elif total_range_years > 0:
            estimated_years = min(round(total_range_years, 1), 30.0)
        elif years_found:
            estimated_years = max(years_found)
        else:
            estimated_years = 2.0  # reasonable default

        return {
            "estimated_years": estimated_years,
            "detected_ranges": calculated_ranges,
            "explicit_mentions": years_found
        }

    def extract_education(self, text: str) -> Dict[str, Any]:
        """Detects highest educational degree, field of study, and institution."""
        lower_text = text.lower()
        highest_degree = "Bachelor"
        degree_rank = 2

        rank_map = {"Doctorate": 4, "Master": 3, "Bachelor": 2, "Diploma": 1}

        detected_degrees = []
        for level, keywords in EDUCATION_DEGREES.items():
            for kw in keywords:
                pattern = rf'\b{re.escape(kw)}\b'
                if re.search(pattern, lower_text):
                    detected_degrees.append(level)
                    if rank_map[level] > degree_rank:
                        degree_rank = rank_map[level]
                        highest_degree = level
                    break

        fields = [
            "Computer Science", "Information Technology", "Software Engineering",
            "Data Science", "Artificial Intelligence", "Electrical Engineering",
            "Mechanical Engineering", "Civil Engineering", "Mathematics", "Statistics",
            "Business Administration", "Finance", "Physics", "Computer Applications"
        ]
        detected_fields = []
        for field in fields:
            if re.search(rf'\b{re.escape(field.lower())}\b', lower_text):
                detected_fields.append(field)

        return {
            "highest_degree": highest_degree,
            "degree_rank": degree_rank,
            "all_detected_degrees": list(set(detected_degrees)) or ["Bachelor"],
            "fields_of_study": detected_fields or ["Computer Science"]
        }

    def extract_certifications(self, text: str) -> List[str]:
        """Identifies recognized industry certifications."""
        found = []
        lower_text = text.lower()
        for cert in CERTIFICATIONS_LIST:
            if re.search(rf'\b{re.escape(cert.lower())}\b', lower_text):
                found.append(cert)
        return found

    def segment_sections(self, text: str) -> Dict[str, str]:
        """Segments resume into main sections: Summary, Experience, Skills, Education, Projects."""
        sections = {"Summary": "", "Experience": "", "Skills": "", "Education": "", "Projects": ""}
        current_section = "Summary"
        
        section_headers = {
            "experience": ["experience", "work history", "employment", "professional background", "work experience", "professional experience"],
            "skills": ["skills", "technical skills", "technologies", "competencies", "tools", "core competencies", "technical proficiencies"],
            "education": ["education", "academic", "qualifications", "degree", "academic background"],
            "projects": ["projects", "personal projects", "portfolio projects", "key initiatives", "technical projects"]
        }

        for line in text.split("\n"):
            line_clean = line.strip().lower()
            matched_header = None
            
            for sec_name, keywords in section_headers.items():
                if any(kw == line_clean or line_clean.startswith(f"{kw}:") or line_clean.startswith(f"## {kw}") or line_clean.startswith(f"# {kw}") for kw in keywords):
                    matched_header = sec_name.capitalize()
                    break

            if matched_header:
                current_section = matched_header
            else:
                sections[current_section] = sections.get(current_section, "") + line + "\n"

        return sections
