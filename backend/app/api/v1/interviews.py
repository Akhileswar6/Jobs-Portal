from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_recruiter
from app.models.user import User
from app.models.application import Application
from app.models.interview import Interview
from app.schemas.interview import (
    InterviewCreate,
    InterviewUpdate,
    InterviewResponse,
)
from app.services.notification_service import create_notification

router = APIRouter(prefix="/interviews", tags=["Interviews"])


@router.post("", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
def schedule_interview(
    interview_in: InterviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    """
    Schedule an interview with a candidate for an application.
    Updates application status to 'interview' and creates notification.
    """
    application = db.query(Application).filter(Application.id == interview_in.application_id).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    if application.recruiter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to schedule interviews for this application")

    interview = Interview(
        application_id=application.id,
        job_id=application.job_id,
        candidate_id=application.candidate_id,
        recruiter_id=current_user.id,
        scheduled_date=interview_in.scheduled_date,
        scheduled_time=interview_in.scheduled_time,
        meeting_link=interview_in.meeting_link,
        interview_type=interview_in.interview_type,
        notes=interview_in.notes,
        status="scheduled",
    )
    db.add(interview)

    # Update application status to interview
    application.status = "interview"

    db.commit()
    db.refresh(interview)

    # Notify Candidate
    create_notification(
        db=db,
        user_id=application.candidate_id,
        title="Interview Scheduled!",
        message=f"An interview for '{application.job.title}' is scheduled on {interview_in.scheduled_date} at {interview_in.scheduled_time}.",
        notification_type="interview_scheduled",
        related_id=str(interview.id),
    )

    return interview


@router.get("", response_model=List[InterviewResponse])
def list_interviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List scheduled interviews for current candidate or recruiter."""
    if current_user.role == "recruiter":
        interviews = (
            db.query(Interview)
            .filter(Interview.recruiter_id == current_user.id)
            .order_by(Interview.created_at.desc())
            .all()
        )
    else:
        interviews = (
            db.query(Interview)
            .filter(Interview.candidate_id == current_user.id)
            .order_by(Interview.created_at.desc())
            .all()
        )
    return interviews


@router.put("/{interview_id}", response_model=InterviewResponse)
def update_interview(
    interview_id: UUID,
    interview_in: InterviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update interview date/time/link/status."""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")

    if current_user.role == "recruiter" and interview.recruiter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")
    if current_user.role == "candidate" and interview.candidate_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")

    if interview_in.scheduled_date is not None:
        interview.scheduled_date = interview_in.scheduled_date
    if interview_in.scheduled_time is not None:
        interview.scheduled_time = interview_in.scheduled_time
    if interview_in.meeting_link is not None:
        interview.meeting_link = interview_in.meeting_link
    if interview_in.interview_type is not None:
        interview.interview_type = interview_in.interview_type
    if interview_in.notes is not None:
        interview.notes = interview_in.notes
    if interview_in.status is not None:
        interview.status = interview_in.status

    db.commit()
    db.refresh(interview)
    return interview


@router.delete("/{interview_id}")
def cancel_interview(
    interview_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    """Cancel an interview."""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")

    if interview.recruiter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")

    db.delete(interview)
    db.commit()
    return {"message": "Interview cancelled successfully"}

