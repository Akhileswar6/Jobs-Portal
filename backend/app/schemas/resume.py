from typing import Optional, List, Any
from pydantic import BaseModel


class ResumeEducationItem(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_year: Optional[str] = None
    end_year: Optional[str] = None
    grade: Optional[str] = None


class ResumeExperienceItem(BaseModel):
    company: Optional[str] = None
    title: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: Optional[bool] = False
    description: Optional[str] = None


class ResumeProjectItem(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    technologies: List[str] = []
    link: Optional[str] = None


class ResumeCertificationItem(BaseModel):
    name: Optional[str] = None
    issuer: Optional[str] = None
    year: Optional[str] = None


class ParsedResumeData(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    summary: Optional[str] = None
    technical_skills: List[str] = []
    soft_skills: List[str] = []
    education: List[ResumeEducationItem] = []
    work_experience: List[ResumeExperienceItem] = []
    projects: List[ResumeProjectItem] = []
    certifications: List[ResumeCertificationItem] = []
    total_experience_years: float = 0.0


class ResumeUploadResponse(BaseModel):
    filename: str
    file_path: str
    parsed_data: ParsedResumeData
    message: str

