import os
import re
import uuid
from fastapi import HTTPException, UploadFile, status
from app.core.config import settings


def sanitize_filename(filename: str) -> str:
    """Generate a collision-resistant safe filename."""
    base, ext = os.path.splitext(filename)
    clean_base = re.sub(r'[^a-zA-Z0-9_-]', '_', base)[:50]
    unique_suffix = uuid.uuid4().hex[:8]
    clean_ext = ext.lower()
    return f"{clean_base}_{unique_suffix}{clean_ext}"


def validate_file(file: UploadFile) -> str:
    """Validate uploaded resume file extension and size."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File name is missing",
        )

    ext = os.path.splitext(file.filename)[1].lower().lstrip(".")
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type .{ext}. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}",
        )

    # Validate file size if content_length header is available
    if file.size and file.size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB",
        )

    return ext

