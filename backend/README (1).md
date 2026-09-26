# Nirikshan Backend

## Overview

The backend is the FastAPI service for Nirikshan.

It provides:

-   Report ingestion
-   Report extraction
-   WBS matching
-   Confidence evaluation
-   Review queue
-   Review decisions
-   Schedule updates
-   Dashboard data
-   Report history APIs

Architecture:

``` text
React Frontend
      ↓ HTTP
FastAPI
      ↓
Services
      ↓
SQLite
      +
FAISS
      +
Ollama / Llama 3.1 8B
```

## Directory Structure

``` text
backend/
├── main.py
│
├── api/
│   ├── reports.py
│   ├── matching.py
│   ├── review.py
│   ├── schedule.py
│   └── dashboard.py
│
├── services/
│   ├── ingestion_service.py
│   ├── extraction_service.py
│   ├── normalization_service.py
│   ├── embedding_service.py
│   ├── matching_service.py
│   ├── confidence_service.py
│   ├── review_service.py
│   └── schedule_service.py
│
├── models/
│   ├── report.py
│   ├── match.py
│   ├── review.py
│   ├── dashboard.py
│   └── extraction.py
│
├── database/
│   ├── database.py
│   ├── models.py
│   └── schema.sql
│
├── ai/
│   ├── llm.py
│   ├── prompts.py
│   └── embeddings.py
│
├── data/
│   └── master_schedule.csv
│
└── requirements.txt
```

## Environment

Create the environment:

``` cmd
python -m venv backend\venv
```

Activate:

``` cmd
backend\venv\Scripts\activate
```

Install dependencies:

``` cmd
pip install -r backend\requirements.txt
```

## LLM Configuration

The backend uses environment variables.

Example:

``` cmd
set LLM_PROVIDER=ollama
set LLM_MODEL=llama3.1:8b
set LLM_BASE_URL=http://100.112.9.92:11434
```

For a local Ollama installation:

``` cmd
set LLM_BASE_URL=http://localhost:11434
```

Verify:

``` cmd
curl.exe http://<OLLAMA_HOST>:11434/
```

Verify the model:

``` cmd
curl.exe http://<OLLAMA_HOST>:11434/api/tags
```

The current LLM service communicates with:

``` text
/api/generate
```

and requests JSON-formatted output.

## Database

The default database configuration is:

``` text
sqlite:///./project.db
```

SQLite foreign keys are enabled by the database setup.

Database initialization occurs during FastAPI startup.

The database contains entities for:

-   WBS activities
-   Reports
-   Extractions
-   Matches
-   Reviews
-   Schedule updates

## Start the Backend

From the project root:

``` cmd
backend\venv\Scripts\activate
uvicorn backend.main:app --reload
```

Expected:

``` text
Uvicorn running on http://127.0.0.1:8000
Application startup complete.
```

API documentation:

``` text
http://127.0.0.1:8000/docs
```

## Main API Areas

### Reports

``` text
POST /api/reports/upload
POST /api/reports/chat
GET  /api/reports
GET  /api/reports/{report_id}
GET  /api/reports/{report_id}/extraction
GET  /api/reports/{report_id}/matches
```

### Review

``` text
GET  /api/review/queue
POST /api/review
```

### Schedule

``` text
GET /api/schedule
GET /api/schedule/summary
```

### Dashboard

``` text
GET /api/dashboard/stats
```

Exact routes can be checked in FastAPI:

``` text
http://127.0.0.1:8000/docs
```

## Processing Pipeline

A report is processed approximately as follows:

``` text
Raw Report
    ↓
Ingestion
    ↓
LLM Extraction
    ↓
Normalization
    ↓
FAISS Candidate Retrieval
    ↓
Matching / Reranking
    ↓
Confidence Evaluation
    ↓
┌─────────────────────────────┐
│ High confidence             │
│ → Auto approval             │
├─────────────────────────────┤
│ Medium confidence           │
│ → Human review              │
├─────────────────────────────┤
│ Low confidence              │
│ → Low-confidence path       │
└─────────────────────────────┘
    ↓
Schedule Update
```

## Extraction

The LLM extracts structured information such as:

``` text
discipline
asset
action
location
start_time
end_time
quantity
unit
completion_status
confidence
```

The structured result is stored in the `Extraction` table.

The extraction prompt is located at:

``` text
backend/ai/prompts.py
```

The LLM implementation is located at:

``` text
backend/ai/llm.py
```

## WBS Matching

The matching layer uses:

``` text
FAISS
+
sentence-transformers
+
discipline/asset/action/temporal signals
+
confidence scoring
```

The embedding implementation is:

``` text
backend/ai/embeddings.py
```

The matching implementation is:

``` text
backend/services/matching_service.py
```

The WBS source is:

``` text
backend/data/master_schedule.csv
```

## Confidence

Confidence routing is handled by:

``` text
backend/services/confidence_service.py
```

The prototype routing thresholds are:

``` text
≥ 0.90 → auto approval
0.70–0.89 → human review
< 0.70 → low-confidence path
```

## Review Service

Review operations are implemented in:

``` text
backend/services/review_service.py
```

The service handles:

-   Pending review retrieval
-   Approve
-   Correct
-   Reject
-   Schedule update creation

A review is recorded against the report.

Approved/corrected reports can create a `ScheduleUpdate`.

## Schedule Updates

Schedule update information includes fields such as:

``` text
report_id
wbs_code
status
actual_finish
approved_by
source_report_id
```

The review service creates the schedule update when a report is approved
or corrected.

## Master Schedule

The project schedule should be available at:

``` text
backend/data/master_schedule.csv
```

Typical fields:

``` text
wbs_code
level
discipline
activity_name
spec_ref
planned_start
planned_finish
duration_days
parent_wbs
```

Do not treat the master schedule as a site report.

## Testing

A basic backend test suite is available in the project.

Run the test file from the project root as appropriate for the current
environment:

``` cmd
python test_logic.py
```

If the project later adopts pytest:

``` cmd
pytest
```

## Logs

Run Uvicorn with:

``` cmd
uvicorn backend.main:app --reload
```

The terminal displays:

-   API requests
-   LLM calls
-   processing failures
-   database errors
-   schedule operations

For a failed request, inspect the first traceback from the failing
endpoint.

## Common Backend Problems

### `AttributeError: ReviewService ...`

Check:

``` text
backend/services/review_service.py
```

and ensure `get_pending_reviews()` is indented inside
`class ReviewService`.

### LLM connection error

Check:

``` text
LLM_BASE_URL
```

Then test Ollama directly.

### Extraction returns 404 while processing

This can occur while a background report-processing task is still
running. The frontend polls until extraction/matches become available.

### Foreign key errors

Ensure the report is committed before a background processing task
attempts to create child records such as:

``` text
Extraction
Match
Review
ScheduleUpdate
```

### FAISS index unavailable

Check that the WBS schedule is loaded and that the embedding service can
build/load the index.

## Backend Development Guidelines

When changing backend code:

1.  Preserve database relationships.
2.  Do not create `Extraction`, `Match` or `Review` records for a
    non-existent report.
3.  Keep API response schemas synchronized with frontend expectations.
4.  Test the affected endpoint using `/docs`.
5.  Check the terminal traceback before changing unrelated files.
6.  Test a complete report-processing cycle after service-layer changes.
