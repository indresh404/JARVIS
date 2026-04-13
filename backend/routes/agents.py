from fastapi import APIRouter, HTTPException
from schemas.models import OnboardInput, PatientProfile, FamilySummaryInput, DoctorAnswerInput, DoctorAnswerResponse, SymptomObj
from services.groq_client import call_groq
from prompts.agents import ONBOARDING_PROMPT, PROFILE_SUMMARY_PROMPT, FAMILY_SUMMARY_PROMPT, DOCTOR_ANSWER_PROMPT, ESCALATION_PROMPT
import json

router = APIRouter(prefix="/agent", tags=["agent"])

@router.post("/onboard")
async def onboard_patient(data: OnboardInput):
    """
    POST /agent/onboard
    Multi-turn conversational onboarding.
    """
    system_prompt = ONBOARDING_PROMPT
    user_prompt = f"Session State: {json.dumps(data.session_state)}\nTurn: {data.turn_number}\nMessage: {data.message}"
    
    response_json = await call_groq(system_prompt, user_prompt)
    try:
        data = json.loads(response_json)
        return data
    except Exception:
        raise HTTPException(status_code=422, detail="Failed to parse onboarding response")

@router.post("/doctor-answer", response_model=DoctorAnswerResponse)
async def doctor_answer(data: DoctorAnswerInput):
    """
    POST /agent/doctor-answer
    Grounded answers to doctor questions (RULE 5).
    """
    system_prompt = DOCTOR_ANSWER_PROMPT
    response_json = await call_groq(system_prompt, f"Context: {json.dumps(data.full_context)}\nQuestion: {data.question}")
    
    try:
        res = json.loads(response_json)
        answer_found = res.get("answer_found", False)
        
        # RULE 5 — GROUNDED DOCTOR ANSWERS
        if answer_found:
            if not res.get("source_date") or not res.get("source_type"):
                answer_found = False
        
        return DoctorAnswerResponse(
            answer_found=answer_found,
            answer=res.get("answer") if answer_found else None,
            source_date=res.get("source_date") if answer_found else None,
            source_type=res.get("source_type") if answer_found else None,
            confidence=res.get("confidence", 0),
            suggested_patient_question=res.get("suggested_patient_question") if not answer_found else None
        )
    except Exception:
        return DoctorAnswerResponse(answer_found=False, confidence=0)

@router.post("/escalate")
async def escalate_check(symptoms: list[SymptomObj], patient_conditions: list[str], age: int, wearable_flags: list[str], message_context: str):
    """
    POST /agent/escalate
    RULE 4 — TWO-SIGNAL ESCALATION (Pure Python decision matrix)
    """
    symptom_set = {s.symptom_name.lower() for s in symptoms}
    level = "HOME_MONITORING"
    reason = "Normal monitoring"
    triggered_by = "Routine check"

    # Decisions matrix
    if "chest_pain" in symptom_set and "breathlessness" in symptom_set:
        level = "SEEK_URGENT_CARE"
        reason = "Concurrent chest pain and breathlessness detected."
        triggered_by = "Multiple clinical signals"
    elif "chest_pain" in symptom_set and ("cardiac" in [c.lower() for c in patient_conditions]) and age > 55:
        level = "SEEK_URGENT_CARE"
        reason = "Chest pain in patient with cardiac history and elevated age."
        triggered_by = "Condition-symptom-age intersection"
    elif "fever" in symptom_set and "joint_pain" in symptom_set:
        level = "VISIT_SOON"
        reason = "Fever and joint pain suggests potential dengue or viral infection."
        triggered_by = "Symptom pairing"
    elif "abdominal_pain" in symptom_set and "vomiting" in symptom_set:
        level = "VISIT_SOON"
        reason = "Severe abdominal pain with vomiting."
        triggered_by = "Symptom pairing"
    
    # Suppression rule
    if "chest_pain" in symptom_set and "exercise" in message_context.lower():
        level = "HOME_MONITORING"
        reason = "Chest pain likely related to recent exercise; monitor at home."
        triggered_by = "Context suppression"

    # LLM deepening (only for language)
    if level != "HOME_MONITORING":
        lang_json = await call_groq(ESCALATION_PROMPT, f"Level: {level}\nReason: {reason}\nContext: {message_context}")
        try:
            lang_data = json.loads(lang_json)
            # Use Groq for follow-ups and user-facing message
            return {**lang_data, "escalation_level": level, "triggered_by": triggered_by}
        except:
            pass

    return {
        "escalation_level": level,
        "reasoning": reason,
        "follow_up_questions": ["How long has this been occurring?", "Have you taken any medication for this?"],
        "triggered_by": triggered_by
    }
