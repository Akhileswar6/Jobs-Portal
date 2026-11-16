import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.api.v1.auth import router as auth_router
from app.api.v1.candidate import router as candidate_router
from app.api.v1.recruiter import router as recruiter_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.applications import router as applications_router
from app.api.v1.interviews import router as interviews_router
from app.api.v1.resume import router as resume_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.ai import router as ai_router

# Initialize FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="TalentSphere AI-Powered Applicant Tracking System (ATS) & Job Board API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Register API v1 Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(candidate_router, prefix=settings.API_V1_STR)
app.include_router(recruiter_router, prefix=settings.API_V1_STR)
app.include_router(jobs_router, prefix=settings.API_V1_STR)
app.include_router(applications_router, prefix=settings.API_V1_STR)
app.include_router(interviews_router, prefix=settings.API_V1_STR)
app.include_router(resume_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "app": "TalentSphere API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}

