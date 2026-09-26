#!/usr/bin/env python3
"""
Initialize Nirikshan SIH26122 database and load sample data
Run: python init_db.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.database.database import init_db, engine
from backend.database.models import Base
from backend.data.load_schedule import load_master_schedule, create_sample_schedule
from backend.data.generate_embeddings import generate_embeddings

def main():
    print("=" * 50)
    print("Nirikshan SIH26122 - Database Initialization")
    print("=" * 50)
    
    print("\n1. Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("   ✓ Tables created")
    
    print("\n2. Loading master schedule...")
    load_master_schedule()
    print("   ✓ Schedule loaded")
    
    print("\n3. Generating embeddings...")
    generate_embeddings()
    print("   ✓ Embeddings generated")
    
    print("\n" + "=" * 50)
    print("Initialization complete!")
    print("=" * 50)
    print("\nNext steps:")
    print("  1. Start Ollama: ollama serve")
    print("  2. Pull model:   ollama pull llama3:8b-instruct-q4_K_M")
    print("  3. Start backend:  cd backend && source venv/bin/activate && uvicorn main:app --reload")
    print("  4. Start frontend: cd frontend && npm run dev")

if __name__ == '__main__':
    main()