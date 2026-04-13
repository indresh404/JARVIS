from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.supabase_service import SupabaseService

router = APIRouter(prefix="/meds", tags=["meds"])

class AdherenceLogRequest(BaseModel):
    patient_id: str
    medicine: str

@router.get("/{patient_id}")
async def get_meds(patient_id: str):
    meds = SupabaseService.get_medicines(patient_id)
    return {"status": "success", "medications": meds}

@router.post("/log")
async def log_med(data: AdherenceLogRequest):
    log = SupabaseService.log_adherence(data.patient_id, data.medicine)
    if not log:
        raise HTTPException(status_code=500, detail="Failed to log adherence")
    
    return {"status": "success", "message": "Adherence logged"}
