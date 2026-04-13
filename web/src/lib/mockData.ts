import { Patient, Doctor, Review, Alert, BriefingEntry, Symptom, DailySummary, QnAEntry } from '../types';

export const MOCK_DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Sarah Johnson', email: 'sarah.j@swasthya.ai', qualification: 'MD, Cardiology', specialization: 'Cardiologist', experience_years: 15, rating: 4.9, review_count: 124, created_at: new Date().toISOString() },
  { id: 'd2', name: 'Dr. Michael Chen', email: 'm.chen@swasthya.ai', qualification: 'MBBS, MS Orthopaedics', specialization: 'Orthopaedic Surgeon', experience_years: 12, rating: 4.7, review_count: 89, created_at: new Date().toISOString() },
  { id: 'd3', name: 'Dr. Priya Sharma', email: 'priya.s@swasthya.ai', qualification: 'MD, Pediatrics', specialization: 'Pediatrician', experience_years: 8, rating: 4.8, review_count: 156, created_at: new Date().toISOString() },
  { id: 'd4', name: 'Dr. Robert Wilson', email: 'r.wilson@swasthya.ai', qualification: 'MD, Neurology', specialization: 'Neurologist', experience_years: 20, rating: 4.6, review_count: 210, created_at: new Date().toISOString() },
  { id: 'd5', name: 'Dr. Sunita Gupta', email: 's.gupta@swasthya.ai', qualification: 'MD, Oncology', specialization: 'Oncologist', experience_years: 25, rating: 5.0, review_count: 45, created_at: new Date().toISOString() }
];

export const MOCK_PATIENTS: Patient[] = [
  { 
    id: 'p1', 
    name: 'Amit Kumar', 
    age: 45, 
    gender: 'Male', 
    phone: '9876543210', 
    risk_score: 72, 
    risk_level: 'High', 
    risk_reason: 'Persistent hypertension and reported chest pain.',
    confidence: 85,
    last_visit_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    chronic_diseases: ['Hypertension', 'Type 2 Diabetes']
  },
  { 
    id: 'p2', 
    name: 'Neha Singh', 
    age: 32, 
    gender: 'Female', 
    phone: '9876543211', 
    risk_score: 25, 
    risk_level: 'Low', 
    risk_reason: 'Stable vitals.',
    confidence: 92,
    last_visit_date: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  { 
    id: 'p3', 
    name: 'Rajesh Mehra', 
    age: 58, 
    gender: 'Male', 
    phone: '9876543212', 
    risk_score: 55, 
    risk_level: 'Elevated', 
    risk_reason: 'Increasing joint pain and reduced mobility.',
    confidence: 78,
    last_visit_date: new Date(Date.now() - 86400000 * 1).toISOString(),
    conditions: ['Osteoarthritis']
  }
];

export const MOCK_ALERTS: Alert[] = [
  { id: 'a1', patient_id: 'p1', patient_name: 'Amit Kumar', alert_type: 'symptom', message: 'Critical: Sudden spike in chest pain severity reported.', risk_score: 82, risk_level: 'High', is_read: false, created_at: new Date().toISOString() },
  { id: 'a2', patient_id: 'p3', patient_name: 'Rajesh Mehra', alert_type: 'auto', message: 'Trend: Risk score increasing over last 3 days.', risk_score: 58, risk_level: 'Elevated', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString() }
];

export const MOCK_BRIEFING: BriefingEntry[] = [
  { patient_id: 'p1', name: 'Amit Kumar', flag: 'Severe chest pain reported 2h ago. High cardiac risk.', priority: 'Urgent', risk_level: 'High' },
  { patient_id: 'p3', name: 'Rajesh Mehra', flag: 'Mobility score dropped by 30%. Joint inflammation suspected.', priority: 'Soon', risk_level: 'Elevated' }
];

export const MOCK_SYMPTOMS: Symptom[] = [
  { 
    id: 's1', 
    patient_id: 'p1', 
    symptom_name: 'Chest Pain', 
    body_zone: 'chest', 
    severity: 8, 
    resolution_status: 'active', 
    created_at: new Date().toISOString(),
    description: 'Sharp, stabbing pain in the upper chest area, worsening with deep breaths.',
    precautions: 'Avoid heavy lifting, rest in a seated position, and monitor for radiating pain to the left arm.'
  },
  { 
    id: 's2', 
    patient_id: 'p1', 
    symptom_name: 'Shortness of Breath', 
    body_zone: 'lungs', 
    severity: 6, 
    resolution_status: 'active', 
    created_at: new Date().toISOString(),
    description: 'Difficulty breathing even at rest, feeling of not getting enough air.',
    precautions: 'Use a pulse oximeter to monitor oxygen levels, practice pursed-lip breathing, and avoid smoke or pollutants.'
  },
  { 
    id: 's3', 
    patient_id: 'p3', 
    symptom_name: 'Knee Pain', 
    body_zone: 'legs', 
    severity: 5, 
    resolution_status: 'active', 
    created_at: new Date().toISOString(),
    description: 'Dull ache in the right knee, stiffness in the morning.',
    precautions: 'Apply cold compress for 15 minutes, avoid stairs, and perform gentle range-of-motion exercises.'
  },
  {
    id: 's4',
    patient_id: 'p1',
    symptom_name: 'Migraine',
    body_zone: 'head',
    severity: 7,
    resolution_status: 'active',
    created_at: new Date().toISOString(),
    description: 'Throbbing headache on the right side, accompanied by light sensitivity.',
    precautions: 'Rest in a dark, quiet room, stay hydrated, and avoid caffeine or strong smells.'
  }
];

export const MOCK_REVIEWS: Review[] = [
  { id: 'r1', doctor_id: 'd1', patient_id: 'p1', patient_name: 'Amit Kumar', rating: 5, comment: 'Dr. Sarah is extremely knowledgeable and patient. She explained my heart condition in a way I could finally understand.', created_at: new Date().toISOString() },
  { id: 'r2', doctor_id: 'd1', patient_id: 'p2', patient_name: 'Neha Singh', rating: 4, comment: 'Very professional. The wait time was a bit long but the consultation was thorough.', created_at: new Date().toISOString() },
  { id: 'r3', doctor_id: 'd5', patient_id: 'p3', patient_name: 'Rajesh Mehra', rating: 5, comment: 'The best oncologist I have ever met. Her empathy and expertise are unmatched.', created_at: new Date().toISOString() }
];
