import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.database.models import WBSActivity, ScheduleUpdate, Report

logger = logging.getLogger(__name__)

class ScheduleService:
    def get_schedule_state(self, db: Session) -> List[Dict[str, Any]]:
        wbs_activities = db.query(WBSActivity).order_by(WBSActivity.wbs_code).all()
        updates = db.query(ScheduleUpdate).all()
        update_map = {u.wbs_code: u for u in updates}
        
        result = []
        for wbs in wbs_activities:
            update = update_map.get(wbs.wbs_code)
            result.append({
                "wbs_code": wbs.wbs_code,
                "level": wbs.level,
                "discipline": wbs.discipline,
                "activity_name": wbs.activity_name,
                "spec_ref": wbs.spec_ref,
                "planned_start": wbs.planned_start,
                "planned_finish": wbs.planned_finish,
                "duration_days": wbs.duration_days,
                "status": update.status if update else "Not Started",
                "actual_start": update.actual_start if update else None,
                "actual_finish": update.actual_finish if update else None,
                "quantity": update.quantity if update else None,
                "unit": update.unit if update else None,
                "approved_by": update.approved_by if update else None,
                "updated_at": update.updated_at if update else None
            })
        return result
    
    def get_schedule_summary(self, db: Session) -> Dict[str, Any]:
        total = db.query(WBSActivity).count()
        completed = db.query(ScheduleUpdate).filter(ScheduleUpdate.status == "Completed").count()
        in_progress = db.query(ScheduleUpdate).filter(ScheduleUpdate.status == "In Progress").count()
        
        by_discipline = {}
        wbs_activities = db.query(WBSActivity).all()
        for wbs in wbs_activities:
            if wbs.discipline not in by_discipline:
                by_discipline[wbs.discipline] = {"total": 0, "completed": 0}
            by_discipline[wbs.discipline]["total"] += 1
        
        updates = db.query(ScheduleUpdate).filter(ScheduleUpdate.status == "Completed").all()
        for update in updates:
            if update.wbs_code in [w.wbs_code for w in wbs_activities]:
                wbs = next(w for w in wbs_activities if w.wbs_code == update.wbs_code)
                if wbs.discipline in by_discipline:
                    by_discipline[wbs.discipline]["completed"] += 1
        
        return {
            "total_activities": total,
            "completed": completed,
            "in_progress": in_progress,
            "not_started": total - completed - in_progress,
            "completion_rate": completed / total if total > 0 else 0,
            "by_discipline": by_discipline
        }
    
    def get_activity_history(self, db: Session, wbs_code: str) -> List[Dict[str, Any]]:
        updates = db.query(ScheduleUpdate).filter(ScheduleUpdate.wbs_code == wbs_code).order_by(ScheduleUpdate.updated_at.desc()).all()
        return [
            {
                "report_id": u.report_id,
                "status": u.status,
                "actual_start": u.actual_start,
                "actual_finish": u.actual_finish,
                "quantity": u.quantity,
                "approved_by": u.approved_by,
                "source_report_id": u.source_report_id,
                "updated_at": u.updated_at
            }
            for u in updates
        ]

schedule_service = ScheduleService()