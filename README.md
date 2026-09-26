# Nirikshan --- SIH26122

## Intelligent Data Capture & Schedule-Linking Layer for Infrastructure Project Management

Nirikshan is a prototype for **real-time actual progress tracking** in
infrastructure projects. It connects unstructured site progress reports
with structured WBS/schedule activities.

The system accepts progress information from:

-   Text/site updates
-   TXT reports
-   DOCX reports
-   XLSX reports
-   PDF reports
-   Voice-report UI (upload interface is present; voice
    transcription/processing is not currently enabled)

The core pipeline is:

``` text
Site Report
    ↓
Ingestion
    ↓
Entity Extraction
    ↓
Normalization
    ↓
WBS Candidate Retrieval
    ↓
Matching / Reranking
    ↓
Confidence Scoring
    ↓
Auto Approval OR Human Review
    ↓
Schedule Update
    ↓
History / Audit
```

## Architecture

``` text
                    ┌──────────────────────┐
                    │    React Frontend    │
                    │       Vite           │
                    └──────────┬───────────┘
                               │ HTTP
                               ▼
                    ┌──────────────────────┐
                    │    FastAPI Backend   │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┼─────────────┐
                 ▼             ▼             ▼
          ┌────────────┐ ┌────────────┐ ┌─────────────┐
          │   SQLite   │ │    FAISS   │ │  LLM Layer  │
          │  Database  │ │ WBS Search │ │ Ollama/8B   │
          └────────────┘ └────────────┘ └──────┬──────┘
                                               │
                                      HTTP / Tailscale
                                               │
                                               ▼
                                      ┌────────────────┐
                                      │ LLM Host        │
                                      │ Ollama          │
                                      │ llama3.1:8b     │
                                      └────────────────┘
```

## Project Structure

``` text
nirikshan/
├── backend/
│   ├── main.py
│   ├── api/
│   │   ├── reports.py
│   │   ├── matching.py
│   │   ├── review.py
│   │   ├── schedule.py
│   │   └── dashboard.py
│   ├── services/
│   │   ├── ingestion_service.py
│   │   ├── extraction_service.py
│   │   ├── normalization_service.py
│   │   ├── embedding_service.py
│   │   ├── matching_service.py
│   │   ├── confidence_service.py
│   │   ├── review_service.py
│   │   └── schedule_service.py
│   ├── models/
│   ├── database/
│   ├── ai/
│   └── data/
│
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── api/
│       ├── hooks/
│       └── utils/
│
├── models/
├── data/
└── docs/
```

## Requirements

### Software

-   Python 3.10+
-   Node.js 18+
-   npm
-   Git
-   Ollama
-   A local or network-accessible LLM host
-   Windows PowerShell/CMD or an equivalent shell

### Python dependencies

The backend dependencies are listed in:

``` text
backend/requirements.txt
```

The project uses FastAPI, SQLAlchemy, Pydantic, FAISS,
sentence-transformers and supporting packages.

### Frontend dependencies

The frontend is a React/Vite application.

Install dependencies from the frontend directory:

``` bash
npm install
```

If Zustand is not installed in an existing checkout:

``` bash
npm install zustand
```

## First-Time Setup

### 1. Clone/open the project

``` bash
git clone <repository-url>
cd sih26122
```

### 2. Create the Python environment

From the project root:

``` bash
python -m venv backend/venv
```

Windows:

``` cmd
backend\venv\Scripts\activate
```

### 3. Install backend dependencies

``` bash
pip install -r backend/requirements.txt
```

### 4. Install frontend dependencies

``` bash
cd frontend
npm install
cd ..
```

## LLM Setup

Nirikshan uses Ollama for the 8B local LLM.

The currently configured model is:

``` text
llama3.1:8b
```

Verify Ollama:

``` cmd
curl.exe http://localhost:11434/
```

Verify installed models:

``` cmd
curl.exe http://localhost:11434/api/tags
```

If the LLM is running on another machine, expose Ollama through the
network/VPN layer being used by the project.

Example environment configuration:

``` cmd
set LLM_PROVIDER=ollama
set LLM_MODEL=llama3.1:8b
set LLM_BASE_URL=http://100.112.9.92:11434
```

Replace the IP with the actual reachable Ollama host.

Test the LLM directly:

``` cmd
curl.exe -X POST http://<OLLAMA_HOST>:11434/api/generate ^
  -H "Content-Type: application/json" ^
  -d "{\"model\":\"llama3.1:8b\",\"prompt\":\"Say hello in one sentence\",\"stream\":false}"
```

The backend expects Ollama's `/api/generate` endpoint.

## Schedule Data

The master schedule is loaded from:

``` text
backend/data/master_schedule.csv
```

The schedule contains fields such as:

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

The master schedule should **not** be uploaded as a site progress
report. It is the structured schedule used for WBS matching.

## FAISS WBS Index

The system creates/uses a FAISS index for WBS candidate retrieval.

The embedding layer uses:

``` text
sentence-transformers/all-MiniLM-L6-v2
```

The index contains the project WBS activities and is used to retrieve
candidate activities before matching/reranking.

## Running the Project

Open two terminals.

### Terminal 1 --- Backend

From the project root:

``` cmd
backend\venv\Scripts\activate
uvicorn backend.main:app --reload
```

Backend:

``` text
http://127.0.0.1:8000
```

FastAPI documentation:

``` text
http://127.0.0.1:8000/docs
```

### Terminal 2 --- Frontend

``` cmd
cd frontend
npm run dev
```

The Vite development server normally runs at:

``` text
http://localhost:5173
```

## Typical User Workflow

### Submit a report

1.  Open **Submit Report**.
2.  Choose:
    -   Text Report
    -   File Upload
    -   Voice Report
3.  Enter/upload the site report.
4.  Process the report.
5.  Wait for extraction and WBS matching.

### Review the result

The system displays:

-   Extracted discipline
-   Asset
-   Action
-   Location
-   Start time
-   End time
-   Quantity
-   Completion status
-   Extraction confidence
-   WBS candidates
-   WBS match confidence

### Human review

Reports requiring verification appear in:

``` text
Review Queue
```

A reviewer can:

-   Approve
-   Correct the WBS
-   Reject

### Schedule

After approval/correction, the system creates the corresponding schedule
update.

### History

The History page shows submitted reports and their processing status.

## Confidence Routing

The prototype uses confidence thresholds for routing:

``` text
≥ 0.90
    Auto approval

0.70 – 0.89
    Human review

< 0.70
    Low-confidence / reject path
```

The final schedule update should be treated as a controlled action
rather than blindly trusting an extracted report.

## Important Demo Cases

For a demonstration, use at least:

1.  A high-confidence report
2.  A low-confidence/ambiguous report
3.  A report requiring correction
4.  A rejected report
5.  Reports from multiple disciplines

Example project data includes Electrical, Mechanical, Civil, Piping,
Instrumentation and Structural reports.

## Voice Input

The frontend contains a Voice Report interface.

Currently:

-   Audio-file selection UI is available.
-   Recording/transcription is not enabled.
-   Voice processing should not be presented as a completed backend
    capability.

## Troubleshooting

### Backend does not start

Check:

``` cmd
backend\venv\Scripts\activate
pip install -r backend/requirements.txt
```

Then:

``` cmd
uvicorn backend.main:app --reload
```

### Frontend has a blank page

Open browser Developer Tools:

``` text
F12 → Console
```

Look for the first red React/JavaScript error.

Do not randomly change backend code when the error is a frontend
component error.

### `/api/review/queue` returns 500

Check the backend terminal for the Python traceback.

The Review Queue depends on:

-   Reports
-   Extractions
-   Matches
-   Reviews

All four must be available and correctly related.

### LLM requests fail

Check:

``` cmd
curl.exe http://<OLLAMA_HOST>:11434/
```

and:

``` cmd
curl.exe http://<OLLAMA_HOST>:11434/api/tags
```

Then verify:

``` text
LLM_PROVIDER
LLM_MODEL
LLM_BASE_URL
```

### WBS matching returns no results

Check that:

``` text
backend/data/master_schedule.csv
```

is loaded and that the FAISS WBS index can be built/loaded.

## Development Rule

When modifying the application:

1.  Make one change at a time.
2.  Restart/reload only the affected service.
3.  Test the affected page.
4.  Check browser Console for frontend errors.
5.  Check FastAPI logs for backend errors.
6.  Test the complete report → review → schedule flow before making
    another large change.

## Current Prototype Scope

Implemented core flow:

``` text
Report
→ Extraction
→ WBS Matching
→ Confidence
→ Review/Approval
→ Schedule Update
→ History
```

The Voice Report interface is currently UI-only.

## License / Ownership

This project is developed as an SIH26122 prototype. Add the appropriate
repository license, team information and organization information before
public distribution.
