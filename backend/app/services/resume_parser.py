import os
import logging
from typing import Dict, Any, Tuple
import pdfplumber
import docx
try:
    from pypdf import PdfReader
except ImportError:
    from PyPDF2 import PdfReader

from app.services.gemini_service import parse_resume_with_gemini
from app.utils.skill_normalizer import normalize_skill_list

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF using PDFPlumber with PyPDF fallback."""
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        if text.strip():
            return text
    except Exception as e:
        logger.warning(f"PDFPlumber failed for {file_path}: {e}. Trying PyPDF fallback...")

    # Fallback to PyPDF
    try:
        reader = PdfReader(file_path)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    except Exception as e:
        logger.error(f"PyPDF also failed for {file_path}: {e}")

    return text


def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX file."""
    try:
        doc = docx.Document(file_path)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n".join(paragraphs)
    except Exception as e:
        logger.error(f"Error extracting DOCX {file_path}: {e}")
        return ""


def extract_text_from_file(file_path: str) -> str:
    """Extract text depending on file extension."""
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext in [".docx", ".doc"]:
        return extract_text_from_docx(file_path)
    elif ext == ".txt":
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error reading txt file: {e}")
            return ""
    return ""


def parse_resume_file(file_path: str) -> Dict[str, Any]:
    """Extract text and invoke Gemini parser, then normalize skills."""
    raw_text = extract_text_from_file(file_path)
    if not raw_text.strip():
        logger.warning("Extracted empty text from resume file.")
    
    parsed = parse_resume_with_gemini(raw_text)
    
    # Normalize skills
    if "technical_skills" in parsed and isinstance(parsed["technical_skills"], list):
        parsed["technical_skills"] = normalize_skill_list(parsed["technical_skills"])
    
    return parsed
