# import logging
# from typing import List, Dict, Any, Optional
# from sqlalchemy.orm import Session
# from backend.ai.embeddings import embedding_service
# from backend.ai.llm import llm_service
# from backend.database.models import WBSActivity
# from backend.models.match import MatchDetail

# logger = logging.getLogger(__name__)

# class MatchingService:
#     def __init__(self):
#         self.embedding = embedding_service
#         self.llm = llm_service
        
#         self.weights = {
#             "semantic": 0.50,
#             "discipline": 0.20,
#             "asset": 0.15,
#             "action": 0.10,
#             "temporal": 0.05,
#         }
    
#     def match(self, db: Session, extraction: Dict[str, Any], top_k: int = 10, rerank_top_k: int = 3) -> List[MatchDetail]:
#         query_text = self._build_query(extraction)
#         candidates = self.embedding.search(query_text, top_k)
        
#         if not candidates:
#             return []
        
#         wbs_codes = [c["wbs_code"] for c in candidates]
#         wbs_activities = db.query(WBSActivity).filter(WBSActivity.wbs_code.in_(wbs_codes)).all()
#         wbs_map = {w.wbs_code: w for w in wbs_activities}
        
#         scored = []
#         for candidate in candidates:
#             wbs = wbs_map.get(candidate["wbs_code"])
#             if not wbs:
#                 continue
            
#             scores = self._calculate_scores(extraction, wbs, candidate["semantic_score"])
#             final_confidence = self._weighted_score(scores)
            
#             scored.append({
#                 "wbs_code": wbs.wbs_code,
#                 "activity_name": wbs.activity_name,
#                 "discipline": wbs.discipline,
#                 "scores": scores,
#                 "final_confidence": final_confidence
#             })
        
#         scored.sort(key=lambda x: x["final_confidence"], reverse=True)
#         top_matches = scored[:rerank_top_k]
        
#         reranked = self._llm_rerank(extraction, top_matches)
        
#         results = []
#         for i, match in enumerate(reranked):
#             wbs = wbs_map.get(match["wbs_code"])
#             if not wbs:
#                 continue
            
#             scores = match.get("scores", {})
#             explanation = match.get("reason") or self._generate_explanation(extraction, wbs, scores)
            
#             results.append(MatchDetail(
#                 wbs_code=match["wbs_code"],
#                 activity_name=wbs.activity_name,
#                 discipline=wbs.discipline,
#                 semantic_score=scores.get("semantic", 0),
#                 discipline_score=scores.get("discipline", 0),
#                 asset_score=scores.get("asset", 0),
#                 action_score=scores.get("action", 0),
#                 temporal_score=scores.get("temporal", 0),
#                 final_confidence=match.get("final_confidence", scores.get("final", 0)),
#                 rank=i + 1,
#                 explanation=explanation
#             ))
        
#         return results
    
#     def _build_query(self, extraction: Dict[str, Any]) -> str:
#         parts = []
#         if extraction.get("discipline"):
#             parts.append(extraction["discipline"])
#         if extraction.get("asset"):
#             parts.append(extraction["asset"])
#         if extraction.get("action"):
#             parts.append(extraction["action"])
#         if extraction.get("location"):
#             parts.append(extraction["location"])
#         return " ".join(parts)
    
#     def _calculate_scores(self, extraction: Dict, wbs: WBSActivity, semantic_score: float) -> Dict[str, float]:
#         scores = {"semantic": semantic_score}
        
#         scores["discipline"] = 1.0 if extraction.get("discipline") == wbs.discipline else 0.0
        
#         asset_score = self._similarity(extraction.get("asset", ""), wbs.activity_name)
#         scores["asset"] = asset_score
        
#         action_score = self._similarity(extraction.get("action", ""), wbs.activity_name)
#         scores["action"] = action_score
        
#         scores["temporal"] = 0.8
        
#         return scores
    
#     def _similarity(self, text1: str, text2: str) -> float:
#         if not text1 or not text2:
#             return 0.0
#         t1 = set(text1.lower().split())
#         t2 = set(text2.lower().split())
#         if not t1 or not t2:
#             return 0.0
#         intersection = t1 & t2
#         union = t1 | t2
#         return len(intersection) / len(union)
    
#     def _weighted_score(self, scores: Dict[str, float]) -> float:
#         return sum(scores.get(k, 0) * w for k, w in self.weights.items())
    
#     def _llm_rerank(self, extraction: Dict, candidates: List[Dict]) -> List[Dict]:
#         try:
#             reranked = self.llm.rerank(extraction, candidates)
#             for i, r in enumerate(reranked):
#                 for c in candidates:
#                     if c["wbs_code"] == r["wbs_code"]:
#                         c["reason"] = r.get("reason", "")
#                         break
#             return reranked
#         except Exception as e:
#             logger.warning(f"LLM rerank failed: {e}")
#             return candidates
    
#     def _generate_explanation(self, extraction: Dict, wbs: WBSActivity, scores: Dict) -> str:
#         parts = []
#         if scores.get("discipline", 0) == 1.0:
#             parts.append(f"Discipline matches ({wbs.discipline})")
#         if scores.get("asset", 0) > 0.5:
#             parts.append("Asset aligns")
#         if scores.get("action", 0) > 0.5:
#             parts.append("Action matches")
#         return f"Selected because: {', '.join(parts)}. Semantic similarity: {scores.get('semantic', 0):.2f}"

# matching_service = MatchingService()




import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.ai.embeddings import embedding_service
from backend.ai.llm import llm_service
from backend.database.models import WBSActivity
from backend.models.match import MatchDetail

logger = logging.getLogger(__name__)

class MatchingService:
    def __init__(self):
        self.embedding = embedding_service
        self.llm = llm_service
        
        self.weights = {
            "semantic": 0.50,
            "discipline": 0.20,
            "asset": 0.15,
            "action": 0.10,
            "temporal": 0.05,
        }
    
    def match(self, db: Session, extraction: Dict[str, Any], top_k: int = 10, rerank_top_k: int = 3) -> List[MatchDetail]:
        query_text = self._build_query(extraction)
        candidates = self.embedding.search(query_text, top_k)
        
        if not candidates:
            return []
        
        wbs_codes = [c["wbs_code"] for c in candidates]
        wbs_activities = db.query(WBSActivity).filter(WBSActivity.wbs_code.in_(wbs_codes)).all()
        wbs_map = {w.wbs_code: w for w in wbs_activities}
        
        scored = []
        for candidate in candidates:
            wbs = wbs_map.get(candidate["wbs_code"])
            if not wbs:
                continue
            
            scores = self._calculate_scores(extraction, wbs, candidate["semantic_score"])
            final_confidence = self._weighted_score(scores)
            
            scored.append({
                "wbs_code": wbs.wbs_code,
                "activity_name": wbs.activity_name,
                "discipline": wbs.discipline,
                "scores": scores,
                "final_confidence": final_confidence
            })
        
        scored.sort(key=lambda x: x["final_confidence"], reverse=True)
        top_matches = scored[:rerank_top_k]
        
        reranked = self._llm_rerank(extraction, top_matches)
        
        results = []
        for i, match in enumerate(reranked):
            wbs = wbs_map.get(match["wbs_code"])
            if not wbs:
                continue
            
            scores = match.get("scores", {})
            explanation = match.get("reason") or self._generate_explanation(extraction, wbs, scores)
            
            results.append(MatchDetail(
                wbs_code=match["wbs_code"],
                activity_name=wbs.activity_name,
                discipline=wbs.discipline,
                semantic_score=scores.get("semantic", 0),
                discipline_score=scores.get("discipline", 0),
                asset_score=scores.get("asset", 0),
                action_score=scores.get("action", 0),
                temporal_score=scores.get("temporal", 0),
                final_confidence=match.get("final_confidence", scores.get("final", 0)),
                rank=i + 1,
                explanation=explanation
            ))
        
        return results
    
    def _build_query(self, extraction: Dict[str, Any]) -> str:
        parts = []
        if extraction.get("discipline"):
            parts.append(extraction["discipline"])
        if extraction.get("asset"):
            parts.append(extraction["asset"])
        if extraction.get("action"):
            parts.append(extraction["action"])
        if extraction.get("location"):
            parts.append(extraction["location"])
        return " ".join(parts)
    
    def _calculate_scores(self, extraction: Dict, wbs: WBSActivity, semantic_score: float) -> Dict[str, float]:
        scores = {"semantic": semantic_score}
        
        scores["discipline"] = 1.0 if extraction.get("discipline") == wbs.discipline else 0.0
        
        asset_score = self._similarity(extraction.get("asset", ""), wbs.activity_name)
        scores["asset"] = asset_score
        
        action_score = self._similarity(extraction.get("action", ""), wbs.activity_name)
        scores["action"] = action_score
        
        scores["temporal"] = 0.8
        
        return scores
    
    def _similarity(self, text1: str, text2: str) -> float:
        if not text1 or not text2:
            return 0.0
        t1 = set(text1.lower().split())
        t2 = set(text2.lower().split())
        if not t1 or not t2:
            return 0.0
        intersection = t1 & t2
        union = t1 | t2
        return len(intersection) / len(union)
    
    def _weighted_score(self, scores: Dict[str, float]) -> float:
        return sum(scores.get(k, 0) * w for k, w in self.weights.items())
    
    def _llm_rerank(self, extraction: Dict, candidates: List[Dict]) -> List[Dict]:
        # Keep the critical processing path synchronous. The Ollama reranker is async;
        # deterministic candidate scoring remains the safe fallback for the background task.
        return candidates
    
    def _generate_explanation(self, extraction: Dict, wbs: WBSActivity, scores: Dict) -> str:
        parts = []
        if scores.get("discipline", 0) == 1.0:
            parts.append(f"Discipline matches ({wbs.discipline})")
        if scores.get("asset", 0) > 0.5:
            parts.append("Asset aligns")
        if scores.get("action", 0) > 0.5:
            parts.append("Action matches")
        return f"Selected because: {', '.join(parts)}. Semantic similarity: {scores.get('semantic', 0):.2f}"

matching_service = MatchingService()