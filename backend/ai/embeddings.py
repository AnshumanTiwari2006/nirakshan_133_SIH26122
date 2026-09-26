import os
import pickle
import numpy as np
from typing import List, Dict, Any, Optional
from sentence_transformers import SentenceTransformer
import faiss
from backend.database.models import WBSActivity
from sqlalchemy.orm import Session
import logging
logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.model_name = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
        self.index_path = os.getenv("FAISS_INDEX_PATH", "./vectorstore/wbs_index")
        self.model = None
        self.index = None
        self.wbs_codes = []
        
    def load_model(self):
        if self.model is None:
            self.model = SentenceTransformer(self.model_name)
        return self.model
    
    def encode(self, texts: List[str]) -> np.ndarray:
        model = self.load_model()
        embeddings = model.encode(texts, normalize_embeddings=True)
        return embeddings.astype(np.float32)
    
    def build_index(self, db: Session):
        wbs_activities = db.query(WBSActivity).all()
        if not wbs_activities:
            logger.warning("No WBS activities found to build index")
            return
        
        texts = []
        self.wbs_codes = []
        for wbs in wbs_activities:
            text = f"{wbs.discipline} {wbs.activity_name} {wbs.spec_ref or ''}"
            texts.append(text)
            self.wbs_codes.append(wbs.wbs_code)
        
        embeddings = self.encode(texts)
        
        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dimension)
        self.index.add(embeddings)
        
        self.save_index()
        logger.info(f"Built FAISS index with {len(self.wbs_codes)} WBS activities")
    
    def save_index(self):
        os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
        faiss.write_index(self.index, f"{self.index_path}.faiss")
        with open(f"{self.index_path}.pkl", "wb") as f:
            pickle.dump(self.wbs_codes, f)
    
    def load_index(self):
        try:
            self.index = faiss.read_index(f"{self.index_path}.faiss")
            with open(f"{self.index_path}.pkl", "rb") as f:
                self.wbs_codes = pickle.load(f)
            logger.info(f"Loaded FAISS index with {len(self.wbs_codes)} WBS activities")
            return True
        except Exception as e:
            logger.warning(f"Could not load FAISS index: {e}")
            return False
    
    def search(self, query: str, top_k: int = 10) -> List[Dict[str, Any]]:
        if self.index is None:
            if not self.load_index():
                return []
        
        query_embedding = self.encode([query])
        scores, indices = self.index.search(query_embedding, top_k)
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < len(self.wbs_codes):
                results.append({
                    "wbs_code": self.wbs_codes[idx],
                    "semantic_score": float(score)
                })
        return results

embedding_service = EmbeddingService()