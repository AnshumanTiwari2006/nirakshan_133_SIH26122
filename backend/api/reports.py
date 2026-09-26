# from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, BackgroundTasks
# from sqlalchemy.orm import Session
# from typing import List, Optional
# from backend.database.database import get_db
# from backend.database.models import Report, Extraction
# from backend.models.report import ReportUploadRequest, ChatInputRequest, ReportResponse, ReportListResponse
# from backend.services.ingestion_service import ingestion_service
# from backend.services.extraction_service import extraction_service
# from backend.services.matching_service import matching_service
# from backend.services.confidence_service import confidence_service
# import uuid
# from datetime import datetime

# router = APIRouter()

# @router.post("/upload", response_model=ReportResponse)
# async def upload_report(
#     background_tasks: BackgroundTasks,
#     source_id: str = Form(...),
#     source_type: str = Form(...),
#     file: UploadFile = File(...),
#     supervisor: Optional[str] = Form(None),
#     db: Session = Depends(get_db)
# ):
#     content = await file.read()
#     raw_text = ingestion_service.parse(content, source_type)
    
#     report = Report(
#         source_id=source_id,
#         source_type=source_type.upper(),
#         raw_content=raw_text,
#         file_name=file.filename,
#         supervisor=supervisor,
#         status="processing"
#     )
#     db.add(report)
#     db.flush()
    
#     background_tasks.add_task(process_report, report.id, raw_text)
    
#     return report

# @router.post("/chat", response_model=ReportResponse)
# async def chat_input(
#     background_tasks: BackgroundTasks,
#     request: ChatInputRequest,
#     db: Session = Depends(get_db)
# ):
#     source_id = request.source_id or f"CHAT-{uuid.uuid4().hex[:8]}"
    
#     report = Report(
#         source_id=source_id,
#         source_type="CHAT",
#         raw_content=request.message,
#         supervisor=request.supervisor,
#         status="processing"
#     )
#     db.add(report)
#     db.flush()
    
#     background_tasks.add_task(process_report, report.id, request.message)
    
#     return report

# async def process_report(report_id: int, raw_text: str):
#     from backend.database.database import SessionLocal
#     db = SessionLocal()
#     try:
#         extraction = await extraction_service.extract(raw_text)
        
#         ext = Extraction(
#             report_id=report_id,
#             discipline=extraction.discipline,
#             asset=extraction.asset,
#             action=extraction.action,
#             location=extraction.location,
#             start_time=extraction.start_time,
#             end_time=extraction.end_time,
#             quantity=extraction.quantity,
#             unit=extraction.unit,
#             completion_status=extraction.completion_status,
#             confidence=extraction.confidence
#         )
#         db.add(ext)
        
#         matches = matching_service.match(db, extraction.model_dump())
        
#         for match in matches:
#             from backend.database.models import Match
#             m = Match(
#                 report_id=report_id,
#                 wbs_code=match.wbs_code,
#                 semantic_score=match.semantic_score,
#                 discipline_score=match.discipline_score,
#                 asset_score=match.asset_score,
#                 action_score=match.action_score,
#                 temporal_score=match.temporal_score,
#                 final_confidence=match.final_confidence,
#                 rank=match.rank,
#                 explanation=match.explanation
#             )
#             db.add(m)
        
#         from backend.services.confidence_service import confidence_service
#         evaluation = confidence_service.evaluate(matches)
        
#         report = db.query(Report).filter(Report.id == report_id).first()
#         if report:
#             if evaluation["auto_approve"]:
#                 report.status = "completed"
#                 if evaluation["top_match"]:
#                     from backend.services.review_service import review_service
#                     review_service._create_schedule_update(db, report_id, evaluation["top_match"].wbs_code, "AUTO")
#             else:
#                 report.status = "processing"
        
#         report.processed_at = datetime.utcnow().isoformat()
#         db.commit()
#     except Exception as e:
#         report = db.query(Report).filter(Report.id == report_id).first()
#         if report:
#             report.status = "failed"
#         db.commit()
#     finally:
#         db.close()

# @router.get("/{report_id}/extraction")
# async def get_extraction(report_id: int, db: Session = Depends(get_db)):
#     extraction = db.query(Extraction).filter(Extraction.report_id == report_id).first()
#     if not extraction:
#         raise HTTPException(404, "Extraction not found")
#     return extraction

# @router.get("/{report_id}/matches")
# async def get_matches(report_id: int, db: Session = Depends(get_db)):
#     from backend.database.models import Match
#     matches = db.query(Match).filter(Match.report_id == report_id).order_by(Match.rank).all()
#     return matches

# @router.get("", response_model=ReportListResponse)
# async def list_reports(
#     page: int = 1,
#     page_size: int = 20,
#     status: Optional[str] = None,
#     db: Session = Depends(get_db)
# ):
#     query = db.query(Report)
#     if status:
#         query = query.filter(Report.status == status)
    
#     total = query.count()
#     reports = query.order_by(Report.submitted_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
#     return ReportListResponse(
#         reports=reports,
#         total=total,
#         page=page,
#         page_size=page_size
#     )











from backend.database import database
from _pytest import debugging
from _pytest import debugging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database.database import get_db
from backend.database.models import Report, Extraction
from backend.models.report import ReportUploadRequest, ChatInputRequest, ReportResponse, ReportListResponse
from backend.services.ingestion_service import ingestion_service
from backend.services.extraction_service import extraction_service
from backend.services.matching_service import matching_service
from backend.services.confidence_service import confidence_service
import uuid
import os
import logging
from pathlib import Path
from datetime import datetime
from fastapi.responses import FileResponse

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/upload", response_model=ReportResponse)
async def upload_report(
    background_tasks: BackgroundTasks,
    source_id: str = Form(...),
    source_type: str = Form(...),
    file: UploadFile = File(...),
    supervisor: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    content = await file.read()
    raw_text = ingestion_service.parse(content, source_type)
    
    report = Report(
        source_id=source_id,
        source_type=source_type.upper(),
        raw_content=raw_text,
        file_name=file.filename,
        supervisor=supervisor,
        status="processing"
    )
    db.add(report)
    db.flush()
    db.commit()
    db.refresh(report)

    # Keep the original upload so the UI can offer a View/Download action.
    upload_dir = Path("data") / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    safe_name = Path(file.filename or "report").name
    saved_path = upload_dir / f"{report.id}_{safe_name}"
    saved_path.write_bytes(content)

    background_tasks.add_task(process_report, report.id, raw_text)
    
    return report

@router.post("/chat", response_model=ReportResponse)
async def chat_input(
    background_tasks: BackgroundTasks,
    request: ChatInputRequest,
    db: Session = Depends(get_db)
):
    source_id = request.source_id or f"CHAT-{uuid.uuid4().hex[:8]}"
    
    report = Report(
        source_id=source_id,
        source_type="CHAT",
        raw_content=request.message,
        supervisor=request.supervisor,
        status="processing"
    )
    db.add(report)
    db.flush()
    db.commit()
    db.refresh(report)
    
    background_tasks.add_task(process_report, report.id, request.message)
    
    return report

async def process_report(report_id: int, raw_text: str):
    from backend.database.database import SessionLocal
    db = SessionLocal()
    try:
        extraction = await extraction_service.extract(raw_text)
        
        ext = Extraction(
            report_id=report_id,
            discipline=extraction.discipline,
            asset=extraction.asset,
            action=extraction.action,
            location=extraction.location,
            start_time=extraction.start_time,
            end_time=extraction.end_time,
            quantity=extraction.quantity,
            unit=extraction.unit,
            completion_status=extraction.completion_status,
            confidence=extraction.confidence
        )
        db.add(ext)
        
        matches = matching_service.match(db, extraction.model_dump())
        
        for match in matches:
            from backend.database.models import Match
            m = Match(
                report_id=report_id,
                wbs_code=match.wbs_code,
                semantic_score=match.semantic_score,
                discipline_score=match.discipline_score,
                asset_score=match.asset_score,
                action_score=match.action_score,
                temporal_score=match.temporal_score,
                final_confidence=match.final_confidence,
                rank=match.rank,
                explanation=match.explanation
            )
            db.add(m)
        
        from backend.services.confidence_service import confidence_service
        evaluation = confidence_service.evaluate(matches)
        
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            raise RuntimeError(f"Report {report_id} not found in database")
        if report:
            if evaluation["auto_approve"]:
                report.status = "completed"
                if evaluation["top_match"]:
                    from backend.services.review_service import review_service
                    review_service._create_schedule_update(db, report_id, evaluation["top_match"].wbs_code, "AUTO")
            else:
                # report.status = "processing"
                report.status = "review"
        
        report.processed_at = datetime.utcnow().isoformat()
        db.commit()
    except Exception as e:
        logger.exception("Report processing failed for report_id=%s", report_id)
        report = db.query(Report).filter(Report.id == report_id).first()
        if report:
            report.status = "failed"
        db.commit()
    finally:
        db.close()


@router.get("/{report_id}/file")
async def get_original_file(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(404, "Report not found")
    if not report.file_name:
        raise HTTPException(404, "Original file not available")

    file_path = Path("data") / "uploads" / f"{report.id}_{Path(report.file_name).name}"
    if not file_path.exists():
        raise HTTPException(404, "Original file not available for this report")

    return FileResponse(file_path, filename=report.file_name, media_type="application/octet-stream")

@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(404, "Report not found")
    return report

@router.get("/{report_id}/extraction")
async def get_extraction(report_id: int, db: Session = Depends(get_db)):
    extraction = db.query(Extraction).filter(Extraction.report_id == report_id).first()
    if not extraction:
        raise HTTPException(404, "Extraction not found")
    return extraction

# @router.get("/{report_id}/matches")
# async def get_matches(report_id: int, db: Session = Depends(get_db)):
#     from backend.database.models import Match
#     matches = db.query(Match).filter(Match.report_id == report_id).order_by(Match.rank).all()
#     return matches

@router.get("/{report_id}/matches")
async def get_matches(
    report_id: int,
    db: Session = Depends(get_db)
):
    from backend.database.models import Match, WBSActivity

    matches = (
        db.query(Match, WBSActivity)
        .join(
            WBSActivity,
            Match.wbs_code == WBSActivity.wbs_code
        )
        .filter(Match.report_id == report_id)
        .order_by(Match.rank)
        .all()
    )

    return [
        {
            "wbs_code": match.wbs_code,
            "activity_name": wbs.activity_name,
            "discipline": wbs.discipline,

            "semantic_score": match.semantic_score,
            "discipline_score": match.discipline_score,
            "asset_score": match.asset_score,
            "action_score": match.action_score,
            "temporal_score": match.temporal_score,

            "final_confidence": match.final_confidence,
            "rank": match.rank,
            "explanation": match.explanation
        }
        for match, wbs in matches
    ]

@router.get("", response_model=ReportListResponse)
async def list_reports(
    page: int = 1,
    page_size: int = 20,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Report)
    if status:
        query = query.filter(Report.status == status)
    
    total = query.count()
    reports = query.order_by(Report.submitted_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    return ReportListResponse(
        reports=reports,
        total=total,
        page=page,
        page_size=page_size
    )