# Nirikshan Frontend

## Overview

The Nirikshan frontend is a React + Vite application for interacting
with the infrastructure progress tracking system.

It provides interfaces for:

-   Dashboard monitoring
-   Site report submission
-   File upload
-   Voice-report upload UI
-   Human review
-   Schedule monitoring
-   Report history
-   Settings

## Directory Structure

``` text
frontend/
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── SubmitReport.jsx
│   │   ├── ReviewQueue.jsx
│   │   ├── Schedule.jsx
│   │   └── ReportHistory.jsx
│   │
│   ├── components/
│   │   ├── ConfidenceBadge.jsx
│   │   ├── WBSMatchCard.jsx
│   │   ├── ExtractionPanel.jsx
│   │   ├── ReviewPanel.jsx
│   │   └── ProgressTimeline.jsx
│   │
│   ├── api/
│   │   └── client.js
│   │
│   ├── hooks/
│   └── utils/
│
├── public/
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

## Requirements

-   Node.js 18+
-   npm

Install dependencies:

``` cmd
cd frontend
npm install
```

If Zustand is missing:

``` cmd
npm install zustand
```

## Start the Frontend

From:

``` text
frontend/
```

run:

``` cmd
npm run dev
```

Vite normally starts at:

``` text
http://localhost:5173
```

The backend should also be running:

``` text
http://127.0.0.1:8000
```

## Frontend → Backend Connection

The frontend API client is:

``` text
src/api/client.js
```

All report/review/schedule/dashboard requests should go through the
configured API client.

If the frontend cannot reach the backend, check:

1.  Backend is running.
2.  Backend is listening on port 8000.
3.  API base URL is correct.
4.  Browser Network tab for failed requests.
5.  Browser Console for JavaScript errors.

## Main Pages

### Dashboard

File:

``` text
src/pages/Dashboard.jsx
```

Displays project-level information such as:

-   Reports processed
-   Auto approvals
-   Human reviews
-   Rejected reports
-   Confidence information
-   Processing trend
-   Discipline distribution
-   Pending reviews
-   Recent updates

### Submit Report

File:

``` text
src/pages/SubmitReport.jsx
```

Input modes:

``` text
Text Report
File Upload
Voice Report
```

#### Text Report

Allows a supervisor to enter a site progress update.

#### File Upload

Supports the report formats exposed by the current UI:

``` text
TXT
DOCX
XLSX
PDF
```

The interface supports selecting/dragging files and processing selected
reports.

#### Voice Report

The frontend contains a voice-report interface.

Current state:

-   Audio-file selection UI is available.
-   Recording is not currently implemented.
-   Transcription is not currently implemented.
-   Do not describe voice transcription as an implemented backend
    feature.

## Submit Report Result

After processing, the frontend can show:

``` text
Extracted Information
WBS Matches
Confidence
Review & Approve
Submit Another
```

The extraction panel is:

``` text
src/components/ExtractionPanel.jsx
```

The confidence UI is:

``` text
src/components/ConfidenceBadge.jsx
```

## Review Queue

File:

``` text
src/pages/ReviewQueue.jsx
```

The Review Queue is used for reports that need human verification.

A reviewer can inspect:

-   Report information
-   Extracted entities
-   Candidate WBS activities
-   Confidence
-   Processing information

The review controls are handled by:

``` text
src/components/ReviewPanel.jsx
```

Possible decisions:

``` text
Approve
Correct
Reject
```

## Schedule

File:

``` text
src/pages/Schedule.jsx
```

The Schedule page displays the structured WBS/project schedule and
schedule updates created from approved reports.

It is intended to show the transition from:

``` text
Planned Activity
        ↓
Actual Report
        ↓
Verified Update
```

## Report History

File:

``` text
src/pages/ReportHistory.jsx
```

The History page allows users to:

-   Search reports
-   Filter by status
-   View submitted reports
-   Open report details
-   Inspect extracted information
-   Inspect WBS matches
-   Review processing results

## Components

### ConfidenceBadge

``` text
src/components/ConfidenceBadge.jsx
```

Displays confidence levels.

The current visual levels are:

``` text
HIGH
MEDIUM
LOW
```

### ExtractionPanel

``` text
src/components/ExtractionPanel.jsx
```

Displays extracted:

``` text
Discipline
Asset
Action
Location
Start Time
End Time
Quantity
Status
```

Fields that are not extracted can be displayed as:

``` text
Not extracted
```

### WBSMatchCard

``` text
src/components/WBSMatchCard.jsx
```

Displays candidate schedule activities and their match confidence.

### ReviewPanel

``` text
src/components/ReviewPanel.jsx
```

Provides reviewer actions.

## Styling

Main styling files:

``` text
src/App.css
src/index.css
```

The UI uses Tailwind-compatible utility classes and project CSS classes
such as:

``` text
btn-primary
btn-secondary
card
label
badge-success
badge-warning
badge-danger
```

When modifying the visual design, keep button alignment and spacing
consistent.

## Removing Decorative Icons

The application uses Lucide icons in navigation and selected controls.

If a page becomes visually cluttered, remove decorative icons from
ordinary action buttons first.

Keep icons where they communicate:

-   Navigation
-   Upload
-   Voice
-   Status
-   Loading
-   Search

Avoid unnecessary decorative icons next to every text value.

## API Requests

Frontend requests should use the API client instead of directly
duplicating fetch/axios configuration across pages.

Typical endpoints include:

``` text
GET  /api/dashboard/stats

POST /api/reports/upload
POST /api/reports/chat

GET  /api/reports
GET  /api/reports/{id}
GET  /api/reports/{id}/extraction
GET  /api/reports/{id}/matches

GET  /api/review/queue
POST /api/review

GET  /api/schedule
GET  /api/schedule/summary
```

Check the FastAPI documentation for the current API:

``` text
http://127.0.0.1:8000/docs
```

## Frontend Debugging

### Blank white screen

Open:

``` text
F12 → Console
```

Find the first red error.

Common causes:

-   Missing component import
-   Incorrect named/default import
-   Undefined variable
-   Invalid JSX
-   API response shape mismatch

Fix the first error before changing other components.

### API request fails

Open:

``` text
F12 → Network
```

Select the failed request.

Check:

``` text
Request URL
Status Code
Response
```

Then check the FastAPI terminal.

### Review Queue is empty

Check the browser Network tab for:

``` text
GET /api/review/queue
```

Expected successful response:

``` text
200
```

If it returns:

``` text
500
```

inspect the backend traceback before changing the frontend.

### Extraction fields are missing

The frontend can only display values returned by the backend.

If the UI shows:

``` text
Not extracted
```

the backend extraction result did not contain that field.

The extraction prompt is controlled on the backend in:

``` text
backend/ai/prompts.py
```

Do not add fake values in the frontend.

## Frontend Development Workflow

When changing the frontend:

1.  Change one component.
2.  Save.
3.  Let Vite reload.
4.  Refresh the page.
5.  Check browser Console.
6.  Test the affected interaction.
7.  Test navigation to the next page.
8.  Only then make the next change.

## Recommended Demo Flow

Use this sequence during a demonstration:

``` text
Dashboard
   ↓
Submit Report
   ↓
Upload Site Report
   ↓
AI Extraction
   ↓
WBS Candidates
   ↓
Review Queue
   ↓
Approve / Correct / Reject
   ↓
Schedule
   ↓
History
```

## Important Frontend Scope

The current frontend supports the complete visible workflow for:

``` text
Report submission
Extraction result display
WBS match display
Human review
Schedule viewing
History
```

Voice input currently has an interface for audio upload, but recording
and transcription are not enabled.

## Before Final Delivery

Run:

``` cmd
npm install
npm run dev
```

Then manually test:

-   Dashboard loads
-   Submit Report loads
-   Text report works
-   File upload works
-   Processing result appears
-   Review Queue loads
-   Approve works
-   Correct works
-   Reject works
-   Schedule loads
-   History loads
-   Report details open
-   Voice Report UI loads

Also check:

``` text
F12 → Console
```

and ensure there are no application-breaking red errors.
