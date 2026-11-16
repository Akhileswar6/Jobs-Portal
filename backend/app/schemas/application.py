from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel
from app.schemas.job import JobResponse
from app.schemas.user import UserResponse


class ApplicationCreate(BaseModel):
    job_id: UUID


class ApplicationStatusUpdate(BaseModel):
    status: str  # pending, reviewed, shortlisted, interview, rejected, accepted


class ApplicationResponse(BaseModel):
    id: UUID
    job_id: UUID
    candidate_id: UUID
    recruiter_id: UUID
    resume_snapshot_path: Optional[str] = None
    match_score: float = 0.0
    match_breakdown: Dict[str, Any] = {}
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    status: str
    applied_at: datetime
    updated_at: datetime
    job: Optional[JobResponse] = None
    candidate: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class ApplicationListResponse(BaseModel):
    items: List[ApplicationResponse]
    total: int
    page: int
    page_size: int

