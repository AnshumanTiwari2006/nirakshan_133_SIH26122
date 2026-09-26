import logging
from typing import Dict, Any, Tuple
from backend.models.match import MatchDetail

logger = logging.getLogger(__name__)

class ConfidenceService:
    def __init__(self):
        self.auto_approve_threshold = 0.90
        self.human_review_threshold = 0.70
    
    def evaluate(self, matches: list) -> Dict[str, Any]:
        if not matches:
            return {
                "confidence": 0.0,
                "decision": "reject",
                "requires_review": True,
                "auto_approve": False,
                "top_match": None
            }
        
        top_match = matches[0]
        confidence = top_match.final_confidence
        
        if confidence >= self.auto_approve_threshold:
            decision = "auto_approve"
            requires_review = False
            auto_approve = True
        elif confidence >= self.human_review_threshold:
            decision = "human_review"
            requires_review = True
            auto_approve = False
        else:
            decision = "reject"
            requires_review = True
            auto_approve = False
        
        return {
            "confidence": confidence,
            "decision": decision,
            "requires_review": requires_review,
            "auto_approve": auto_approve,
            "top_match": top_match,
            "thresholds": {
                "auto_approve": self.auto_approve_threshold,
                "human_review": self.human_review_threshold
            }
        }
    
    def get_confidence_breakdown(self, match: MatchDetail) -> Dict[str, float]:
        return {
            "semantic_similarity": match.semantic_score,
            "discipline_match": match.discipline_score,
            "asset_similarity": match.asset_score,
            "action_similarity": match.action_score,
            "temporal_consistency": match.temporal_score,
            "final_confidence": match.final_confidence
        }

confidence_service = ConfidenceService()