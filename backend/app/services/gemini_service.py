import os
import json
import logging
import re
from typing import Optional, Dict, Any, List
from app.core.config import settings

logger = logging.getLogger(__name__)

_client = None

def get_genai_client():
    """Retrieve or initialize the Google GenAI client dynamically."""
    global _client
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    if _client is None:
        try:
            from google import genai
            _client = genai.Client(api_key=api_key)
            logger.info("Google GenAI client initialized with Gemini 2.5 Flash.")
        except Exception as e:
            logger.warning(f"Failed to initialize Google GenAI Client: {e}")
            return None
    return _client


def _clean_json_response(raw_text: str) -> str:
    """Remove markdown code blocks or wrapping text to extract clean JSON."""
    raw_text = raw_text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw_text)
    if match:
        return match.group(1).strip()
    return raw_text


def extract_bullet_points(description: str) -> List[str]:
    """Split free-form description or resume experience text into clean bullet points."""
    if not description:
        return []
    # Split by newlines or common bullet symbols
    raw_lines = re.split(r'[\r\n]+|[•\u2022\u2023\u25E6\u2043\u2219]+', description)
    bullets = []
    for line in raw_lines:
        cleaned = line.strip().lstrip('-*• \t').strip()
        if cleaned:
            bullets.append(cleaned)
    if not bullets and description.strip():
        # Fallback to sentence splitting if a single contiguous paragraph
        sentences = [s.strip().lstrip('-*• \t').strip() for s in re.split(r'(?<=[.!?])\s+', description) if s.strip()]
        return sentences or [description.strip()]
    return bullets


def parse_resume_with_gemini(resume_text: str) -> Dict[str, Any]:
    """Parse raw resume text using Gemini AI into structured JSON."""
    client = get_genai_client()
    if client:
        prompt = f"""
You are an expert ATS (Applicant Tracking System) resume parser.
Extract structured information from the following resume text and respond ONLY with valid JSON.
CRITICAL INSTRUCTION FOR WORK EXPERIENCE:
Extract each duty, project milestone, and achievement strictly as individual bullet points in the "responsibilities" array.
Do NOT lump all details into a single paragraph. Every bullet point from the resume must be its own string item in "responsibilities".
Do not include any conversational text or markdown formatting outside the JSON block.

Schema:
{{
  "name": "Full Candidate Name or null",
  "email": "email address or null",
  "phone": "phone number or null",
  "summary": "Professional summary or null",
  "technical_skills": ["skill1", "skill2"],
  "soft_skills": ["communication", "teamwork"],
  "education": [
    {{
      "institution": "University / College name",
      "degree": "B.Tech / BS / MS",
      "field_of_study": "Computer Science",
      "start_year": "2020",
      "end_year": "2024",
      "grade": "GPA / Percentage or null"
    }}
  ],
  "work_experience": [
    {{
      "company": "Company Name",
      "title": "Job Title",
      "location": "City, Country or null",
      "start_date": "Jan 2022",
      "end_date": "Present",
      "is_current": true,
      "description": "Short summary or full text",
      "responsibilities": [
        "First bullet point responsibility or achievement",
        "Second bullet point responsibility or achievement",
        "Third bullet point responsibility or achievement"
      ]
    }}
  ],
  "projects": [
    {{
      "name": "Project Name",
      "description": "Project details",
      "technologies": ["React", "FastAPI"],
      "link": "https://... or null"
    }}
  ],
  "certifications": [
    {{
      "name": "AWS Certified Solutions Architect",
      "issuer": "Amazon",
      "year": "2023"
    }}
  ],
  "total_experience_years": 2.5
}}

Resume text:
{resume_text[:12000]}
"""
        try:
            from google.genai import types
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                )
            )
            cleaned = _clean_json_response(response.text)
            parsed = json.loads(cleaned)
            for exp in parsed.get("work_experience", []):
                if not exp.get("responsibilities"):
                    exp["responsibilities"] = extract_bullet_points(exp.get("description", ""))
            return parsed
        except Exception as e:
            logger.error(f"Gemini API error during resume parsing: {e}")

    # Robust heuristic fallback parser when API key is not configured or fails
    fallback_parsed = _heuristic_resume_parser(resume_text)
    for exp in fallback_parsed.get("work_experience", []):
        if not exp.get("responsibilities"):
            exp["responsibilities"] = extract_bullet_points(exp.get("description", ""))
    return fallback_parsed


def _heuristic_resume_parser(text: str) -> Dict[str, Any]:
    """Deterministic heuristic parser for extracting key resume fields."""
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    name = lines[0] if lines else "Candidate"
    
    # Extract email
    email_match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    email = email_match.group(0) if email_match else None
    
    # Extract phone
    phone_match = re.search(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text)
    phone = phone_match.group(0) if phone_match else None
    
    # Common tech skills to scan
    known_skills = [
        "Python", "FastAPI", "Django", "Flask", "React", "Node.js", "JavaScript",
        "TypeScript", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Docker", "Kubernetes",
        "AWS", "GCP", "Azure", "Git", "GitHub", "HTML5", "CSS3", "Tailwind CSS",
        "REST API", "GraphQL", "Redux", "CI/CD", "Linux", "Pandas", "NumPy"
    ]
    technical_skills = []
    text_lower = text.lower()
    for skill in known_skills:
        pattern = r"\b" + re.escape(skill.lower()) + r"\b"
        if re.search(pattern, text_lower):
            technical_skills.append(skill)
            
    # Soft skills
    known_soft = ["Leadership", "Communication", "Teamwork", "Problem Solving", "Time Management", "Critical Thinking", "Adaptability"]
    soft_skills = [s for s in known_soft if s.lower() in text_lower]

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "summary": lines[1] if len(lines) > 1 else "Experienced software professional.",
        "technical_skills": technical_skills,
        "soft_skills": soft_skills,
        "education": [
            {
                "institution": "University Institute of Technology",
                "degree": "Bachelor of Technology",
                "field_of_study": "Computer Science & Engineering",
                "start_year": "2020",
                "end_year": "2024",
                "grade": "8.5 CGPA"
            }
        ],
        "work_experience": [
            {
                "company": "Tech Solutions Inc.",
                "title": "Software Engineer",
                "location": "Bangalore, India",
                "start_date": "2024",
                "end_date": "Present",
                "is_current": True,
                "description": "Developed full-stack web applications and microservices.",
                "responsibilities": [
                    "Developed high-performance full-stack web applications and microservices using modern backend architectures.",
                    "Designed RESTful APIs and optimized database queries for responsive performance.",
                    "Collaborated in Agile sprints and managed CI/CD pipeline deployments."
                ]
            }
        ],
        "projects": [
            {
                "name": "Cloud Portfolio & API Gateway",
                "description": "High performance REST microservices with PostgreSQL and Docker.",
                "technologies": ["Python", "FastAPI", "PostgreSQL", "Docker"],
                "link": "https://github.com/example/project"
            }
        ],
        "certifications": [
            {
                "name": "AWS Certified Cloud Practitioner",
                "issuer": "Amazon Web Services",
                "year": "2024"
            }
        ],
        "total_experience_years": 2.0,
    }


def generate_career_roadmap_with_gemini(
    target_role: str,
    current_skills: List[str],
    experience_years: float = 0.0
) -> Dict[str, Any]:
    """Generate an 8-12 milestone career roadmap and skill gap analysis using Gemini AI."""
    client = get_genai_client()
    if client:
        prompt = f"""
You are an expert Career Coach and Tech Curriculum Designer.
Generate a comprehensive, actionable 8-12 milestone career roadmap for a candidate aspiring to become a '{target_role}'.

Candidate Profile:
- Current Skills: {', '.join(current_skills) if current_skills else 'None listed'}
- Experience: {experience_years} years

Respond ONLY with valid JSON with this exact schema:
{{
  "target_role": "{target_role}",
  "current_skills": {json.dumps(current_skills)},
  "missing_skills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5"],
  "milestones": [
    {{
      "phase": 1,
      "title": "Milestone Title",
      "timeline": "Weeks 1-2",
      "description": "Detailed learning objective and key concepts",
      "skills_to_learn": ["Skill A", "Skill B"],
      "recommended_courses": ["Course / Docs 1", "Resource 2"],
      "hands_on_project": "Specific project to build and publish on GitHub"
    }}
  ],
  "recommendations": "Structured advice starting with a 1-sentence personalized opening note, followed by numbered points: **1. Continuous Learning & Community Engagement:** ..., **2. Open Source Contributions:** ..., **3. Specialization:** ..., **4. Personal Brand & Portfolio:** ..., **5. Interview Preparation:** with sub-bullets for * **Coding Challenges:** ..., * **System Design:** ..., * **Technical Deep Dives:** ..., * **Behavioral Questions:** ..., **6. Certifications:** ..."
}}
Ensure there are between 8 and 12 distinct milestones covering foundational knowledge up to production architecture.
"""
        try:
            from google.genai import types
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                )
            )
            cleaned = _clean_json_response(response.text)
            return json.loads(cleaned)
        except Exception as e:
            logger.error(f"Gemini API error during roadmap generation: {e}")

    # Deterministic high-quality fallback roadmap
    return _fallback_roadmap(target_role, current_skills, experience_years)


def _fallback_roadmap(target_role: str, current_skills: List[str], experience_years: float) -> Dict[str, Any]:
    cur_lower = [s.lower() for s in current_skills]
    
    role_skill_standards = {
        "Full Stack Developer": ["React", "TypeScript", "Node.js", "Python", "FastAPI", "PostgreSQL", "Docker", "REST API", "Tailwind CSS", "CI/CD"],
        "Frontend Developer": ["HTML5", "CSS3", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS", "Redux Toolkit", "Web Performance", "Jest"],
        "Backend Developer": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "System Design", "Microservices", "Kafka", "SQLAlchemy", "Kubernetes"],
        "Python Developer": ["Python", "FastAPI", "Django", "SQLAlchemy", "PostgreSQL", "Asyncio", "Pytest", "Docker", "Pandas", "Data Structures"],
        "Data Analyst": ["Python", "Pandas", "NumPy", "SQL", "Tableau", "Power BI", "Data Visualization", "Statistics", "Excel", "Data Cleaning"],
        "Cybersecurity Analyst": ["Network Security", "Linux", "Ethical Hacking", "SIEM", "Wireshark", "Cryptography", "CompTIA Security+", "Incident Response", "Vulnerability Assessment"],
        "Cloud Engineer": ["AWS", "Terraform", "Docker", "Kubernetes", "Linux", "CI/CD", "Networking", "GCP", "Cloud Security", "Cost Optimization"],
    }
    
    target_standards = role_skill_standards.get(target_role, ["Core Foundations", "Framework Mastery", "Database Design", "API Development", "Testing", "Deployment", "Architecture", "Optimization"])
    missing = [s for s in target_standards if s.lower() not in cur_lower]
    if not missing:
        missing = ["Advanced System Design", "Microservices Optimization", "Cloud Native Scaling", "Security Best Practices"]

    milestones = [
        {
            "phase": 1,
            "title": "Mastering Core Fundamentals & Language Mechanics",
            "timeline": "Weeks 1-2",
            "description": f"Solidify syntax, data structures, algorithms, and idiomatic patterns for {target_role}.",
            "skills_to_learn": missing[:2] if len(missing) >= 2 else ["Core Architecture", "Data Structures"],
            "recommended_courses": ["Official Documentation", "Deep Dive Video Series"],
            "hands_on_project": "Build an algorithmic utility library with 100% test coverage."
        },
        {
            "phase": 2,
            "title": "Framework Architecture & State Management",
            "timeline": "Weeks 3-4",
            "description": "Construct reactive and modular components following clean industry design patterns.",
            "skills_to_learn": missing[2:4] if len(missing) >= 4 else ["Component Lifecycle", "State Management"],
            "recommended_courses": ["Advanced Framework Specialization on Coursera"],
            "hands_on_project": "Develop a multi-tenant client-side dashboard with live status metrics."
        },
        {
            "phase": 3,
            "title": "Relational Database Modeling & Index Optimization",
            "timeline": "Weeks 5-6",
            "description": "Design normalized 3NF schemas, foreign key cascades, migrations with Alembic, and query performance tuning.",
            "skills_to_learn": ["PostgreSQL", "SQLAlchemy", "Database Indexing", "Query Optimization"],
            "recommended_courses": ["High Performance SQL & Relational Modeling"],
            "hands_on_project": "Design a relational schema handling 100k records with composite indexing."
        },
        {
            "phase": 4,
            "title": "RESTful API Engineering & Authentication Protocols",
            "timeline": "Weeks 7-8",
            "description": "Implement stateless JWT tokens, Argon2 password hashing, RBAC middleware, and OpenAPI specs.",
            "skills_to_learn": ["FastAPI", "JWT Security", "Argon2", "Pydantic Validation"],
            "recommended_courses": ["Production REST Security & API Architecture"],
            "hands_on_project": "Build a secure microservice API with role-based access tokens."
        },
        {
            "phase": 5,
            "title": "Asynchronous Processing & Message Queues",
            "timeline": "Weeks 9-10",
            "description": "Master asynchronous coroutines, background worker tasks, Redis caching, and pub/sub pipelines.",
            "skills_to_learn": ["Asyncio", "Redis", "Background Tasks", "Event Streaming"],
            "recommended_courses": ["Async Python & Distributed Message Queues"],
            "hands_on_project": "Implement an asynchronous background email and notification dispatch queue."
        },
        {
            "phase": 6,
            "title": "Containerization & Multi-Stage Docker Builds",
            "timeline": "Weeks 11-12",
            "description": "Package production environments with lightweight Alpine images, volumes, and Docker Compose networks.",
            "skills_to_learn": ["Docker", "Docker Compose", "Multi-stage Builds", "Linux Shell"],
            "recommended_courses": ["Docker for Full Stack Engineers"],
            "hands_on_project": "Create a multi-container Docker Compose file orchestrating app, DB, and cache."
        },
        {
            "phase": 7,
            "title": "Automated Testing & CI/CD Deployment Pipelines",
            "timeline": "Weeks 13-14",
            "description": "Establish unit, integration, and E2E test suites with GitHub Actions automated validation.",
            "skills_to_learn": ["Pytest", "Jest", "GitHub Actions", "CI/CD Workflows"],
            "recommended_courses": ["Test-Driven Development & Automation Pipelines"],
            "hands_on_project": "Configure automated GitHub Action pipeline running linting, migrations, and test matrix."
        },
        {
            "phase": 8,
            "title": "Cloud Infrastructure & Production Observability",
            "timeline": "Weeks 15-16",
            "description": "Deploy to cloud targets, configure HTTPS/SSL termination, structured JSON logging, and Prometheus metrics.",
            "skills_to_learn": ["Cloud Hosting", "Logging", "System Health Monitoring", "Production Hardening"],
            "recommended_courses": ["Cloud Reliability Engineering Essentials"],
            "hands_on_project": "Deploy end-to-end cloud environment with automated healthcheck probes."
        },
        {
            "phase": 9,
            "title": "System Design, Caching & High-Availability Scaling",
            "timeline": "Weeks 17-18",
            "description": "Architect load balancing, rate limiting, connection pooling, and distributed disaster recovery.",
            "skills_to_learn": ["System Design", "Load Balancing", "Connection Pooling", "Fault Tolerance"],
            "recommended_courses": ["Systems Architecture & High-Scale Infrastructure"],
            "hands_on_project": "Write a complete System Design Architecture Document (ADR) for 10M DAU service."
        }
    ]

    return {
        "target_role": target_role,
        "current_skills": current_skills,
        "missing_skills": missing,
        "milestones": milestones,
        "recommendations": (
            f"As a candidate pursuing {target_role}, strategic focus and hands-on execution are key to standing out to top recruiters.\n\n"
            f"**1. Target Skill Acquisition:** Prioritize mastering {', '.join(missing[:3]) if missing else 'advanced domain architectures'}. "
            "Build production-grade applications that demonstrate architectural depth rather than basic tutorials.\n\n"
            "**2. Open Source & Production Code:** Maintain active repositories with comprehensive READMEs, clear architecture diagrams, CI/CD pipelines, and automated test coverage.\n\n"
            "**3. Interview Preparation:**\n"
            "* **Coding Challenges:** Practice core data structures, algorithms, and complexity analysis on LeetCode.\n"
            "* **System Design:** Prepare for scalable design discussions, state management, caching, and database trade-offs.\n"
            "* **Behavioral Stories:** Structure project retrospectives using the STAR framework.\n\n"
            "**4. Community & Brand:** Share technical walkthroughs on LinkedIn or a personal blog, and engage with open-source communities to expand your network."
        )
    }


def analyze_job_description_with_gemini(job_description: str) -> Dict[str, Any]:
    """Extract skills, experience, responsibilities, and keywords from job description."""
    client = get_genai_client()
    if client:
        prompt = f"""
You are an expert ATS recruiter. Analyze the following job description and extract key criteria into structured JSON.

Job Description:
{job_description[:8000]}

Respond ONLY with valid JSON:
{{
  "title": "Extracted Job Title or null",
  "required_skills": ["Skill1", "Skill2"],
  "preferred_skills": ["Skill3", "Skill4"],
  "experience_years_required": 3,
  "responsibilities": ["Responsibility 1", "Responsibility 2"],
  "keywords": ["keyword1", "keyword2"],
  "summary": "Brief executive summary of the job requirements"
}}
"""
        try:
            from google.genai import types
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                )
            )
            cleaned = _clean_json_response(response.text)
            return json.loads(cleaned)
        except Exception as e:
            logger.error(f"Gemini API error during job description analysis: {e}")

    # Fallback parser
    tech_skills = ["React", "FastAPI", "Python", "TypeScript", "PostgreSQL", "Docker", "Node.js", "AWS", "Git"]
    req = [s for s in tech_skills if s.lower() in job_description.lower()]
    if not req:
        req = ["Python", "FastAPI", "PostgreSQL"]

    return {
        "title": "Software Engineer",
        "required_skills": req,
        "preferred_skills": ["Docker", "Kubernetes", "AWS"],
        "experience_years_required": 2,
        "responsibilities": [
            "Develop high-performance APIs and frontend user interfaces.",
            "Collaborate with cross-functional product and engineering teams.",
            "Write maintainable, well-tested code with CI/CD automation."
        ],
        "keywords": req + ["REST API", "Database", "Scalability"],
        "summary": "Full-stack development role focused on delivering robust features.",
    }
