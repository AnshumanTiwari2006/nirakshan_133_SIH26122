from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.services.schedule_service import schedule_service

router = APIRouter()

@router.get("")
async def get_schedule(db: Session = Depends(get_db)):
    return schedule_service.get_schedule_state(db)

@router.get("/summary")
async def get_schedule_summary(db: Session = Depends(get_db)):
    return schedule_service.get_schedule_summary(db)

@router.get("/{wbs_code}/history")
async def get_activity_history(wbs_code: str, db: Session = Depends(get_db)):
    return schedule_service.get_activity_history(db, wbs_code)