from backend import database
import logging
from typing import List, Dict, Any, Optional

from sqlalchemy.orm import Session

from backend.database.models import (
    Review,
    Report,
    ScheduleUpdate,
    WBSActivity,
    Extraction,
    Match,
)

from backend.models.review import ReviewDecision, ReviewRequest
from backend.services.confidence_service import confidence_service


logger = logging.getLogger(__name__)


class ReviewService:
    def __init__(self):
        pass

    def submit_review(
        self,
        db: Session,
        request: ReviewRequest
    ) -> Review:

        review = Review(
            report_id=request.report_id,
            original_wbs=request.original_wbs,
            corrected_wbs=request.corrected_wbs,
            decision=request.decision.value,
            reviewer=request.reviewer,
            comments=request.comments
        )

        db.add(review)
        db.flush()

        if request.decision == ReviewDecision.APPROVE:
            self._create_schedule_update(
                db,
                request.report_id,
                request.original_wbs,
                request.reviewer
            )

        elif (
            request.decision == ReviewDecision.CORRECT
            and request.corrected_wbs
        ):
            self._create_schedule_update(
                db,
                request.report_id,
                request.corrected_wbs,
                request.reviewer
            )

        report = (
            db.query(Report)
            .filter(Report.id == request.report_id)
            .first()
        )

        if report:
            report.status = "completed"

        return review

    def _create_schedule_update(
        self,
        db: Session,
        report_id: int,
        wbs_code: str,
        approved_by: str
    ):
        report = (
            db.query(Report)
            .filter(Report.id == report_id)
            .first()
        )

        if not report:
            return

        extraction = (
            db.query(Extraction)
            .filter(Extraction.report_id == report_id)
            .first()
        )

        update = ScheduleUpdate(
            report_id=report_id,
            wbs_code=wbs_code,
            status="Completed",
            actual_finish=report.submitted_at,
            approved_by=approved_by,
            source_report_id=report.source_id
        )

        db.add(update)

        wbs = (
            db.query(WBSActivity)
            .filter(WBSActivity.wbs_code == wbs_code)
            .first()
        )

        if wbs:
            pass

    def get_pending_reviews(
        self,
        db: Session,
        limit: int = 50
    ) -> List[Dict[str, Any]]:

        reports = (
            db.query(Report)
            .filter(
                Report.status.notin_(
                    ["completed", "failed"]
                )
            )
            .order_by(
                Report.submitted_at.desc()
            )
            .limit(limit)
            .all()
        )

        pending = []

        for report in reports:

            extraction = (
                db.query(Extraction)
                .filter(
                    Extraction.report_id == report.id
                )
                .first()
            )

            matches = (
                db.query(Match)
                .filter(
                    Match.report_id == report.id
                )
                .order_by(
                    Match.rank
                )
                .limit(3)
                .all()
            )

            if not extraction or not matches:
                continue

            # Do not show reports that have already been reviewed.
            existing_review = (
                db.query(Review)
                .filter(
                    Review.report_id == report.id
                )
                .first()
            )

            if existing_review:
                continue

            top_match = matches[0]

            pending.append(
                {
                    "report_id": report.id,
                    "source_id": report.source_id,
                    "supervisor": report.supervisor,
                    "confidence": top_match.final_confidence,
                    "top_match": top_match.wbs_code,
                    "extracted_info": {
                        "discipline": extraction.discipline,
                        "asset": extraction.asset,
                        "action": extraction.action,
                        "location": extraction.location,
                    },
                    "submitted_at": report.submitted_at,
                }
            )

        return pending


review_service = ReviewService()