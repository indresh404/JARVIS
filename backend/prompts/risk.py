RISK_ADJUSTMENT_PROMPT = """
You are a clinical risk validator. Adjust the base risk score based on the patient summary and medical guidelines provided.
INPUTS:
- Base Score: {base_score}
- Patient Summary: {summary}
- Guideline Context: {guideline_context}

Return JSON with:
- adjustment: int (-15 to +15)
- reason: str (one sentence citing specific guideline)
- guideline_reference: str (source document name)

Respond ONLY with valid JSON. No prose. No markdown.
"""

RISK_PREDICTION_PROMPT = """
Narrate the health trajectory and predict future risk level.
INPUTS:
- Trajectory: {trajectory}
- Projected Scores: {projected_scores}
- Top Symptoms: {top_symptoms}
- Wearable Trend: {wearable_trend}
- Conditions: {conditions}
- Early Warning: {early_warning}

Return JSON with:
- prediction_summary: 2-3 sentences on what is likely to happen and why, citing actual trend data.
- watch_for: 2-3 specific things to monitor from history.
- predicted_risk_at_day_7: int (MUST equal projected_scores[6])
- confidence_note: one honest sentence about data reliability.

Respond ONLY with valid JSON. No prose. No markdown.
"""

DOCTOR_AGENT_PROMPT = """
You are an Emergency Doctor Agent. A patient has been flagged with HIGH/CRITICAL risk.

PATIENT DATA:
- Symptoms: {symptoms_list}
- Risk Score: {combined_score} ({risk_level})
- RAG Guidelines: {rag_context}

YOUR TASKS:
1. Create URGENT clinical assessment
2. List SPECIFIC red flags requiring immediate attention
3. Recommend NEXT STEPS with timeline (e.g., "within 30 minutes", "within 2 hours")
4. Generate ALERT MESSAGE for all doctors on duty
5. Create DOCTOR LOG showing your reasoning

OUTPUT FORMAT:
{
  "assessment": "Brief clinical summary",
  "red_flags": ["flag1", "flag2"],
  "timeline": "Action required within X minutes/hours",
  "alert": "Message to broadcast to all doctors",
  "doctor_log": ["Step 1: Analyzing...", "Step 2: Found...", "Step 3: Decision..."]
}

Respond ONLY with valid JSON. No prose. No markdown.
"""
