import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.models.job import Job
from app.models.application import Application
from app.models.notification import Notification
from app.services.matcher import calculate_match_score


def seed():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "recruiter@talentsphere.io").first():
            print("Database already contains seed data. Skipping.")
            return

        print("Seeding Jobs Portal database...")

        # 1. Create Recruiter
        recruiter = User(
            name="Sarah Jenkins",
            email="recruiter@talentsphere.io",
            password_hash=hash_password("Password123!"),
            role="recruiter",
            phone="+1 (555) 234-5678",
            location="San Francisco, CA",
            company_name="Nexus AI Systems",
            company_website="https://nexusai.io",
            company_description="Next-generation autonomous enterprise AI software solutions.",
            skills=[],
            education=[],
        )
        db.add(recruiter)
        db.commit()
        db.refresh(recruiter)

        # 2. Create Candidate
        candidate = User(
            name="Alex Rivera",
            email="candidate@talentsphere.io",
            password_hash=hash_password("Password123!"),
            role="candidate",
            phone="+1 (555) 876-5432",
            location="Austin, TX",
            skills=["React", "TypeScript", "Python", "FastAPI", "PostgreSQL", "Docker", "Tailwind CSS", "Git"],
            experience_years=3.5,
            education=[
                {
                    "institution": "University of Texas at Austin",
                    "degree": "B.S. in Computer Science",
                    "field_of_study": "Software Engineering",
                    "start_year": "2018",
                    "end_year": "2022",
                    "grade": "3.8 GPA"
                }
            ],
            resume_parsed_data={
                "name": "Alex Rivera",
                "email": "candidate@talentsphere.io",
                "phone": "+1 (555) 876-5432",
                "summary": "Full Stack Software Engineer with 3.5 years of experience architecting resilient RESTful APIs with FastAPI and responsive React/TypeScript user interfaces.",
                "technical_skills": ["React", "TypeScript", "Python", "FastAPI", "PostgreSQL", "Docker", "Tailwind CSS", "Git"],
                "soft_skills": ["Problem Solving", "Collaboration", "Agile Methodologies"],
                "education": [
                    {
                        "institution": "University of Texas at Austin",
                        "degree": "B.S. in Computer Science",
                        "field_of_study": "Software Engineering",
                        "start_year": "2018",
                        "end_year": "2022",
                        "grade": "3.8 GPA"
                    }
                ],
                "work_experience": [
                    {
                        "company": "Vanguard Tech Labs",
                        "title": "Software Engineer",
                        "location": "Austin, TX",
                        "start_date": "2022",
                        "end_date": "Present",
                        "is_current": True,
                        "description": "Architected low-latency microservices with FastAPI and built React 18 single-page applications."
                    }
                ],
                "projects": [
                    {
                        "name": "High-Throughput Analytics Dashboard",
                        "description": "Interactive data streaming portal handling 50k events/sec.",
                        "technologies": ["React", "TypeScript", "FastAPI", "PostgreSQL"],
                        "link": "https://github.com/alexrivera/analytics-portal"
                    }
                ],
                "certifications": [
                    {
                        "name": "AWS Certified Cloud Practitioner",
                        "issuer": "Amazon Web Services",
                        "year": "2023"
                    }
                ],
                "total_experience_years": 3.5
            }
        )
        db.add(candidate)
        db.commit()
        db.refresh(candidate)

        # 3. Create Jobs
        jobs_data = [
            {
                "title": "Senior Full-Stack Engineer",
                "company_name": "Nexus AI Systems",
                "description": "We are seeking a seasoned Senior Full-Stack Engineer to architect next-generation agentic AI workflows. You will design scalable Python backend services with FastAPI and craft elegant, accessible React/TypeScript user interfaces.",
                "responsibilities": "Design and implement high-performance APIs\nCollaborate with AI engineers to integrate LLM agent runtimes\nOptimize database schemas and query performance with PostgreSQL\nMaintain 90%+ automated test coverage with CI/CD",
                "required_skills": ["React", "TypeScript", "Python", "FastAPI", "PostgreSQL"],
                "preferred_skills": ["Docker", "Kubernetes", "AWS", "Tailwind CSS", "GraphQL"],
                "location": "San Francisco, CA (Hybrid)",
                "job_type": "Full-time",
                "work_mode": "Hybrid",
                "salary_min": 14,
                "salary_max": 18,
                "experience_required": 3,
                "education_required": "Bachelor's in Computer Science or equivalent",
            },
            {
                "title": "Python Backend & AI Systems Developer",
                "company_name": "Nexus AI Systems",
                "description": "Join our Core Platform team to build resilient data pipelines, asynchronous job queues, and LLM inference integrations. You will own the backend architecture powering millions of AI-assisted candidate evaluations.",
                "responsibilities": "Develop asynchronous microservices using FastAPI and SQLAlchemy\nImplement distributed caching and locking with Redis\nIntegrate Google Gemini models into production ATS pipelines\nEnforce strict security, authentication, and data privacy protocols",
                "required_skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "SQLAlchemy"],
                "preferred_skills": ["Redis", "Google Gemini", "Kubernetes", "Pytest", "CI/CD"],
                "location": "Remote",
                "job_type": "Full-time",
                "work_mode": "Remote",
                "salary_min": 12,
                "salary_max": 16,
                "experience_required": 2,
                "education_required": "B.S. / M.S. in Computer Science",
            },
            {
                "title": "Frontend Architect (React / TypeScript)",
                "company_name": "Nexus AI Systems",
                "description": "Looking for a Frontend Specialist passionate about UI engineering, design systems, performance, and accessibility. You will set architectural standards for our modular enterprise dashboard.",
                "responsibilities": "Build and maintain reusable component libraries with Tailwind CSS\nOptimize rendering performance, bundle sizes, and Core Web Vitals\nImplement real-time dashboards with WebSockets and Recharts\nCollaborate closely with UI/UX product designers",
                "required_skills": ["React", "TypeScript", "Tailwind CSS", "Next.js"],
                "preferred_skills": ["Framer Motion", "Recharts", "Jest", "GraphQL", "Figma"],
                "location": "New York, NY",
                "job_type": "Full-time",
                "work_mode": "On-site",
                "salary_min": 15,
                "salary_max": 20,
                "experience_required": 4,
                "education_required": "Bachelor's degree or equivalent portfolio experience",
            },
            {
                "title": "Cloud DevOps & Platform Engineer",
                "company_name": "Nexus AI Systems",
                "description": "Empower our engineering teams with automated deployment pipelines, zero-downtime infrastructure, and resilient Kubernetes clusters across multi-region environments.",
                "responsibilities": "Provision infrastructure as code using Terraform\nManage container orchestration with Kubernetes and Docker\nAutomate zero-trust deployment pipelines in GitHub Actions\nMonitor system health with Prometheus and Grafana",
                "required_skills": ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
                "preferred_skills": ["Python", "Linux", "PostgreSQL", "Prometheus", "GCP"],
                "location": "Remote",
                "job_type": "Full-time",
                "work_mode": "Remote",
                "salary_min": 13,
                "salary_max": 18,
                "experience_required": 3,
                "education_required": "B.S. in relevant discipline",
            }
        ]

        created_jobs = []
        for jd in jobs_data:
            job = Job(
                recruiter_id=recruiter.id,
                title=jd["title"],
                company_name=jd["company_name"],
                description=jd["description"],
                responsibilities=jd["responsibilities"],
                required_skills=jd["required_skills"],
                preferred_skills=jd["preferred_skills"],
                location=jd["location"],
                job_type=jd["job_type"],
                work_mode=jd["work_mode"],
                salary_min=jd["salary_min"],
                salary_max=jd["salary_max"],
                experience_required=jd["experience_required"],
                education_required=jd["education_required"],
                is_active=True,
            )
            db.add(job)
            created_jobs.append(job)

        db.commit()
        for j in created_jobs:
            db.refresh(j)

        # 4. Create an initial application for Senior Full-Stack Engineer
        target_job = created_jobs[0]
        scoring = calculate_match_score(
            candidate_skills=candidate.skills,
            candidate_experience_years=candidate.experience_years,
            candidate_text=f"{candidate.name} {candidate.location}",
            required_skills=target_job.required_skills,
            preferred_skills=target_job.preferred_skills,
            experience_required=target_job.experience_required,
            job_description=target_job.description,
        )

        app = Application(
            job_id=target_job.id,
            candidate_id=candidate.id,
            recruiter_id=recruiter.id,
            resume_snapshot_path=candidate.resume_path,
            match_score=scoring["match_score"],
            match_breakdown=scoring,
            matched_skills=scoring["matched_skills"],
            missing_skills=scoring["missing_skills"],
            status="shortlisted",
        )
        db.add(app)

        # 5. Create Welcome Notification
        notif = Notification(
            user_id=candidate.id,
            title="Welcome to Jobs Portal!",
            message="Your profile is set up. Explore personalized job recommendations or generate your AI Career Roadmap.",
            notification_type="system",
        )
        db.add(notif)

        db.commit()
        print("Database successfully seeded with Recruiter, Candidate, 4 Jobs, and 1 Application!")
    finally:
        db.close()


if __name__ == "__main__":
    seed()

