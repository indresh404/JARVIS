from pydantic import BaseModel, Field, validator
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime

# --- Common Models ---

class SymptomObj(BaseModel):
    symptom_name: str
    body_zone: Literal["head", "chest", "stomach", "back", "legs", "lungs", "systemic"]
    severity: int
    duration: Optional[str] = None
    onset: Optional[str] = None
    resolution_status: Optional[str] = "unknown"

# --- Chat Models ---

class PatientContext(BaseModel):
    rolling_summary: str
    profile_summary: str
    last_7_summaries: List[str]
    active_medications: List[str]
    pending_doctor_questions: List[Dict[str, str]]

class ChatMessageInput(BaseModel):
    message: str
    patient_id: str
    session_id: str
    patient_context: PatientContext

class SymptomExtraction(BaseModel):
    has_symptom: bool
    symptom: Optional[str] = None
    body_zone: Optional[Literal["head", "chest", "stomach", "back", "legs", "lungs", "systemic"]] = None
    severity: Optional[int] = None
    duration: Optional[str] = None
    onset: Optional[str] = None
    resolution_status: Literal["active", "improving", "resolved", "unknown"] = "unknown"
    confidence: int = 0
    save_ready: bool = False
    clarification_needed: bool = False
    confirmation_required: bool = False

class ChatResponse(BaseModel):
    bot_reply: str
    extracted_symptom: Optional[SymptomExtraction] = None
    clarification_needed: bool = False
    save_ready: bool = False
    confirmation_required: bool = False
    session_updated: bool = False

class SessionSummaryInput(BaseModel):
    patient_id: str
    full_conversation_log: List[Dict[str, str]]
    existing_rolling_summary: str

class SessionSummary(BaseModel):
    daily_summary: str
    rolling_summary: str
    symptoms_today: List[Dict[str, Any]]
    key_risks: str
    urgency: Literal["Routine", "Soon", "Urgent"]

class CheckinQuestionsInput(BaseModel):
    patient_id: str
    conditions: List[str]
    last_symptoms: List[str]
    wearable_flags: List[str]
    pending_doctor_questions: List[Dict[str, Any]]

class CheckinQuestion(BaseModel):
    text: str
    clinical_reason: str
    expected_data_type: Literal["severity_score", "boolean", "duration", "free_text"]
    pending_question_id: Optional[str] = None

class CheckinQuestionsResponse(BaseModel):
    questions: List[CheckinQuestion]

# --- Risk Models ---

class RiskGenerateInput(BaseModel):
    patient_id: str
    summary: str
    symptoms: List[SymptomObj]
    conditions: List[str]
    family_history: List[str]
    missed_meds_days: int
    wearable_flags: List[str]
    age: int

class RiskScore(BaseModel):
    base_score: int
    rag_adjustment: int
    final_score: int
    risk_level: Literal["Low", "Moderate", "Elevated", "High"]
    risk_reason: str
    guideline_reference: str
    confidence: int
    data_points_used: int

class RiskPredictInput(BaseModel):
    patient_id: str
    daily_summaries: List[str]
    risk_scores_history: List[Dict[str, Any]]
    symptoms_history: List[Dict[str, Any]]
    wearable_trend: List[Dict[str, Any]]
    current_medications: List[str]
    age: int
    conditions: List[str]

class HealthPrediction(BaseModel):
    trajectory: Literal["Improving", "Stable", "Unstable", "Worsening"]
    score_slope: float
    volatility: float
    projected_scores: List[int]
    predicted_risk_at_day_7: int
    predicted_risk_level_day_7: Literal["Low", "Moderate", "Elevated", "High"]
    early_warning: bool
    early_warning_symptom: Optional[str] = None
    prediction_summary: str
    watch_for: List[str]
    confidence: int
    confidence_note: str
    data_days_used: int

# --- Agent Models ---

class PatientProfile(BaseModel):
    conditions: List[str]
    medicines: List[Dict[str, str]]
    allergies: List[str]
    surgeries: List[str]
    family_history: Dict[str, List[str]]
    income_category: str

class OnboardInput(BaseModel):
    message: str
    session_state: Dict[str, Any]
    turn_number: int

class FamilySummaryInput(BaseModel):
    family_id: str
    members: List[Dict[str, Any]]

class DoctorAnswerInput(BaseModel):
    question: str
    patient_id: str
    full_context: Dict[str, Any]

class DoctorAnswerResponse(BaseModel):
    answer_found: bool
    answer: Optional[str] = None
    source_date: Optional[str] = None
    source_type: Optional[str] = None
    confidence: int
    suggested_patient_question: Optional[str] = None

# --- Safety Models ---

class DrugInteractionInput(BaseModel):
    new_medicine: str
    active_medicines: List[str]
    patient_conditions: List[str]

class DrugInteractionResponse(BaseModel):
    conflict_found: bool
    warning_text: Optional[str] = None
    severity_label: str
    medicine_risk_score: int
    recommendation: str
    source: Literal["openfda", "llm_fallback", "unavailable"]

class SmartwatchInput(BaseModel):
    patient_id: str
    metric: str
    current_values: List[float]
    baseline_14day: List[float]
    days_since_last_train: int

class SmartwatchResponse(BaseModel):
    anomaly_detected: bool
    metric: str
    deviation_score: float
    days_elevated: int
    ml_confidence: float
    detection_source: Literal["isolation_forest", "statistical_fallback", "none"]
    flag_context: str
    mean_baseline: float
    std_baseline: float

# --- Schemes Models ---

class SchemeMatchInput(BaseModel):
    patient_id: str
    age: int
    income_category: str
    state: str
    confirmed_conditions: List[str]
    current_risk_level: str

class Scheme(BaseModel):
    scheme_name: str
    conditions_covered: List[str]
    eligibility_summary: str
    coverage_amount: str
    documents_needed: List[str]
    treatment_types: List[str]

class Hospital(BaseModel):
    name: str
    address: str
    distance_km: float
    contact: str

class SchemesResponse(BaseModel):
    matched_schemes: List[Scheme]
    nearby_hospitals: List[Hospital]
