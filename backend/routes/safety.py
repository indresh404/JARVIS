from fastapi import APIRouter
from schemas.models import DrugInteractionInput, DrugInteractionResponse, SmartwatchInput, SmartwatchResponse
from services.openfda import call_openfda
from services.groq_client import call_groq
from prompts.safety import DRUG_INTERACTION_PROMPT
from ml.anomaly_detector import predict_anomaly, retrain_if_stale
import json
import asyncio

router = APIRouter(prefix="/safety", tags=["safety"])

@router.post("/drug-interaction", response_model=DrugInteractionResponse)
async def check_drug_interaction(data: DrugInteractionInput):
    """
    POST /safety/drug-interaction
    Rule: medicine is never saved until this route returns.
    """
    # 1. Call OpenFDA for active medicine pairs (simplification: check new vs all active)
    fda_data = []
    for active in data.active_medicines:
        res = await call_openfda(data.new_medicine, active)
        if res: fda_data.append(res)
    
    source = "openfda" if fda_data else "llm_fallback"
    
    # 2. Pass to Groq for plain-language or fallback check
    system_prompt = DRUG_INTERACTION_PROMPT.format(interaction_data=json.dumps(fda_data) if fda_data else "No specific data found in OpenFDA.")
    groq_res = await call_groq(system_prompt, f"Check interaction for: {data.new_medicine} with {data.active_medicines}")
    
    try:
        res = json.loads(groq_res)
        return DrugInteractionResponse(
            conflict_found=res.get("medicine_risk_score", 0) > 40,
            warning_text=res.get("warning_text"),
            severity_label=res.get("severity_label", "informational"),
            medicine_risk_score=res.get("medicine_risk_score", 0),
            recommendation=res.get("recommendation", "Consult doctor before use"),
            source=source
        )
    except Exception:
        return DrugInteractionResponse(
            conflict_found=False,
            warning_text="Unable to complete interaction check.",
            severity_label="caution",
            medicine_risk_score=0,
            recommendation="Consult your physician.",
            source="unavailable"
        )

@router.post("/smartwatch", response_model=SmartwatchResponse)
async def smartwatch_anomaly(data: SmartwatchInput):
    """
    POST /safety/smartwatch
    ML-enhanced wearable anomaly detection.
    """
    # STEP 1 — Call ml/anomaly_detector.predict_anomaly()
    result = predict_anomaly(
        data.patient_id, 
        data.metric, 
        data.current_values, 
        data.baseline_14day
    )
    
    # STEP 2 — Async retrain if stale
    if data.days_since_last_train >= 7:
        asyncio.create_task(asyncio.to_thread(
            retrain_if_stale, data.patient_id, data.metric, data.baseline_14day, data.days_since_last_train
        ))
        
    # STEP 3 — Build flag_context
    flag_context = (
        f"Metric {data.metric} is {'elevated' if result['anomaly_detected'] else 'normal'}. "
        f"Deviation: {result['anomaly_score']}. Source: {result['detection_source']}."
    )
    
    return SmartwatchResponse(
        anomaly_detected=result["anomaly_detected"],
        metric=data.metric,
        deviation_score=result["anomaly_score"],
        days_elevated=result["days_elevated"],
        ml_confidence=result["ml_confidence"],
        detection_source=result["detection_source"],
        flag_context=flag_context,
        mean_baseline=result["mean_baseline"],
        std_baseline=result["std_baseline"]
    )

@router.post("/adherence")
async def check_adherence(patient_id: str, medicine: str, is_critical: bool, taken_events: list[dict]):
    """
    POST /safety/adherence
    Pure Python logic for medication adherence.
    """
    missed_days = 0 # Dummy calc
    alert_needed = is_critical and missed_days >= 3
    
    return {
        "missed_days": missed_days,
        "is_critical": is_critical,
        "alert_needed": alert_needed,
        "suggested_reminder_time": "08:00 PM",
        "clinical_context": "Patient consistently takes meds late"
    }
