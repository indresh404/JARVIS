from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.supabase_service import SupabaseService
import random

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    phone: str

class VerifyRequest(BaseModel):
    phone: str
    otp: str

@router.post("/login")
async def login(data: LoginRequest):
    """
    Step 1: Check if user exists or initiate sign up.
    In this demo, we use a mock OTP '123456'.
    """
    user = SupabaseService.get_user_by_phone(data.phone)
    # If user doesn't exist, we'll create them during verification for simplicity
    return {"message": "OTP sent to your phone", "status": "success", "mock_otp": "123456"}

@router.post("/verify")
async def verify(data: VerifyRequest):
    """
    Step 2: Verify OTP and return profile.
    """
    if data.otp != "123456":
        raise HTTPException(status_code=401, detail="Invalid OTP")
    
    user = SupabaseService.get_user_by_phone(data.phone)
    if not user:
        # Auto-signup
        user = SupabaseService.create_user(data.phone, name=f"User {data.phone[-4:]}")
    
    return {
        "status": "success",
        "user": user,
        "session_token": "mock-jwt-token" # In production, return real JWT
    }
