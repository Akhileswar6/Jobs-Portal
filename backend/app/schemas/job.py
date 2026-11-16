from typing import Optional, List
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class JobBase(BaseModel):
    title: str
    company_name: str
    description: str
    responsibilities: Optional[str] = None
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    location: str
    job_type: str = "Full-time"
    work_mode: str = "Remote"
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    experience_required: int = 0
    education_required: Optional[str] = None
    application_deadline: Optional[datetime] = None


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    title: Optional[str] = None
    company_name: Optional[str] = None
    description: Optional[str] = None
    responsibilities: Optional[str] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    work_mode: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    experience_required: Optional[int] = None
    education_required: Optional[str] = None
    application_deadline: Optional[datetime] = None
    is_active: Optional[bool] = None


class JobResponse(JobBase):
    id: UUID
    recruiter_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    applications_count: Optional[int] = 0
    match_score: Optional[float] = None
    is_saved: Optional[bool] = False

    class Config:
        from_attributes = True


class JobListResponse(BaseModel):
    items: List[JobResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

