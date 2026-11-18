import os
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.gemini_service import parse_resume_with_gemini
from app.schemas.resume import ParsedResumeData

router = APIRouter(prefix="/resume", tags=["Resume"])


def get_file_media_type(filename: str) -> str:
    lower = filename.lower()
    if lower.endswith(".pdf"):
        return "application/pdf"
    elif lower.endswith(".docx"):
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    elif lower.endswith(".doc"):
        return "application/msword"
    elif lower.endswith(".txt"):
        return "text/plain"
    return "application/octet-stream"


@router.get("/my-resume")
def get_my_resume(
    current_user: User = Depends(get_current_user),
):
    """Retrieve and stream current authenticated user's resume."""
    if not current_user.resume_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found on server")

    if not os.path.exists(current_user.resume_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume file does not exist on disk")

    filename = os.path.basename(current_user.resume_path)
    return FileResponse(
        path=current_user.resume_path,
        filename=filename,
        media_type=get_file_media_type(filename),
        content_disposition_type="inline",
    )


@router.get("/download/{candidate_id}")
def download_resume(
    candidate_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Download or stream candidate resume file.
    Accessible by candidate themselves or recruiter screening applications.
    """
    candidate = db.query(User).filter(User.id == candidate_id).first()
    if not candidate or not candidate.resume_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found on server")

    if not os.path.exists(candidate.resume_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume file does not exist on disk")

    filename = os.path.basename(candidate.resume_path)
    return FileResponse(
        path=candidate.resume_path,
        filename=filename,
        media_type=get_file_media_type(filename),
        content_disposition_type="inline",
    )


@router.post("/parse-text", response_model=ParsedResumeData)
def parse_raw_text(
    payload: dict,
    current_user: User = Depends(get_current_user),
):
    """Parse raw resume text using Gemini AI."""
    raw_text = payload.get("text", "")
    if not raw_text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Text cannot be empty")

    parsed = parse_resume_with_gemini(raw_text)
    return ParsedResumeData(**parsed)

