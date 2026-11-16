from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel
from app.schemas.job import JobResponse
from app.schemas.user import UserResponse


class InterviewCreate(BaseModel):
    application_id: UUID
    scheduled_date: str
    scheduled_time: str
    meeting_link: Optional[str] = None
    interview_type: str = "technical"
    notes: Optional[str] = None


class InterviewUpdate(BaseModel):
    scheduled_date: Optional[str] = None
    scheduled_time: Optional[str] = None
    meeting_link: Optional[str] = None
    interview_type: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class InterviewResponse(BaseModel):
    id: UUID
    application_id: UUID
    job_id: UUID
    candidate_id: UUID
    recruiter_id: UUID
    scheduled_date: str
    scheduled_time: str
    meeting_link: Optional[str] = None
    interview_type: str
    notes: Optional[str] = None
    status: str
    created_at: datetime
    job: Optional[JobResponse] = None
    candidate: Optional[UserResponse] = None

    class Config:
        from_attributes = True

