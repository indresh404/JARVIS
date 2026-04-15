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
    POST /chat/message — Hybrid Architecture
    
    🔥 Priority: Use frontend-extracted symptoms DIRECTLY
    🔄 Fallback: Run Groq NLP extraction only if no symptoms sent
    """
    print(f"📨 Received message from {data.patient_id}: {data.message}")
    print(f"🧠 Frontend symptoms received: {len(data.symptoms)} | Conversation log: {len(data.conversation_log)} msgs")

    # Persistence attempt (User Message)
    try:
        SupabaseService.save_message(data.patient_id, data.session_id, "user", data.message)
    except Exception as e:
        print(f"⚠️ Persistence skipped (User): {e}")

    # ─────────────────────────────────────────────
    # STEP 1: Build rich context from ALL 3 sources
    # ─────────────────────────────────────────────
    context_parts = []  # ✅ FIXED: Initialize the list
    
    # Source A: Rolling summary
    if data.patient_context.rolling_summary:
        context_parts.append(f"Rolling Summary: {data.patient_context.rolling_summary}")
    
    # Source B: Profile
    if data.patient_context.profile_summary:
        context_parts.append(f"Profile: {data.patient_context.profile_summary}")
    
    # Source C: Conversation log (last 10 messages for context window)
    if data.conversation_log:
        recent = data.conversation_log[-10:]
        conv_str = "\n".join([f"{m.get('role','user')}: {m.get('content','')}" for m in recent])
        context_parts.append(f"Recent Conversation:\n{conv_str}")
    
    # Source D: Frontend-extracted symptoms (structured clinical signals)
    if data.symptoms:
        sym_str = ", ".join([f"{s.symptom} (zone={s.body_zone}, severity={s.severity}/10, confidence={s.confidence}%)" for s in data.symptoms if s.has_symptom])
        if sym_str:
            context_parts.append(f"On-Device Extracted Symptoms: {sym_str}")
    
    context_str = "\n".join(context_parts) if context_parts else "New patient conversation"

    # ─────────────────────────────────────────────
    # STEP 2: AI Reply (Conversational)
    # ─────────────────────────────────────────────
    try:
        bot_reply = await call_groq(
            CHAT_SYSTEM_PROMPT,
            f"Context: {context_str}\nPatient: {data.message}\n\nRespond helpfully as a health assistant.",
            json_mode=False
        )
        if bot_reply.startswith('{"error":'):
            error_data = json.loads(bot_reply)
            print(f"❌ Groq internal error: {error_data}")
            bot_reply = "I understand. Could you tell me more about your symptoms?"
    except Exception as e:
        print(f"❌ AI Reply Error: {e}")
        bot_reply = "I understand you're sharing health information. Could you tell me more about your symptoms?"

    # ─────────────────────────────────────────────
    # STEP 3: HYBRID SYMPTOM EXTRACTION
    #   🔥 Priority: Frontend-extracted symptoms
    #   🔄 Fallback: Groq NLP extraction
    # ─────────────────────────────────────────────
    extraction = SymptomExtraction(has_symptom=False)
    
    if data.symptoms and any(s.has_symptom for s in data.symptoms):
        # ✅ USE FRONTEND SYMPTOMS DIRECTLY — no NLP needed
        best = max([s for s in data.symptoms if s.has_symptom], key=lambda s: s.confidence or 0)
        print(f"✅ Using frontend-extracted symptom: {best.symptom} (confidence={best.confidence}%)")
        extraction = SymptomExtraction(
            has_symptom=True,
            symptom=best.symptom,
            body_zone=best.body_zone,
            severity=best.severity,
            confidence=best.confidence or 80,
            duration=best.duration,
            save_ready=(best.confidence or 0) >= 70 and (best.severity or 0) < 7,
            clarification_needed=(best.confidence or 0) < 70,
            confirmation_required=(best.severity or 0) >= 7,
        )
    else:
        # 🔄 FALLBACK: Run Groq NLP extraction
        print("🔄 No frontend symptoms — running Groq NLP extraction as fallback...")
        try:
            extraction_json = await call_groq(
                SYMPTOM_EXTRACTION_PROMPT,
                f"Extract symptoms from: {data.message}",
                json_mode=True
            )
            extraction_data = json.loads(extraction_json)
            if "error" in extraction_data:
                raise ValueError(extraction_data["error"])
            extraction = SymptomExtraction(**extraction_data)
            print(f"🔄 Groq extracted: {extraction.symptom} (confidence={extraction.confidence}%)")
        except Exception as e:
            print(f"⚠️ Groq extraction also failed: {e}")
            extraction = SymptomExtraction(has_symptom=False)

    # ─────────────────────────────────────────────
    # STEP 4: Persistence & flags
    # ─────────────────────────────────────────────
    # Persist bot reply
    try:
        SupabaseService.save_message(data.patient_id, data.session_id, "assistant", bot_reply)
    except Exception as e:
        print(f"⚠️ Persistence skipped (Assistant): {e}")

    clarification_needed = False
    save_ready = False
    confirmation_required = False

    if extraction and extraction.has_symptom:
        if extraction.confidence < 70:
            clarification_needed = True
        elif extraction.severity is not None and extraction.severity >= 7:
            confirmation_required = True
        elif extraction.confidence >= 70:
            save_ready = True
            try:
                SupabaseService.save_symptom(data.patient_id, data.session_id, extraction.model_dump())
            except Exception as e:
                print(f"⚠️ Symptom persistence skipped: {e}")

    print(f"📊 Final: symptom={extraction.symptom}, confidence={extraction.confidence}, save_ready={save_ready}")

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
    try:
        summary_json = await call_groq(SESSION_SUMMARIZATION_PROMPT, f"History: {log_str}\nExisting Rolling: {data.existing_rolling_summary}")
        summary_data = json.loads(summary_json)
        
        # Check if Groq returned an error JSON
        if "error" in summary_data:
            raise ValueError(summary_data["error"])
            
        return SessionSummary(**summary_data)
    except Exception as e:
        print(f"Summarization Fallback Triggered: {e}")
        # Return a sensible fallback summary so the UI doesn't crash
        return SessionSummary(
            daily_summary="Session completed. (AI Summary unavailable)",
            rolling_summary=data.existing_rolling_summary or "Continuing health tracking.",
            symptoms_today=[],
            key_risks="unknown:low",
            urgency="Routine"
        )

@router.post("/extract-symptom", response_model=SymptomExtraction)
async def extract_symptom(message: str, patient_id: str):
    """
    Internal/Direct extraction route.
    """
    try:
        extraction_json = await call_groq(SYMPTOM_EXTRACTION_PROMPT, f"Extract from: {message}")
        extraction_data = json.loads(extraction_json)
        if "error" in extraction_data:
            raise ValueError(extraction_data["error"])
        return SymptomExtraction(**extraction_data)
    except Exception as e:
        print(f"Extraction Fallback Triggered: {e}")
        return SymptomExtraction(has_symptom=False, confidence=0, clarification_needed=False)

@router.post("/checkin-questions", response_model=CheckinQuestionsResponse)
async def checkin_questions(data: CheckinQuestionsInput):
    """
    POST /chat/checkin-questions
    Generates tailored follow-up questions for the next session.
    """
    try:
        questions_json = await call_groq(CHECKIN_QUESTIONS_PROMPT, f"Data: {data.model_dump_json()}")
        questions_dict = json.loads(questions_json)
        if "error" in questions_dict:
            raise ValueError(questions_dict["error"])
        return CheckinQuestionsResponse(**questions_dict)
    except Exception as e:
        print(f"CheckinQuestions Fallback Triggered: {e}")
        # Fallback questions
        return CheckinQuestionsResponse(questions=[
            {"text": "How did you sleep last night?", "clinical_reason": "General recovery monitoring", "expected_data_type": "free_text", "pending_question_id": None},
            {"text": "How is your energy level today?", "clinical_reason": "General wellness check", "expected_data_type": "severity_score", "pending_question_id": None}
        ])