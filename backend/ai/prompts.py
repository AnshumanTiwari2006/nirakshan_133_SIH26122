# EXTRACTION_PROMPT = """You are an expert construction site progress analyzer. Extract structured information from the supervisor's daily progress report.

# Return ONLY valid JSON matching this exact schema:
# {
#   "discipline": "Electrical|Mechanical|Civil|Instrumentation|Piping|Other",
#   "asset": "specific equipment or asset name",
#   "action": "specific work performed (e.g., wiring, termination, installation, testing)",
#   "location": "specific location (e.g., Pump House P-01, Substation S-02)",
#   "start_time": "HH:MM format if mentioned",
#   "end_time": "HH:MM format if mentioned",
#   "quantity": number if mentioned,
#   "unit": "unit of measurement if quantity mentioned",
#   "completion_status": "completed|in_progress|not_started|partial",
#   "confidence": 0.0-1.0
# }

# Rules:
# - If information is not explicitly stated, use null
# - Discipline must be one of the listed values
# - Completion status: "completed" = finished, "in_progress" = ongoing, "partial" = partially done, "not_started" = planned
# - Confidence: your confidence in the extraction accuracy
# - Asset should be specific (e.g., "Main Pump P-01" not just "pump")
# - Action should use standard construction terminology

# Report: {report_text}

# JSON:"""

# NORMALIZATION_PROMPT = """Normalize the extracted entity to canonical project terminology.

# Mapping rules:
# - "pump side" → "Main Pump"
# - "wiring wala kaam" → "wiring"
# - "termination check" → "termination"
# - "motor side" → "Motor"
# - "cable pulling" → "cable pulling"
# - "hook-up" → "hook-up"

# Input: {extracted_json}

# Return normalized JSON with same schema:"""

# EXPLANATION_PROMPT = """Explain why the extracted report matches the recommended WBS activity.

# Extracted: {extraction}
# WBS Activity: {wbs_code} - {activity_name}
# Discipline: {discipline}
# Scores: Semantic={semantic}, Discipline={disc}, Asset={asset}, Action={action}, Temporal={temp}

# Write a 2-3 sentence explanation for the planner:"""

# RERANK_PROMPT = """Given the extracted report and candidate WBS activities, rank them by relevance.

# Extracted: {extraction}

# Candidates:
# {candidates}

# Return JSON array of wbs_codes in ranked order with brief reasoning:
# [{{"wbs_code": "...", "reason": "..."}}, ...]"""










EXTRACTION_PROMPT = """You are an expert construction site progress analyzer. Extract structured information from the supervisor's daily progress report.

Return ONLY valid JSON matching this exact schema:
{{
  "discipline": "Electrical|Mechanical|Civil|Instrumentation|Piping|Other",
  "asset": "specific equipment or asset name",
  "action": "specific work performed (e.g., wiring, termination, installation, testing)",
  "location": "specific location (e.g., Pump House P-01, Substation S-02)",
  "start_time": "HH:MM format if mentioned",
  "end_time": "HH:MM format if mentioned",
  "quantity": number if mentioned,
  "unit": "unit of measurement if quantity mentioned",
  "completion_status": "completed|in_progress|not_started|partial|partially_completed",
  "confidence": 0.0-1.0
}}

Rules:
- If information is not explicitly stated, use null
- Discipline must be one of the listed values
- Completion status: "completed" = finished, "in_progress" = ongoing, "partial" or "partially_completed" = partially done, "not_started" = planned
- Confidence: your confidence in the extraction accuracy
- Asset should be specific (e.g., "Main Pump P-01" not just "pump")
- Action should use standard construction terminology

Report: {report_text}

JSON:"""


NORMALIZATION_PROMPT = """Normalize the extracted entity to canonical project terminology.

Mapping rules:
- "pump side" → "Main Pump"
- "wiring wala kaam" → "wiring"
- "termination check" → "termination"
- "motor side" → "Motor"
- "cable pulling" → "cable pulling"
- "hook-up" → "hook-up"

Input: {extracted_json}

Return normalized JSON with same schema:"""


EXPLANATION_PROMPT = """Explain why the extracted report matches the recommended WBS activity.

Extracted: {extraction}
WBS Activity: {wbs_code} - {activity_name}
Discipline: {discipline}
Scores: Semantic={semantic}, Discipline={disc}, Asset={asset}, Action={action}, Temporal={temp}

Write a 2-3 sentence explanation for the planner:"""


RERANK_PROMPT = """Given the extracted report and candidate WBS activities, rank them by relevance.

Extracted: {extraction}

Candidates:
{candidates}

Return JSON array of wbs_codes in ranked order with brief reasoning:
[{{"wbs_code": "...", "reason": "..."}}, ...]"""
