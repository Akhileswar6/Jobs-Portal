import os
from collections import Counter
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import require_recruiter
from app.models.user import User
from app.models.job import Job
from app.models.application import Application
from app.models.interview import Interview
from app.schemas.user import UserResponse, RecruiterProfileUpdate

router = APIRouter(prefix="/recruiter", tags=["Recruiter"])


@router.get("/profile", response_model=UserResponse)
def get_recruiter_profile(current_user: User = Depends(require_recruiter)):
    """Retrieve recruiter and company details."""
    return current_user


@router.put("/profile", response_model=UserResponse)
def update_recruiter_profile(
    profile_in: RecruiterProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    """Update company and recruiter profile."""
    if profile_in.name is not None:
        current_user.name = profile_in.name
    if profile_in.phone is not None:
        current_user.phone = profile_in.phone
    if profile_in.location is not None:
        current_user.location = profile_in.location
    if profile_in.profile_image is not None:
        current_user.profile_image = profile_in.profile_image
    if profile_in.company_name is not None:
        current_user.company_name = profile_in.company_name
    if profile_in.company_website is not None:
        current_user.company_website = profile_in.company_website
    if profile_in.company_description is not None:
        current_user.company_description = profile_in.company_description
    if profile_in.company_logo is not None:
        current_user.company_logo = profile_in.company_logo
    if profile_in.company_email is not None:
        current_user.company_email = profile_in.company_email
    if profile_in.industry is not None:
        current_user.industry = profile_in.industry
    if profile_in.company_linkedin_url is not None:
        current_user.company_linkedin_url = profile_in.company_linkedin_url
    if profile_in.company_type is not None:
        current_user.company_type = profile_in.company_type
    if profile_in.designation is not None:
        current_user.designation = profile_in.designation
    if profile_in.department is not None:
        current_user.department = profile_in.department
    if profile_in.linkedin_url is not None:
        current_user.linkedin_url = profile_in.linkedin_url

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/logo/upload")
async def upload_company_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    """Upload and set company logo for recruiter."""
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file selected")
    
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".svg"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only JPG, PNG, WebP, and SVG images allowed")

    logos_dir = os.path.join(settings.UPLOAD_DIR, "logos")
    os.makedirs(logos_dir, exist_ok=True)
    clean_name = f"logo_{current_user.id}{ext}"
    file_path = os.path.join(logos_dir, clean_name)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    logo_url = f"/uploads/logos/{clean_name}"
    current_user.company_logo = logo_url
    db.commit()
    db.refresh(current_user)

    return {"company_logo": logo_url, "message": "Company logo updated successfully"}


@router.get("/dashboard")
def get_recruiter_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
) -> Dict[str, Any]:
    """
    Fetch comprehensive recruiter dashboard analytics:
    - Total jobs posted
    - Active jobs
    - Total applications
    - Shortlisted candidates
    - Interviews scheduled
    - Hiring funnel breakdown
    - Top in-demand skills
    - Recent applications
    """
    recruiter_id = current_user.id

    # 1. Job statistics
    total_jobs = db.query(Job).filter(Job.recruiter_id == recruiter_id).count()
    active_jobs = db.query(Job).filter(Job.recruiter_id == recruiter_id, Job.is_active == True).count()

    # 2. Application statistics
    total_applications = db.query(Application).filter(Application.recruiter_id == recruiter_id).count()
    shortlisted_count = db.query(Application).filter(
        Application.recruiter_id == recruiter_id,
        Application.status.in_(["shortlisted", "interview", "accepted"])
    ).count()

    # 3. Interviews scheduled
    interviews_scheduled = db.query(Interview).filter(
        Interview.recruiter_id == recruiter_id,
        Interview.status == "scheduled"
    ).count()

    # 4. Hiring Funnel Breakdown
    status_counts = (
        db.query(Application.status, func.count(Application.id))
        .filter(Application.recruiter_id == recruiter_id)
        .group_by(Application.status)
        .all()
    )
    status_dict = {s: count for s, count in status_counts}
    
    funnel = [
        {"stage": "Total Applied", "count": total_applications},
        {"stage": "Reviewed", "count": status_dict.get("reviewed", 0) + status_dict.get("shortlisted", 0) + status_dict.get("interview", 0) + status_dict.get("accepted", 0)},
        {"stage": "Shortlisted", "count": status_dict.get("shortlisted", 0) + status_dict.get("interview", 0) + status_dict.get("accepted", 0)},
        {"stage": "Interviewing", "count": status_dict.get("interview", 0) + status_dict.get("accepted", 0)},
        {"stage": "Hired", "count": status_dict.get("accepted", 0)},
    ]

    # 5. Top in-demand skills from recruiter's jobs
    jobs = db.query(Job).filter(Job.recruiter_id == recruiter_id).all()
    skills_counter = Counter()
    for j in jobs:
        if j.required_skills and isinstance(j.required_skills, list):
            for skill in j.required_skills:
                skills_counter[skill] += 1
    top_skills = [{"name": s, "count": c} for s, c in skills_counter.most_common(8)]

    # 6. Recent applications with match scores
    recent_apps = (
        db.query(Application)
        .filter(Application.recruiter_id == recruiter_id)
        .order_by(Application.applied_at.desc())
        .limit(6)
        .all()
    )
    
    recent_list = []
    for app in recent_apps:
        recent_list.append({
            "id": str(app.id),
            "job_title": app.job.title if app.job else "Unknown Job",
            "candidate_name": app.candidate.name if app.candidate else "Unknown Candidate",
            "match_score": app.match_score,
            "status": app.status,
            "applied_at": app.applied_at.isoformat(),
        })

    return {
        "total_jobs": total_jobs,
        "active_jobs": active_jobs,
        "total_applications": total_applications,
        "shortlisted_candidates": shortlisted_count,
        "interviews_scheduled": interviews_scheduled,
        "hiring_funnel": funnel,
        "top_skills": top_skills,
        "recent_applications": recent_list,
    }

