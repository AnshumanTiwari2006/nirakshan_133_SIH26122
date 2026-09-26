import os
import json
import logging
from typing import Dict, Any, Optional, List
import httpx
from backend.ai.prompts import EXTRACTION_PROMPT, NORMALIZATION_PROMPT, EXPLANATION_PROMPT, RERANK_PROMPT

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "ollama")
        self.model = os.getenv("LLM_MODEL", "llama3:8b-instruct-q4_K_M")
        self.base_url = os.getenv("LLM_BASE_URL", "http://localhost:11434")
        self.timeout = 120.0
        
    async def extract(self, report_text: str) -> Dict[str, Any]:
        prompt = EXTRACTION_PROMPT.format(report_text=report_text)
        response = await self._generate(prompt, temperature=0.1)
        return self._parse_json(response)
    
    async def normalize(self, extraction: Dict[str, Any]) -> Dict[str, Any]:
        prompt = NORMALIZATION_PROMPT.format(extracted_json=json.dumps(extraction))
        response = await self._generate(prompt, temperature=0.0)
        return self._parse_json(response)
    
    async def explain_match(self, extraction: Dict, wbs_code: str, activity_name: str, 
                           discipline: str, scores: Dict[str, float]) -> str:
        prompt = EXPLANATION_PROMPT.format(
            extraction=json.dumps(extraction),
            wbs_code=wbs_code,
            activity_name=activity_name,
            discipline=discipline,
            semantic=scores.get("semantic", 0),
            disc=scores.get("discipline", 0),
            asset=scores.get("asset", 0),
            action=scores.get("action", 0),
            temp=scores.get("temporal", 0)
        )
        response = await self._generate(prompt, temperature=0.2)
        return response.strip()
    
    async def rerank(self, extraction: Dict, candidates: List[Dict]) -> List[Dict]:
        candidates_str = "\n".join([
            f"{c['wbs_code']}: {c['activity_name']} (Discipline: {c['discipline']})"
            for c in candidates
        ])
        prompt = RERANK_PROMPT.format(
            extraction=json.dumps(extraction),
            candidates=candidates_str
        )
        response = await self._generate(prompt, temperature=0.1)
        return self._parse_json(response)
    
    async def _generate(self, prompt: str, temperature: float = 0.1) -> str:
        if self.provider == "ollama":
            return await self._ollama_generate(prompt, temperature)
        else:
            raise ValueError(f"Unknown LLM provider: {self.provider}")
    
    async def _ollama_generate(self, prompt: str, temperature: float) -> str:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "temperature": temperature,
                    "stream": False,
                    "format": "json"
                }
            )
            response.raise_for_status()
            return response.json().get("response", "")
    
    def _parse_json(self, text: str) -> Dict[str, Any]:
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            start = text.find("{")
            end = text.rfind("}") + 1
            if start >= 0 and end > start:
                return json.loads(text[start:end])
            return {}

llm_service = LLMService()