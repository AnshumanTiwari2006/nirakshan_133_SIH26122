from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.database.models import Report, Extraction, Match
from backend.services.matching_service import matching_service
from backend.services.confidence_service import confidence_service
from backend.models.match import MatchResponse

router = APIRouter()

@router.post("/{report_id}/rematch", response_model=MatchResponse)
async def rematch_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(404, "Report not found")
    
    extraction = db.query(Extraction).filter(Extraction.report_id == report_id).first()
    if not extraction:
        raise HTTPException(404, "Extraction not found")
    
    db.query(Match).filter(Match.report_id == report_id).delete()
    
    matches = matching_service.match(db, {
        "discipline": extraction.discipline,
        "asset": extraction.asset,
        "action": extraction.action,
        "location": extraction.location,
        "start_time": extraction.start_time,
        "end_time": extraction.end_time
    })
    
    for match in matches:
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
    
    db.commit()
    
    evaluation = confidence_service.evaluate(matches)
    
    return MatchResponse(
        report_id=report_id,
        matches=matches,
        top_match=evaluation["top_match"],
        requires_review=evaluation["requires_review"],
        auto_approve=evaluation["auto_approve"]
    )