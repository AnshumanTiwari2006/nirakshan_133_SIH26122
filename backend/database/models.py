from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, UniqueConstraint, Index
from sqlalchemy.types import REAL
from sqlalchemy.orm import relationship
from backend.database.database import Base
from datetime import datetime

class WBSActivity(Base):
    __tablename__ = "wbs_activities"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    wbs_code = Column(String(50), unique=True, nullable=False, index=True)
    level = Column(Integer, nullable=False)
    discipline = Column(String(50), nullable=False, index=True)
    activity_name = Column(String(200), nullable=False)
    spec_ref = Column(String(50))
    planned_start = Column(String(50))
    planned_finish = Column(String(50))
    duration_days = Column(Integer)
    parent_wbs = Column(String(50))
    embedding = Column(Text)
    created_at = Column(String(50), default=lambda: datetime.utcnow().isoformat())
    
    matches = relationship("Match", back_populates="wbs")
    schedule_updates = relationship("ScheduleUpdate", back_populates="wbs")

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    source_id = Column(String(100), unique=True, nullable=False, index=True)
    source_type = Column(String(20), nullable=False)
    raw_content = Column(Text, nullable=False)
    file_name = Column(String(200))
    supervisor = Column(String(100))
    submitted_at = Column(String(50), default=lambda: datetime.utcnow().isoformat())
    processed_at = Column(String(50))
    status = Column(String(20), default="pending")
    
    extractions = relationship("Extraction", back_populates="report", cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="report", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="report", cascade="all, delete-orphan")
    schedule_updates = relationship("ScheduleUpdate", back_populates="report", cascade="all, delete-orphan")

class Extraction(Base):
    __tablename__ = "extractions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    discipline = Column(String(50))
    asset = Column(String(100))
    action = Column(String(200))
    location = Column(String(100))
    start_time = Column(String(50))
    end_time = Column(String(50))
    quantity = Column(REAL)
    unit = Column(String(20))
    completion_status = Column(String(20))
    confidence = Column(REAL, default=0.0)
    extracted_at = Column(String(50), default=lambda: datetime.utcnow().isoformat())
    
    report = relationship("Report", back_populates="extractions")

class Match(Base):
    __tablename__ = "matches"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    wbs_code = Column(String(50), ForeignKey("wbs_activities.wbs_code"), nullable=False, index=True)
    semantic_score = Column(REAL, default=0.0)
    discipline_score = Column(REAL, default=0.0)
    asset_score = Column(REAL, default=0.0)
    action_score = Column(REAL, default=0.0)
    temporal_score = Column(REAL, default=0.0)
    final_confidence = Column(REAL, default=0.0)
    rank = Column(Integer, nullable=False)
    explanation = Column(Text)
    created_at = Column(String(50), default=lambda: datetime.utcnow().isoformat())
    
    report = relationship("Report", back_populates="matches")
    wbs = relationship("WBSActivity", back_populates="matches")

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    original_wbs = Column(String(50))
    corrected_wbs = Column(String(50))
    decision = Column(String(20), nullable=False)
    reviewer = Column(String(100))
    comments = Column(Text)
    reviewed_at = Column(String(50), default=lambda: datetime.utcnow().isoformat())
    
    report = relationship("Report", back_populates="reviews")

class ScheduleUpdate(Base):
    __tablename__ = "schedule_updates"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), nullable=False)
    wbs_code = Column(String(50), ForeignKey("wbs_activities.wbs_code"), nullable=False, index=True)
    status = Column(String(20), nullable=False)
    actual_start = Column(String(50))
    actual_finish = Column(String(50))
    quantity = Column(REAL)
    unit = Column(String(20))
    approved_by = Column(String(100))
    source_report_id = Column(String(100))
    updated_at = Column(String(50), default=lambda: datetime.utcnow().isoformat())
    
    report = relationship("Report", back_populates="schedule_updates")
    wbs = relationship("WBSActivity", back_populates="schedule_updates")

Index("idx_schedule_updates_wbs_code", ScheduleUpdate.wbs_code)
Index("idx_reports_status", Report.status)