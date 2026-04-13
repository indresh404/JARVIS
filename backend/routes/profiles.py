from fastapi import APIRouter, HTTPException
from services.supabase_service import SupabaseService, supabase
from services.qr_service import QRService

router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("/{patient_id}")
async def get_profile(patient_id: str):
    res = supabase.table("users").select("*").eq("id", patient_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = res.data[0]
    # Injected QR for Health ID
    profile["health_id_qr"] = QRService.generate_qr_base64(patient_id)
    
    return {"status": "success", "profile": profile}

@router.patch("/{patient_id}")
async def update_profile(patient_id: str, data: dict):
    res = supabase.table("users").update(data).eq("id", patient_id).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Update failed")
    
    return {"status": "success", "profile": res.data[0]}
