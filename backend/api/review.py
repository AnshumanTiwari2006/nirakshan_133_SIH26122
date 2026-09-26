from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database.database import get_db
from backend.database.models import Review, Report
from backend.services.review_service import review_service
from backend.models.review import ReviewRequest, ReviewResponse, ReviewQueueItem

router = APIRouter()

@router.post("", response_model=ReviewResponse)
async def submit_review(request: ReviewRequest, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == request.report_id).first()
    if not report:
        raise HTTPException(404, "Report not found")
    
    review = review_service.submit_review(db, request)
    db.commit()
    return review

@router.get("/queue", response_model=List[ReviewQueueItem])
async def get_review_queue(limit: int = 50, db: Session = Depends(get_db)):
    return review_service.get_pending_reviews(db, limit)

@router.get("/{report_id}", response_model=List[ReviewResponse])
async def get_review_history(report_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.report_id == report_id).order_by(Review.reviewed_at.desc()).all()
    return reviews