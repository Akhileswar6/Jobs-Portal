import math
from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_recruiter
from app.models.user import User
from app.models.job import Job
from app.models.application import Application
from app.models.saved_job import SavedJob
from app.schemas.job import JobCreate, JobUpdate, JobResponse, JobListResponse
from app.services.matcher import calculate_match_score
from app.utils.skill_normalizer import normalize_skill_list

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("", response_model=JobListResponse)
def list_jobs(
    q: Optional[str] = None,
    location: Optional[str] = None,
    skills: Optional[str] = None,
    job_type: Optional[str] = None,
    work_mode: Optional[str] = None,
    experience_max: Optional[int] = None,
    salary_min: Optional[float] = None,
    sort_by: Optional[str] = Query("latest", enum=["latest", "salary", "experience"]),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=200),
    recruiter_id: Optional[UUID] = None,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None),
):
    """
    Search and filter active jobs with pagination.
    Supports candidate match score computation when token is provided.
    """
    query = db.query(Job)
    if not include_inactive:
        query = query.filter(Job.is_active == True)

    if recruiter_id:
        query = query.filter(Job.recruiter_id == recruiter_id)

    if q:
        search_pattern = f"%{q}%"
        query = query.filter(
            or_(
                Job.title.ilike(search_pattern),
                Job.company_name.ilike(search_pattern),
                Job.description.ilike(search_pattern),
            )
        )

    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))

    if job_type:
        query = query.filter(Job.job_type == job_type)

    if work_mode:
        query = query.filter(Job.work_mode == work_mode)

    if experience_max is not None:
        query = query.filter(Job.experience_required <= experience_max)

    if salary_min is not None:
        query = query.filter(
            or_(
                Job.salary_max >= salary_min,
                Job.salary_min >= salary_min,
            )
        )

    if sort_by == "latest":
        query = query.order_by(Job.created_at.desc())
    elif sort_by == "salary":
        query = query.order_by(Job.salary_max.desc().nullslast())
    elif sort_by == "experience":
        query = query.order_by(Job.experience_required.asc())

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    jobs = query.offset((page - 1) * page_size).limit(page_size).all()

    # Convert to response
    items = []
    for job in jobs:
        resp = JobResponse.model_validate(job)
        resp.applications_count = len(job.applications)
        items.append(resp)

    return JobListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/recruiter/my-jobs", response_model=List[JobResponse])
def get_my_recruiter_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    """Retrieve all jobs posted by the logged-in recruiter (both active and inactive)."""
    jobs = (
        db.query(Job)
        .filter(Job.recruiter_id == current_user.id)
        .order_by(Job.created_at.desc())
        .all()
    )
    items = []
    for job in jobs:
        resp = JobResponse.model_validate(job)
        resp.applications_count = len(job.applications)
        items.append(resp)
    return items


@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: UUID,
    db: Session = Depends(get_db),
):
    """Retrieve full details of a specific job."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    resp = JobResponse.model_validate(job)
    resp.applications_count = len(job.applications)
    return resp


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_in: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    """Create a new job posting for the recruiter."""
    normalized_req = normalize_skill_list(job_in.required_skills)
    normalized_pref = normalize_skill_list(job_in.preferred_skills)

    job = Job(
        recruiter_id=current_user.id,
        title=job_in.title,
        company_name=job_in.company_name or current_user.company_name or "Company",
        description=job_in.description,
        responsibilities=job_in.responsibilities,
        required_skills=normalized_req,
        preferred_skills=normalized_pref,
        location=job_in.location,
        job_type=job_in.job_type,
        work_mode=job_in.work_mode,
        salary_min=job_in.salary_min,
        salary_max=job_in.salary_max,
        experience_required=job_in.experience_required,
        education_required=job_in.education_required,
        application_deadline=job_in.application_deadline,
        is_active=True,
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    resp = JobResponse.model_validate(job)
    resp.applications_count = 0
    return resp


@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: UUID,
    job_in: JobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    """Update a job posting (Recruiter must own the job). Recalculates match scores."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    if job.recruiter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to edit this job")

    if job_in.title is not None:
        job.title = job_in.title
    if job_in.company_name is not None:
        job.company_name = job_in.company_name
    if job_in.description is not None:
        job.description = job_in.description
    if job_in.responsibilities is not None:
        job.responsibilities = job_in.responsibilities
    if job_in.required_skills is not None:
        job.required_skills = normalize_skill_list(job_in.required_skills)
    if job_in.preferred_skills is not None:
        job.preferred_skills = normalize_skill_list(job_in.preferred_skills)
    if job_in.location is not None:
        job.location = job_in.location
    if job_in.job_type is not None:
        job.job_type = job_in.job_type
    if job_in.work_mode is not None:
        job.work_mode = job_in.work_mode
    if job_in.salary_min is not None:
        job.salary_min = job_in.salary_min
    if job_in.salary_max is not None:
        job.salary_max = job_in.salary_max
    if job_in.experience_required is not None:
        job.experience_required = job_in.experience_required
    if job_in.education_required is not None:
        job.education_required = job_in.education_required
    if job_in.application_deadline is not None:
        job.application_deadline = job_in.application_deadline
    if job_in.is_active is not None:
        job.is_active = job_in.is_active

    db.commit()
    db.refresh(job)

    # Recalculate matching scores for existing applicants
    for app in job.applications:
        cand = app.candidate
        if cand:
            scoring = calculate_match_score(
                candidate_skills=cand.skills or [],
                candidate_experience_years=cand.experience_years or 0.0,
                candidate_text=f"{cand.name} {cand.location}",
                required_skills=job.required_skills or [],
                preferred_skills=job.preferred_skills or [],
                experience_required=job.experience_required or 0,
                job_description=job.description,
            )
            app.match_score = scoring["match_score"]
            app.match_breakdown = scoring
            app.matched_skills = scoring["matched_skills"]
            app.missing_skills = scoring["missing_skills"]

    db.commit()

    resp = JobResponse.model_validate(job)
    resp.applications_count = len(job.applications)
    return resp


@router.delete("/{job_id}", status_code=status.HTTP_200_OK)
def delete_job(
    job_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    """Deactivate or remove a job posting."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    if job.recruiter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to delete this job")

    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}

