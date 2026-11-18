import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Text, DateTime, JSON, Uuid
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="candidate")  # "candidate" or "recruiter"
    phone = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    profile_image = Column(String(500), nullable=True)
    
    # Recruiter fields
    company_name = Column(String(255), nullable=True)
    company_website = Column(String(500), nullable=True)
    company_description = Column(Text, nullable=True)
    company_logo = Column(String(500), nullable=True)
    company_email = Column(String(255), nullable=True)
    industry = Column(String(100), nullable=True)
    company_linkedin_url = Column(String(500), nullable=True)
    company_type = Column(String(100), nullable=True)
    designation = Column(String(150), nullable=True)
    department = Column(String(150), nullable=True)
    
    # Candidate fields
    skills = Column(JSON, default=list, nullable=False)
    experience_years = Column(Float, default=0.0, nullable=False)
    education = Column(JSON, default=list, nullable=False)
    resume_path = Column(String(500), nullable=True)
    resume_parsed_data = Column(JSON, nullable=True)
    date_of_birth = Column(String(50), nullable=True)
    gender = Column(String(50), nullable=True)
    preferred_locations = Column(JSON, default=list, nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    portfolio_url = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    posted_jobs = relationship("Job", back_populates="recruiter", cascade="all, delete-orphan")
    applications = relationship("Application", foreign_keys="Application.candidate_id", back_populates="candidate", cascade="all, delete-orphan")
    received_applications = relationship("Application", foreign_keys="Application.recruiter_id", back_populates="recruiter", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    saved_jobs = relationship("SavedJob", back_populates="candidate", cascade="all, delete-orphan")
    career_roadmaps = relationship("CareerRoadmap", back_populates="candidate", cascade="all, delete-orphan")

