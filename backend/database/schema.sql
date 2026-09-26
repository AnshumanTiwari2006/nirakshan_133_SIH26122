-- SQLite Schema for SIH26122
-- Run with: sqlite3 project.db < schema.sql

PRAGMA foreign_keys = ON;

-- WBS Activities (Master Schedule ~150 rows)
CREATE TABLE IF NOT EXISTS wbs_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wbs_code TEXT UNIQUE NOT NULL,
    level INTEGER NOT NULL,
    discipline TEXT NOT NULL,
    activity_name TEXT NOT NULL,
    spec_ref TEXT,
    planned_start TEXT,
    planned_finish TEXT,
    duration_days INTEGER,
    parent_wbs TEXT,
    embedding BLOB,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Progress Reports (DPR, Chat, Voice, etc.)
CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id TEXT UNIQUE NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('TXT', 'DOCX', 'XLSX', 'VOICE', 'CHAT')),
    raw_content TEXT NOT NULL,
    file_name TEXT,
    supervisor TEXT,
    submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,
    processed_at TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Extracted Entities from Reports
CREATE TABLE IF NOT EXISTS extractions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    discipline TEXT,
    asset TEXT,
    action TEXT,
    location TEXT,
    start_time TEXT,
    end_time TEXT,
    quantity REAL,
    unit TEXT,
    completion_status TEXT CHECK (completion_status IN ('completed', 'in_progress', 'not_started', 'partial')),
    confidence REAL DEFAULT 0.0,
    extracted_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- WBS Matches with Scores
CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    wbs_code TEXT NOT NULL,
    semantic_score REAL DEFAULT 0.0,
    discipline_score REAL DEFAULT 0.0,
    asset_score REAL DEFAULT 0.0,
    action_score REAL DEFAULT 0.0,
    temporal_score REAL DEFAULT 0.0,
    final_confidence REAL DEFAULT 0.0,
    rank INTEGER NOT NULL,
    explanation TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (wbs_code) REFERENCES wbs_activities(wbs_code)
);

-- Human Review Actions
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    original_wbs TEXT,
    corrected_wbs TEXT,
    decision TEXT NOT NULL CHECK (decision IN ('approve', 'correct', 'reject')),
    reviewer TEXT,
    comments TEXT,
    reviewed_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Schedule Updates (Approved Progress)
CREATE TABLE IF NOT EXISTS schedule_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    wbs_code TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Completed', 'In Progress', 'Not Started')),
    actual_start TEXT,
    actual_finish TEXT,
    quantity REAL,
    unit TEXT,
    approved_by TEXT,
    source_report_id TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (wbs_code) REFERENCES wbs_activities(wbs_code)
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_reports_source_id ON reports(source_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_extractions_report_id ON extractions(report_id);
CREATE INDEX IF NOT EXISTS idx_matches_report_id ON matches(report_id);
CREATE INDEX IF NOT EXISTS idx_matches_wbs_code ON matches(wbs_code);
CREATE INDEX IF NOT EXISTS idx_reviews_report_id ON reviews(report_id);
CREATE INDEX IF NOT EXISTS idx_schedule_updates_wbs_code ON schedule_updates(wbs_code);