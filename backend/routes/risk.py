from fastapi import APIRouter, HTTPException
import json
from schemas.models import RiskGenerateInput, RiskScore, RiskPredictInput, HealthPrediction, SymptomObj
from services.groq_client import call_groq
from prompts.risk import RISK_ADJUSTMENT_PROMPT, RISK_PREDICTION_PROMPT
from rag.retriever import retrieve
from ml.predict import calculate_trajectory
import logging

router = APIRouter(prefix="/risk", tags=["risk"])

def calculate_base_score(data: RiskGenerateInput) -> int:
    """
    STEP 1 — Deterministic base score (pure Python, no LLM)
    """
    score = 0
    # Chronic condition present: +15 each (max +30)
    score += min(30, len(data.conditions) * 15)
    
    # Symptoms
    for s in data.symptoms:
        if s.severity >= 7:
            score += 20
        elif s.severity >= 4:
            score += 10
            
    # Missed meds
    if data.missed_meds_days >= 3:
        score += 15
        
    # Family history
    if any(h in ["cardiac", "diabetes"] for h in [f.lower() for f in data.family_history]):
        score += 10
        
    # Wearable anomaly
    if "anomaly" in [f.lower() for f in data.wearable_flags]:
        score += 10
        
    # Age
    if data.age > 60:
        score += 5
        
    # Multiple symptoms same body_zone
    zones = [s.body_zone for s in data.symptoms]
    if len(zones) != len(set(zones)):
        score += 10
        
    return min(100, score)

def calculate_confidence(days_of_history: int, symptom_records: int, profile_completeness: float) -> int:
    """
    RULE 2 — CONFIDENCE FROM DATA, NOT LLM
    """
    confidence = (
        min(days_of_history, 7) / 7 * 40
        + min(symptom_records, 10) / 10 * 40
        + profile_completeness * 20
    )
    return int(confidence)

@router.post("/generate", response_model=RiskScore)
async def generate_risk(data: RiskGenerateInput):
    # Step 1: Base Score
    base_score = calculate_base_score(data)
    
    # Step 2: RAG Retrieval
    query = f"{' '.join(data.conditions)} {' '.join([s.symptom_name for s in data.symptoms])}"
    rag_chunks = retrieve(query, top_k=3, condition_tags=data.conditions)
    guideline_context = "\n".join([f"Source: {c['source']}\nText: {c['text']}" for c in rag_chunks]) if rag_chunks else "No relevant guidelines found."
    
    # Step 3: RAG Adjustment (Groq)
    system_prompt = RISK_ADJUSTMENT_PROMPT.format(
        base_score=base_score,
        summary=data.summary,
        guideline_context=guideline_context
    )
    
    try:
        groq_response = await call_groq(system_prompt, f"Patient Data: {data.model_dump_json()}")
        adjustment_data = json.loads(groq_response)
        adjustment = int(adjustment_data.get("adjustment", 0))
        # Bounded adjustment: -15 to +15
        adjustment = max(-15, min(15, adjustment))
        reason = adjustment_data.get("reason", "No adjustment applied.")
        ref = adjustment_data.get("guideline_reference", "General Guidelines")
    except Exception as e:
        adjustment = 0
        reason = "LLM adjustment unavailable. Fallback to base score."
        ref = "None"
        
    final_score = max(0, min(100, base_score + adjustment))
    
    # Step 4: Confidence (Rule 2)
    # Mocking metadata counts for this demonstration
    confidence = calculate_confidence(14, 8, 0.9) # Example counts
    
    # Determine risk level
    if final_score >= 86: level = "High"
    elif final_score >= 71: level = "Elevated"
    elif final_score >= 41: level = "Moderate"
    else: level = "Low"
    
    return RiskScore(
        base_score=base_score,
        rag_adjustment=adjustment,
        final_score=final_score,
        risk_level=level,
        risk_reason=reason,
        guideline_reference=ref,
        confidence=confidence,
        data_points_used=10 # Example
    )

@router.post("/predict", response_model=HealthPrediction)
async def predict_risk(data: RiskPredictInput):
    # Step 1: Trajectory
    trajectory_data = calculate_trajectory(data.risk_scores_history, data.symptoms_history)
    
    # Step 2: Early Warning Pattern Check
    early_warning = False
    warning_symptom = None
    # logic: same symptom 3+ times with increasing severity in last 7 days
    # ... implementation of pattern check ...
    
    # Step 3: LLM Narrative
    system_prompt = RISK_PREDICTION_PROMPT.format(
        trajectory=trajectory_data["trajectory"],
        projected_scores=trajectory_data["projected_scores"],
        top_symptoms="High severity symptoms",
        wearable_trend=str(data.wearable_trend),
        conditions=data.conditions,
        early_warning=early_warning
    )
    
    try:
        groq_json = await call_groq(system_prompt, f"Historical Data: {json.dumps(data.risk_scores_history)}")
        prediction = json.loads(groq_json)
        
        # RULE 8 — PREDICTION INTEGRITY
        groq_val = prediction.get("predicted_risk_at_day_7", 0)
        projected_val = trajectory_data["projected_scores"][6]
        
        if abs(groq_val - projected_val) > 2:
            logging.warning(f"Integrity check failed: Groq={groq_val}, Projected={projected_val}")
            groq_val = projected_val
    except Exception as e:
        prediction = {
            "prediction_summary": "Unavailable",
            "watch_for": [],
            "confidence_note": "Data mismatch or LLM service failure."
        }
        groq_val = trajectory_data["projected_scores"][6]

    # Step 5: Confidence (Rule 2)
    prediction_confidence = int(calculate_confidence(len(data.daily_summaries), len(data.symptoms_history), 0.8) * 0.7)

    return HealthPrediction(
        trajectory=trajectory_data["trajectory"],
        score_slope=trajectory_data["score_slope"],
        volatility=trajectory_data["volatility"],
        projected_scores=trajectory_data["projected_scores"],
        predicted_risk_at_day_7=groq_val,
        predicted_risk_level_day_7="Low" if groq_val < 41 else ("Moderate" if groq_val < 71 else "High"),
        early_warning=early_warning,
        early_warning_symptom=warning_symptom,
        prediction_summary=prediction.get("prediction_summary", "Stable trend"),
        watch_for=prediction.get("watch_for", []),
        confidence=prediction_confidence,
        confidence_note=prediction.get("confidence_note", "Trend based on 14-day history"),
        data_days_used=trajectory_data["data_days_used"]
    )
