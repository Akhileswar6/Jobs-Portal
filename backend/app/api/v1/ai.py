from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_candidate
from app.models.user import User
from app.models.career_roadmap import CareerRoadmap
from app.schemas.ai import (
    AnalyzeResumeRequest,
    GenerateRoadmapRequest,
    CareerRoadmapResponse,
    AnalyzeJobDescriptionRequest,
    AnalyzedJobDescriptionResponse,
)
from app.schemas.resume import ParsedResumeData
from app.services.gemini_service import (
    parse_resume_with_gemini,
    generate_career_roadmap_with_gemini,
    analyze_job_description_with_gemini,
)
from app.utils.skill_normalizer import normalize_skill_list

router = APIRouter(prefix="/ai", tags=["AI Features"])


@router.post("/analyze-resume", response_model=ParsedResumeData)
def analyze_resume(
    req: AnalyzeResumeRequest,
    current_user: User = Depends(get_current_user),
):
    """Analyze raw resume text using Gemini AI."""
    text = req.resume_text or ""
    if not text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Resume text is required")

    parsed = parse_resume_with_gemini(text)
    if "technical_skills" in parsed and isinstance(parsed["technical_skills"], list):
        parsed["technical_skills"] = normalize_skill_list(parsed["technical_skills"])

    return ParsedResumeData(**parsed)


@router.post("/generate-roadmap", response_model=CareerRoadmapResponse)
def generate_career_roadmap(
    req: GenerateRoadmapRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    """
    Generate an 8-12 milestone career roadmap and skill gap analysis using Gemini AI
    tailored to candidate's current skills and target role. Persists to database.
    """
    skills = req.current_skills if req.current_skills is not None else (current_user.skills or [])
    experience = req.experience_years if req.experience_years is not None else (current_user.experience_years or 0.0)

    roadmap_data = generate_career_roadmap_with_gemini(
        target_role=req.target_role,
        current_skills=skills,
        experience_years=experience,
    )

    # Save to database
    record = CareerRoadmap(
        candidate_id=current_user.id,
        target_role=req.target_role,
        current_skills=roadmap_data.get("current_skills", []),
        missing_skills=roadmap_data.get("missing_skills", []),
        milestones=roadmap_data.get("milestones", []),
        recommendations=roadmap_data.get("recommendations", ""),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return CareerRoadmapResponse(
        id=record.id,
        target_role=record.target_role,
        current_skills=record.current_skills,
        missing_skills=record.missing_skills,
        milestones=record.milestones,
        recommendations=record.recommendations,
        created_at=record.created_at,
    )


@router.get("/roadmaps", response_model=List[CareerRoadmapResponse])
def get_candidate_roadmaps(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    """Retrieve saved career roadmaps for the current candidate."""
    roadmaps = (
        db.query(CareerRoadmap)
        .filter(CareerRoadmap.candidate_id == current_user.id)
        .order_by(CareerRoadmap.created_at.desc())
        .all()
    )
    return roadmaps


@router.post("/analyze-job-description", response_model=AnalyzedJobDescriptionResponse)
def analyze_job_description(
    req: AnalyzeJobDescriptionRequest,
    current_user: User = Depends(get_current_user),
):
    """Extract required skills, preferred skills, experience, and responsibilities using Gemini AI."""
    if not req.job_description.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Job description text is required")

    result = analyze_job_description_with_gemini(req.job_description)
    if "required_skills" in result and isinstance(result["required_skills"], list):
        result["required_skills"] = normalize_skill_list(result["required_skills"])
    if "preferred_skills" in result and isinstance(result["preferred_skills"], list):
        result["preferred_skills"] = normalize_skill_list(result["preferred_skills"])

    return AnalyzedJobDescriptionResponse(**result)

