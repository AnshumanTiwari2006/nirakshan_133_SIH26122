from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api import router as api_router
from backend.database.database import init_db
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Nirikshan - SIH26122",
    description="AI-powered Site Progress Monitoring System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.on_event("startup")
async def startup():
    logger.info("Initializing database...")
    init_db()
    logger.info("Database initialized")

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "nirikshan"}

@app.get("/")
async def root():
    return {"message": "Nirikshan SIH26122 API", "docs": "/docs"}