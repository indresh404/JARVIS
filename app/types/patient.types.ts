export interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  conditions: string[];
  medicines: string[];
  allergies: string[];
  familyHistory: string[];
  incomeCategory: string;
}

export interface RiskData {
  riskScore: number;
  riskLevel: 'Low' | 'Moderate' | 'Elevated' | 'High';
  riskReason: string;
  lastUpdated: string;
}

export interface Symptom {
  id: string;
  patientId: string;
  date: string;
  symptom: string;
  bodyZone: string;
  severity: 'Low' | 'Moderate' | 'High';
  status: 'active' | 'resolved';
}
