from fastapi import APIRouter, HTTPException
from schemas.models import ChatMessageInput, ChatResponse, SessionSummaryInput, SessionSummary, SymptomExtraction, CheckinQuestionsInput, CheckinQuestionsResponse
from services.groq_client import call_groq
from services.supabase_service import SupabaseService
from prompts.chat import CHAT_SYSTEM_PROMPT, SYMPTOM_EXTRACTION_PROMPT, SESSION_SUMMARIZATION_PROMPT, CHECKIN_QUESTIONS_PROMPT
import json
import asyncio

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/message", response_model=ChatResponse)
async def chat_message(data: ChatMessageInput):
    """
    POST /chat/message
    Handles patient messages, extracts symptoms in parallel, and manages clarification/confirmation turns.
    """
    # 1. Persist User Message
    SupabaseService.save_message(data.patient_id, data.session_id, "user", data.message)

    # 2. Build context
    context_str = f"Rolling Summary: {data.patient_context.rolling_summary}\nProfile: {data.patient_context.profile_summary}"
    
    # 3. Call Groq for reply and extraction in parallel
    reply_task = call_groq(CHAT_SYSTEM_PROMPT, f"Context: {context_str}\nMessage: {data.message}")
    extract_task = call_groq(SYMPTOM_EXTRACTION_PROMPT, f"Extract from: {data.message}")
    
    bot_reply, extraction_json = await asyncio.gather(reply_task, extract_task)
    
    # 4. Persist Bot Reply
    SupabaseService.save_message(data.patient_id, data.session_id, "assistant", bot_reply)

    try:
        extraction = SymptomExtraction(**json.loads(extraction_json))
    except Exception:
        extraction = None

    clarification_needed = False
    save_ready = False
    confirmation_required = False

    if extraction:
        # RULE 7 — SYMPTOM CONFIDENCE THRESHOLD
        if extraction.confidence < 70:
            clarification_needed = True
        elif extraction.severity >= 7:
            confirmation_required = True
        elif extraction.confidence >= 70:
            save_ready = True
            # Persist Symptom if ready
            SupabaseService.save_symptom(data.patient_id, data.session_id, extraction.model_dump())

    return ChatResponse(
        bot_reply=bot_reply,
        extracted_symptom=extraction,
        clarification_needed=clarification_needed,
        save_ready=save_ready,
        confirmation_required=confirmation_required,
        session_updated=True
    )

@router.post("/end-session", response_model=SessionSummary)
async def end_session(data: SessionSummaryInput):
    """
    POST /chat/end-session
    Summarizes the session and updates rolling context.
    """
    log_str = "\n".join([f"{m['role']}: {m['content']}" for m in data.full_conversation_log])
    summary_json = await call_groq(SESSION_SUMMARIZATION_PROMPT, f"History: {log_str}\nExisting Rolling: {data.existing_rolling_summary}")
    
    try:
        summary_data = json.loads(summary_json)
        return SessionSummary(**summary_data)
    except Exception as e:
        raise HTTPException(status_code=422, detail="Failed to parse session summary JSON from Groq")

@router.post("/extract-symptom", response_model=SymptomExtraction)
async def extract_symptom(message: str, patient_id: str):
    """
    Internal/Direct extraction route.
    """
    extraction_json = await call_groq(SYMPTOM_EXTRACTION_PROMPT, f"Extract from: {message}")
    try:
        return SymptomExtraction(**json.loads(extraction_json))
    except Exception:
        raise HTTPException(status_code=422, detail="Extraction failed")

@router.post("/checkin-questions", response_model=CheckinQuestionsResponse)
async def checkin_questions(data: CheckinQuestionsInput):
    """
    POST /chat/checkin-questions
    Generates tailored follow-up questions for the next session.
    """
    questions_json = await call_groq(CHECKIN_QUESTIONS_PROMPT, f"Data: {data.model_dump_json()}")
    try:
        questions_dict = json.loads(questions_json)
        return CheckinQuestionsResponse(**questions_dict)
    except Exception:
        # Fallback questions
        return CheckinQuestionsResponse(questions=[
            {"text": "How did you sleep last night?", "clinical_reason": "General recovery monitoring", "expected_data_type": "free_text", "pending_question_id": None}
        ])
