import os
from supabase import create_client, Client
from dotenv import load_dotenv
import uuid
from datetime import datetime

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class SupabaseService:
    @staticmethod
    def get_user_by_phone(phone: str):
        res = supabase.table("users").select("*").eq("phone", phone).execute()
        return res.data[0] if res.data else None

    @staticmethod
    def create_user(phone: str, name: str = "New User"):
        user_id = str(uuid.uuid4())
        data = {
            "id": user_id,
            "phone": phone,
            "name": name,
            "created_at": datetime.now().isoformat()
        }
        res = supabase.table("users").insert(data).execute()
        return res.data[0] if res.data else None

    @staticmethod
    def save_message(patient_id: str, session_id: str, role: str, content: str):
        data = {
            "patient_id": patient_id,
            "session_id": session_id,
            "role": role,
            "content": content,
            "created_at": datetime.now().isoformat()
        }
        res = supabase.table("conversation_messages").insert(data).execute()
        return res.data

    @staticmethod
    def save_symptom(patient_id: str, session_id: str, symptom_data: dict):
        data = {
            "patient_id": patient_id,
            "session_id": session_id,
            "symptom_name": symptom_data.get("symptom"),
            "body_zone": symptom_data.get("body_zone"),
            "severity": symptom_data.get("severity"),
            "onset": symptom_data.get("onset"),
            "resolution_status": symptom_data.get("resolution_status", "active"),
            "created_at": datetime.now().isoformat()
        }
        res = supabase.table("symptoms").insert(data).execute()
        return res.data

    @staticmethod
    def get_medicines(patient_id: str):
        res = supabase.table("medicines").select("*").eq("patient_id", patient_id).eq("is_active", True).execute()
        return res.data

    @staticmethod
    def log_adherence(patient_id: str, medicine: str):
        data = {
            "patient_id": patient_id,
            "medicine": medicine,
            "taken_at": datetime.now().isoformat()
        }
        res = supabase.table("adherence_log").insert(data).execute()
        return res.data

    @staticmethod
    def get_pending_questions(patient_id: str):
        res = supabase.table("pending_checkin_questions").select("*").eq("patient_id", patient_id).eq("status", "pending").execute()
        return res.data

    @staticmethod
    def submit_checkin(patient_id: str, questions: list):
        data = {
            "patient_id": patient_id,
            "date": datetime.now().date().isoformat(),
            "questions": questions,
            "created_at": datetime.now().isoformat()
        }
        res = supabase.table("checkin_questions").insert(data).execute()
        return res.data

    @staticmethod
    def create_family(name: str, created_by: str):
        family_id = str(uuid.uuid4())
        join_code = str(uuid.uuid4())[:8].upper()
        data = {
            "id": family_id,
            "family_name": name,
            "created_by": created_by,
            "join_code": join_code,
            "created_at": datetime.now().isoformat()
        }
        res = supabase.table("families").insert(data).execute()
        if res.data:
            # Add creator to family_groups
            supabase.table("family_groups").insert({
                "family_id": family_id,
                "patient_id": created_by,
                "role": "admin"
            }).execute()
        return res.data[0] if res.data else None

    @staticmethod
    def get_family_members(family_id: str):
        # Join family_groups with users
        res = supabase.table("family_groups").select("patient_id, role, users(*)").eq("family_id", family_id).execute()
        return res.data

    @staticmethod
    def join_family(patient_id: str, join_code: str):
        # Find family by code
        res = supabase.table("families").select("id").eq("join_code", join_code).execute()
        if not res.data:
            return None
        
        family_id = res.data[0]["id"]
        # Add user to family_groups
        group_res = supabase.table("family_groups").insert({
            "family_id": family_id,
            "patient_id": patient_id,
            "role": "member"
        }).execute()
        return group_res.data
