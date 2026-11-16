from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class AnalyzeResumeRequest(BaseModel):
    resume_text: Optional[str] = None


class CareerMilestone(BaseModel):
    phase: int
    title: str
    timeline: str
    description: str
    skills_to_learn: List[str] = []
    recommended_courses: List[str] = []
    hands_on_project: str


class GenerateRoadmapRequest(BaseModel):
    target_role: str
    current_skills: Optional[List[str]] = None
    experience_years: Optional[float] = None


class CareerRoadmapResponse(BaseModel):
    id: Optional[UUID] = None
    target_role: str
    current_skills: List[str]
    missing_skills: List[str]
    milestones: List[CareerMilestone]
    recommendations: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AnalyzeJobDescriptionRequest(BaseModel):
    job_description: str


class AnalyzedJobDescriptionResponse(BaseModel):
    title: Optional[str] = None
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    experience_years_required: int = 0
    responsibilities: List[str] = []
    keywords: List[str] = []
    summary: str

