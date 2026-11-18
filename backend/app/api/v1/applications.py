from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_candidate, require_recruiter
from app.models.user import User
from app.models.job import Job
from app.models.application import Application
from app.schemas.application import (
    ApplicationCreate,
    ApplicationStatusUpdate,
    ApplicationResponse,
)
from app.services.matcher import calculate_match_score
from app.services.notification_service import create_notification

router = APIRouter(prefix="", tags=["Applications"])


@router.post("/applications", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_to_job(
    app_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    """
    Candidate applies to a job.
    Calculates deterministic ATS score and breakdown, creates notification for recruiter.
    """
    job = db.query(Job).filter(Job.id == app_in.job_id).first()
    if not job or not job.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found or inactive")

    # Prevent duplicate applications
    existing = db.query(Application).filter(
        Application.job_id == app_in.job_id,
        Application.candidate_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You have already applied for this position.")

    # Calculate ATS Match Score
    cand_text = f"{current_user.name} {current_user.location or ''} {current_user.phone or ''}"
    scoring = calculate_match_score(
        candidate_skills=current_user.skills or [],
        candidate_experience_years=current_user.experience_years or 0.0,
        candidate_text=cand_text,
        required_skills=job.required_skills or [],
        preferred_skills=job.preferred_skills or [],
        experience_required=job.experience_required or 0,
        job_description=job.description,
    )

    application = Application(
        job_id=job.id,
        candidate_id=current_user.id,
        recruiter_id=job.recruiter_id,
        resume_snapshot_path=current_user.resume_path,
        match_score=scoring["match_score"],
        match_breakdown=scoring,
        matched_skills=scoring["matched_skills"],
        missing_skills=scoring["missing_skills"],
        status="pending",
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    # Notify Recruiter
    create_notification(
        db=db,
        user_id=job.recruiter_id,
        title="New Application Received",
        message=f"{current_user.name} applied for {job.title} with a {scoring['match_score']}% ATS match.",
        notification_type="application_status",
        related_id=str(application.id),
    )

    return application


@router.get("/applications/candidate", response_model=List[ApplicationResponse])
def get_candidate_applications_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    """Retrieve all jobs applied by the current candidate."""
    apps = (
        db.query(Application)
        .filter(Application.candidate_id == current_user.id)
        .order_by(Application.applied_at.desc())
        .all()
    )
    return apps


@router.get("/jobs/{job_id}/applications", response_model=List[ApplicationResponse])
def get_job_applications(
    job_id: UUID,
    sort_by: Optional[str] = "score",  # "score" or "date"
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    """
    Recruiter applicant screening view for a specific job.
    Sorted by ATS match score by default.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    if job.recruiter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to view applicants for this job")

    query = db.query(Application).filter(Application.job_id == job_id)
    if sort_by == "score":
        query = query.order_by(Application.match_score.desc())
    else:
        query = query.order_by(Application.applied_at.desc())

    return query.all()


@router.get("/applications/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get details of a specific application."""
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    # Authorize: candidate who applied or recruiter who owns the job
    if current_user.role == "candidate" and application.candidate_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")
    if current_user.role == "recruiter" and application.recruiter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")

    return application


@router.patch("/applications/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: UUID,
    status_in: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    """
    Recruiter updates applicant status (e.g., reviewed, shortlisted, interview, rejected, accepted).
    Automatically sends in-app notification to candidate.
    """
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    if application.recruiter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to modify this application")

    application.status = status_in.status
    db.commit()
    db.refresh(application)

    # Notify Candidate
    create_notification(
        db=db,
        user_id=application.candidate_id,
        title="Application Status Updated",
        message=f"Your application for {application.job.title} was updated to '{status_in.status.capitalize()}'.",
        notification_type="application_status",
        related_id=str(application.id),
    )

    return application
