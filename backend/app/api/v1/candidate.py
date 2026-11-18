import os
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import require_candidate
from app.models.user import User
from app.models.application import Application
from app.models.job import Job
from app.models.saved_job import SavedJob
from app.schemas.user import UserResponse, CandidateProfileUpdate
from app.schemas.application import ApplicationResponse
from app.schemas.job import JobResponse
from app.schemas.resume import ResumeUploadResponse, ParsedResumeData
from app.utils.file_validator import validate_file, sanitize_filename
from app.services.resume_parser import parse_resume_file
from app.utils.skill_normalizer import normalize_skill_list

router = APIRouter(prefix="/candidate", tags=["Candidate"])


@router.get("/profile", response_model=UserResponse)
def get_candidate_profile(current_user: User = Depends(require_candidate)):
    """Retrieve candidate profile information."""
    return current_user


@router.put("/profile", response_model=UserResponse)
def update_candidate_profile(
    profile_in: CandidateProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    """Update candidate profile details, skills, education, and parsed data."""
    if profile_in.name is not None:
        current_user.name = profile_in.name
    if profile_in.phone is not None:
        current_user.phone = profile_in.phone
    if profile_in.location is not None:
        current_user.location = profile_in.location
    if profile_in.profile_image is not None:
        current_user.profile_image = profile_in.profile_image
    if profile_in.date_of_birth is not None:
        current_user.date_of_birth = profile_in.date_of_birth
    if profile_in.gender is not None:
        current_user.gender = profile_in.gender
    if profile_in.preferred_locations is not None:
        current_user.preferred_locations = profile_in.preferred_locations
    if profile_in.linkedin_url is not None:
        current_user.linkedin_url = profile_in.linkedin_url
    if profile_in.github_url is not None:
        current_user.github_url = profile_in.github_url
    if profile_in.portfolio_url is not None:
        current_user.portfolio_url = profile_in.portfolio_url
    if profile_in.skills is not None:
        current_user.skills = normalize_skill_list(profile_in.skills)
    if profile_in.experience_years is not None:
        current_user.experience_years = profile_in.experience_years
    if profile_in.education is not None:
        current_user.education = profile_in.education
    if profile_in.resume_parsed_data is not None:
        current_user.resume_parsed_data = profile_in.resume_parsed_data

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/photo/upload")
async def upload_candidate_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    """Upload and set profile photo for candidate."""
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file selected")
    
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only JPG, PNG, and WebP images allowed")

    avatars_dir = os.path.join(settings.UPLOAD_DIR, "avatars")
    os.makedirs(avatars_dir, exist_ok=True)
    clean_name = f"avatar_{current_user.id}{ext}"
    file_path = os.path.join(avatars_dir, clean_name)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    photo_url = f"/uploads/avatars/{clean_name}"
    current_user.profile_image = photo_url
    db.commit()
    db.refresh(current_user)

    return {"profile_image": photo_url, "message": "Profile photo updated successfully"}


@router.post("/resume/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    """
    Upload resume file (PDF, DOCX, TXT), extract text, parse with Gemini AI,
    and automatically update candidate skills, experience, and profile.
    """
    validate_file(file)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    safe_name = sanitize_filename(file.filename)
    file_path = os.path.join(settings.UPLOAD_DIR, safe_name)

    # Save file locally
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # Extract text & parse with Gemini
    parsed_json = parse_resume_file(file_path)

    # Autofill candidate profile
    current_user.resume_path = file_path
    current_user.resume_parsed_data = parsed_json

    if parsed_json.get("technical_skills"):
        existing_skills = set(current_user.skills or [])
        new_skills = set(parsed_json["technical_skills"])
        current_user.skills = normalize_skill_list(list(existing_skills.union(new_skills)))

    if parsed_json.get("total_experience_years") and current_user.experience_years == 0:
        current_user.experience_years = float(parsed_json["total_experience_years"])

    if parsed_json.get("education") and not current_user.education:
        current_user.education = parsed_json["education"]

    db.commit()
    db.refresh(current_user)

    return ResumeUploadResponse(
        filename=safe_name,
        file_path=file_path,
        parsed_data=ParsedResumeData(**parsed_json),
        message="Resume successfully uploaded, parsed with Gemini AI, and profile updated.",
    )


@router.get("/applications", response_model=List[ApplicationResponse])
def get_candidate_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    """Retrieve all jobs applied by the current candidate."""
    applications = (
        db.query(Application)
        .filter(Application.candidate_id == current_user.id)
        .order_by(Application.applied_at.desc())
        .all()
    )
    return applications


@router.get("/saved-jobs", response_model=List[JobResponse])
def get_saved_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    """Retrieve all jobs bookmarked/saved by candidate."""
    saved = (
        db.query(Job)
        .join(SavedJob, SavedJob.job_id == Job.id)
        .filter(SavedJob.candidate_id == current_user.id)
        .order_by(SavedJob.created_at.desc())
        .all()
    )
    for j in saved:
        j.is_saved = True
    return saved


@router.post("/saved-jobs/{job_id}", status_code=status.HTTP_201_CREATED)
def save_job(
    job_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    """Save/bookmark a job for later."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    existing = db.query(SavedJob).filter(SavedJob.candidate_id == current_user.id, SavedJob.job_id == job_id).first()
    if existing:
        return {"message": "Job already saved"}

    saved = SavedJob(candidate_id=current_user.id, job_id=job_id)
    db.add(saved)
    db.commit()
    return {"message": "Job saved successfully"}


@router.delete("/saved-jobs/{job_id}")
def unsave_job(
    job_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    """Remove a job from saved bookmarks."""
    saved = db.query(SavedJob).filter(SavedJob.candidate_id == current_user.id, SavedJob.job_id == job_id).first()
    if not saved:
        return {"message": "Job not in saved list"}

    db.delete(saved)
    db.commit()
    return {"message": "Job removed from saved list"}

