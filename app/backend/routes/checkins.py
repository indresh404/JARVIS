from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.supabase_service import SupabaseService
from datetime import datetime

router = APIRouter(prefix="/checkins", tags=["checkins"])

class CheckinSubmission(BaseModel):
    patient_id: str
    answers: list

@router.get("/pending/{patient_id}")
async def get_pending_questions(patient_id: str):
    questions = SupabaseService.get_pending_questions(patient_id)
    return {"status": "success", "questions": questions}

@router.post("/submit")
async def submit_checkin(data: CheckinSubmission):
    res = SupabaseService.submit_checkin(data.patient_id, data.answers)
    if not res:
        raise HTTPException(status_code=500, detail="Failed to submit check-in")
    
    return {"status": "success", "message": "Check-in submitted"}
