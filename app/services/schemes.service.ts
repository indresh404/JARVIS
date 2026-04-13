// services/schemes.service.ts
export interface GovernmentScheme {
  id: string;
  name: string;
  description: string;
  eligibility: string[];
  benefits: string[];
  diseases: string[]; // Diseases this scheme covers
  applicationLink: string;
  logo?: string;
}

// Mock data - replace with actual API call
const MOCK_SCHEMES: GovernmentScheme[] = [
  {
    id: '1',
    name: 'Ayushman Bharat - PMJAY',
    description: 'Health insurance scheme providing coverage up to ₹5 lakhs per family per year for secondary and tertiary care hospitalization.',
    eligibility: ['Family income below ₹2.5 lakhs per year', 'No income tax payer'],
    benefits: ['Cashless treatment', 'Pre-existing diseases covered from day 1', 'Coverage for 3 days pre-hospitalization and 15 days post-hospitalization'],
    diseases: ['Hypertension', 'Diabetes', 'Cardiovascular diseases', 'Cancer', 'Kidney diseases'],
    applicationLink: 'https://pmjay.gov.in/'
  },
  {
    id: '2',
    name: 'National Health Mission - Hypertension Control',
    description: 'India Hypertension Control Initiative (IHCI) for better management of hypertension.',
    eligibility: ['Diagnosed with hypertension', 'Indian citizen'],
    benefits: ['Free medication', 'Regular health check-ups', 'Lifestyle counseling'],
    diseases: ['Hypertension'],
    applicationLink: 'https://nhm.gov.in/'
  },
  {
    id: '3',
    name: 'National Programme for Prevention and Control of Cancer, Diabetes, CVDs & Stroke (NPCDCS)',
    description: 'Screening and management of common Non-Communicable Diseases (NCDs).',
    eligibility: ['Age 30 years and above', 'Diagnosed with NCDs'],
    benefits: ['Free screening camps', 'Medication at affordable rates', 'Health awareness programs'],
    diseases: ['Hypertension', 'Diabetes', 'Cardiovascular diseases', 'Cancer', 'Stroke'],
    applicationLink: 'https://main.mohfw.gov.in/'
  },
  {
    id: '4',
    name: 'Pradhan Mantri National Dialysis Programme',
    description: 'Free dialysis services for Below Poverty Line (BPL) patients.',
    eligibility: ['BPL card holder', 'Diagnosed with kidney disease requiring dialysis'],
    benefits: ['Free dialysis sessions', 'Transportation allowance'],
    diseases: ['Kidney diseases', 'Chronic Kidney Disease'],
    applicationLink: 'https://nhm.gov.in/'
  },
  {
    id: '5',
    name: 'Rashtriya Arogya Nidhi (RAN)',
    description: 'Financial assistance for treatment of life-threatening diseases.',
    eligibility: ['Below Poverty Line (BPL)', 'Diagnosed with life-threatening disease'],
    benefits: ['Financial assistance up to ₹15 lakhs', 'Treatment at government hospitals'],
    diseases: ['Cancer', 'Heart diseases', 'Kidney diseases', 'Liver diseases'],
    applicationLink: 'https://main.mohfw.gov.in/'
  }
];

export const getSchemesByDisease = async (disease: string): Promise<GovernmentScheme[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Filter schemes that cover the patient's disease
  return MOCK_SCHEMES.filter(scheme => 
    scheme.diseases.some(d => 
      d.toLowerCase().includes(disease.toLowerCase()) ||
      disease.toLowerCase().includes(d.toLowerCase())
    )
  );
};

export const getAllSchemes = async (): Promise<GovernmentScheme[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_SCHEMES;
};