from sqlalchemy.orm import Session
from backend.database.database import SessionLocal
from backend.database.models import WBSActivity
from backend.ai.embeddings import embedding_service

def generate_embeddings():
    db = SessionLocal()
    try:
        wbs_activities = db.query(WBSActivity).all()
        if not wbs_activities:
            print("No WBS activities found. Run load_schedule.py first.")
            return
        
        texts = []
        for wbs in wbs_activities:
            text = f"{wbs.discipline} {wbs.activity_name} {wbs.spec_ref or ''}"
            texts.append(text)
        
        print(f"Generating embeddings for {len(texts)} WBS activities...")
        embeddings = embedding_service.encode(texts)
        
        dimension = embeddings.shape[1]
        embedding_service.index = embedding_service.index or __import__('faiss').IndexFlatIP(dimension)
        embedding_service.index.add(embeddings)
        embedding_service.wbs_codes = [w.wbs_code for w in wbs_activities]
        
        embedding_service.save_index()
        print(f"Saved FAISS index with {len(embedding_service.wbs_codes)} vectors")
        
    except Exception as e:
        print(f"Error generating embeddings: {e}")
    finally:
        db.close()

if __name__ == '__main__':
    generate_embeddings()