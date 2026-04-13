export type RiskLevel = 'Low' | 'Moderate' | 'Elevated' | 'High';
export type AlertType = 'auto' | 'manual' | 'symptom' | 'adherence';
export type Urgency = 'Routine' | 'Soon' | 'Urgent';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  risk_score: number;
  risk_level: RiskLevel;
  risk_reason?: string;
  confidence?: number;
  last_updated?: string;
  family_id?: string;
  chronic_diseases?: string[];
  allergies?: string[];
  conditions?: string[];
  last_visit_date?: string;
}

export interface Alert {
  id: string;
  patient_id: string;
  patient_name?: string;
  alert_type: string;
  message: string;
  risk_score?: number;
  risk_level?: string;
  is_read: boolean;
  created_at: string;
}

export interface BriefingEntry {
  patient_id: string;
  name: string;
  flag: string;
  priority: Urgency;
  risk_level: RiskLevel;
}

export interface Symptom {
  id: string;
  patient_id: string;
  symptom_name: string;
  body_zone: string;
  severity: number;
  onset?: string;
  resolution_status: string;
  description?: string;
  precautions?: string;
  created_at: string;
}

export interface DailySummary {
  id: string;
  patient_id: string;
  date: string;
  daily_summary: string;
  symptoms_today: any[];
  key_risks: string;
  urgency: Urgency;
}

export interface QnAEntry {
  id: string;
  question: string;
  patient_answer?: string;
  status: 'pending' | 'answered' | 'expired';
  created_at: string;
  answered_at?: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  qualification: string;
  specialization: string;
  experience_years: number;
  rating: number;
  review_count: number;
  avatar_url?: string;
  created_at: string;
}

export interface Review {
  id: string;
  doctor_id: string;
  patient_id: string;
  patient_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Scheme {
  name: string;
  description: string;
  coverage_amount: string;
  conditions_covered: string[];
  documents_needed: string[];
  nearest_hospital: string;
}
