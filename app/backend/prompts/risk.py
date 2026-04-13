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
