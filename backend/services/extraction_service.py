# import logging
# from typing import Dict, Any, Optional
# from backend.ai.llm import llm_service
# from backend.models.extraction import ExtractionDetail, CompletionStatus

# logger = logging.getLogger(__name__)

# class ExtractionService:
#     def __init__(self):
#         self.llm = llm_service
    
#     async def extract(self, report_text: str) -> ExtractionDetail:
#         raw_extraction = await self.llm.extract(report_text)
#         normalized = await self.llm.normalize(raw_extraction)
#         validated = self._validate(normalized)
#         return validated
    
#     def _validate(self, extraction: Dict[str, Any]) -> ExtractionDetail:
#         valid_disciplines = ["Electrical", "Mechanical", "Civil", "Instrumentation", "Piping", "Other"]
        
#         discipline = extraction.get("discipline")
#         if discipline and discipline not in valid_disciplines:
#             discipline = "Other"
        
#         completion_status = extraction.get("completion_status")
#         if completion_status and completion_status not in [s.value for s in CompletionStatus]:
#             completion_status = "partial"
        
#         quantity = extraction.get("quantity")
#         if quantity is not None:
#             try:
#                 quantity = float(quantity)
#             except (ValueError, TypeError):
#                 quantity = None
        
#         confidence = extraction.get("confidence", 0.0)
#         try:
#             confidence = max(0.0, min(1.0, float(confidence)))
#         except (ValueError, TypeError):
#             confidence = 0.0
        
#         return ExtractionDetail(
#             discipline=discipline,
#             asset=extraction.get("asset"),
#             action=extraction.get("action"),
#             location=extraction.get("location"),
#             start_time=extraction.get("start_time"),
#             end_time=extraction.get("end_time"),
#             quantity=quantity,
#             unit=extraction.get("unit"),
#             completion_status=completion_status,
#             confidence=confidence
#         )

# extraction_service = ExtractionService()















import logging
from typing import Dict, Any, Optional
from backend.ai.llm import llm_service
from backend.models.extraction import ExtractionDetail, CompletionStatus

logger = logging.getLogger(__name__)

class ExtractionService:
    def __init__(self):
        self.llm = llm_service
    
    async def extract(self, report_text: str) -> ExtractionDetail:
        raw_extraction = await self.llm.extract(report_text)
        normalized = await self.llm.normalize(raw_extraction)
        validated = self._validate(normalized)
        return validated
    
    def _validate(self, extraction: Dict[str, Any]) -> ExtractionDetail:
        valid_disciplines = ["Electrical", "Mechanical", "Civil", "Instrumentation", "Piping", "Other"]
        
        discipline = extraction.get("discipline")
        if discipline and discipline not in valid_disciplines:
            discipline = "Other"
        
        completion_status = extraction.get("completion_status")
        if completion_status and completion_status not in [s.value for s in CompletionStatus]:
            completion_status = "partially_completed"
        
        quantity = extraction.get("quantity")
        if quantity is not None:
            try:
                quantity = float(quantity)
            except (ValueError, TypeError):
                quantity = None
        
        confidence = extraction.get("confidence", 0.0)
        try:
            confidence = max(0.0, min(1.0, float(confidence)))
        except (ValueError, TypeError):
            confidence = 0.0
        
        return ExtractionDetail(
            discipline=discipline,
            asset=extraction.get("asset"),
            action=extraction.get("action"),
            location=extraction.get("location"),
            start_time=extraction.get("start_time"),
            end_time=extraction.get("end_time"),
            quantity=quantity,
            unit=extraction.get("unit"),
            completion_status=completion_status,
            confidence=confidence
        )

extraction_service = ExtractionService()