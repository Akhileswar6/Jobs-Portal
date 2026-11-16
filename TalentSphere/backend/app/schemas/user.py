from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    phone: Optional[str] = None
    location: Optional[str] = None
    profile_image: Optional[str] = None


class CandidateProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    profile_image: Optional[str] = None
    skills: Optional[List[str]] = None
    experience_years: Optional[float] = None
    education: Optional[List[Any]] = None
    resume_parsed_data: Optional[dict] = None


class RecruiterProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    profile_image: Optional[str] = None
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    company_description: Optional[str] = None


class UserResponse(UserBase):
    id: UUID
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    company_description: Optional[str] = None
    skills: List[str] = []
    experience_years: float = 0.0
    education: List[Any] = []
    resume_path: Optional[str] = None
    resume_parsed_data: Optional[dict] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

