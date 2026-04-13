import { create } from 'zustand';
import { Patient, Symptom } from '@/types/patient.types';

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  scheduledTime: string;
  taken?: boolean;
}

interface PatientState {
  profile: Patient | null;
  riskScore: number;
  riskLevel: string;
  riskReason: string;
  symptoms: Symptom[];
  medicines: Medicine[];
  setProfile: (profile: Patient | null) => void;
  setRiskData: (riskScore: number, riskLevel: string, riskReason: string) => void;
  setSymptoms: (symptoms: Symptom[]) => void;
  setMedicines: (medicines: Medicine[]) => void;
}

export const usePatientStore = create<PatientState>((set) => ({
  profile: null,
  riskScore: 72,
  riskLevel: 'Elevated',
  riskReason: 'Elevated cardiovascular stress and reduced sleep quality this week.',
  symptoms: [],
  medicines: [],
  setProfile: (profile) => set({ profile }),
  setRiskData: (riskScore, riskLevel, riskReason) => set({ riskScore, riskLevel, riskReason }),
  setSymptoms: (symptoms) => set({ symptoms }),
  setMedicines: (medicines) => set({ medicines }),
}));
