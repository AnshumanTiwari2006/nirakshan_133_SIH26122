from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.api import reports, matching, review, schedule, dashboard

router = APIRouter()
router.include_router(reports.router, prefix="/reports", tags=["reports"])
router.include_router(matching.router, prefix="/matching", tags=["matching"])
router.include_router(review.router, prefix="/review", tags=["review"])
router.include_router(schedule.router, prefix="/schedule", tags=["schedule"])
router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])