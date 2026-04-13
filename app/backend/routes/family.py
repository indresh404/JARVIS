from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.supabase_service import SupabaseService
from services.qr_service import QRService

router = APIRouter(prefix="/family", tags=["family"])

class FamilyCreateRequest(BaseModel):
    name: str
    admin_id: str

class FamilyJoinRequest(BaseModel):
    patient_id: str
    join_code: str

@router.post("/create")
async def create_family(data: FamilyCreateRequest):
    family = SupabaseService.create_family(data.name, data.admin_id)
    if not family:
        raise HTTPException(status_code=500, detail="Failed to create family")
    
    # Generate QR for joining
    qr_b64 = QRService.generate_qr_base64(family["join_code"])
    
    return {"status": "success", "family": family, "join_qr": qr_b64}

@router.post("/join")
async def join_family(data: FamilyJoinRequest):
    result = SupabaseService.join_family(data.patient_id, data.join_code)
    if not result:
        raise HTTPException(status_code=404, detail="Invalid join code")
    
    return {"status": "success", "message": "Joined family successfully"}

@router.get("/members/{family_id}")
async def get_members(family_id: str):
    # This would link to family_groups and users table
    # For now returning a placeholder or implementing simple join if possible in supabase_service
    # Implementing a simple select in supabase_service for this would be better
    pass
