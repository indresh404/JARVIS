// data/bodyZones.ts

export interface BodyZone {
  id: string;
  label: string;
  position: [number, number, number]; // 3D world position on the model
  color: string;
  intensity: number; // 0.0 - 1.0
  severity: 'low' | 'medium' | 'high';
  description: string;
  symptoms: string[];
}

export const BODY_ZONES: BodyZone[] = [
  {
    id: 'head',
    label: 'Head',
    position: [0, 1.65, 0.05],
    color: '#ef4444',
    intensity: 0.85,
    severity: 'high',
    description: 'Persistent headache and tension detected in cranial region.',
    symptoms: ['Headache', 'Dizziness', 'Fatigue'],
  },
  {
    id: 'neck',
    label: 'Neck',
    position: [0, 1.45, 0.05],
    color: '#f97316',
    intensity: 0.6,
    severity: 'medium',
    description: 'Mild cervical strain. Possible postural issue.',
    symptoms: ['Stiffness', 'Soreness'],
  },
  {
    id: 'left_shoulder',
    label: 'Left Shoulder',
    position: [-0.22, 1.3, 0.0],
    color: '#f97316',
    intensity: 0.55,
    severity: 'medium',
    description: 'Rotator cuff tension detected.',
    symptoms: ['Aching', 'Limited range'],
  },
  {
    id: 'right_shoulder',
    label: 'Right Shoulder',
    position: [0.22, 1.3, 0.0],
    color: '#f59e0b',
    intensity: 0.4,
    severity: 'low',
    description: 'Minor tension. Monitor for escalation.',
    symptoms: ['Mild ache'],
  },
  {
    id: 'chest',
    label: 'Chest',
    position: [0, 1.15, 0.1],
    color: '#ef4444',
    intensity: 0.75,
    severity: 'high',
    description: 'Elevated cardiac stress markers. Consult a doctor.',
    symptoms: ['Tightness', 'Shortness of breath', 'Palpitations'],
  },
  {
    id: 'upper_back',
    label: 'Upper Back',
    position: [0, 1.2, -0.12],
    color: '#f97316',
    intensity: 0.65,
    severity: 'medium',
    description: 'Thoracic spinal tension. Likely postural.',
    symptoms: ['Stiffness', 'Dull pain'],
  },
  {
    id: 'abdomen',
    label: 'Abdomen',
    position: [0, 0.95, 0.1],
    color: '#f59e0b',
    intensity: 0.45,
    severity: 'low',
    description: 'Mild digestive discomfort noted.',
    symptoms: ['Bloating', 'Mild cramps'],
  },
  {
    id: 'lower_back',
    label: 'Lower Back',
    position: [0, 0.9, -0.12],
    color: '#ef4444',
    intensity: 0.8,
    severity: 'high',
    description: 'Lumbar strain detected. High pain probability.',
    symptoms: ['Sharp pain', 'Muscle spasms', 'Stiffness'],
  },
  {
    id: 'left_knee',
    label: 'Left Knee',
    position: [-0.1, 0.45, 0.05],
    color: '#f97316',
    intensity: 0.5,
    severity: 'medium',
    description: 'Patellar stress. Possible overuse injury.',
    symptoms: ['Aching', 'Swelling', 'Instability'],
  },
  {
    id: 'right_knee',
    label: 'Right Knee',
    position: [0.1, 0.45, 0.05],
    color: '#f59e0b',
    intensity: 0.35,
    severity: 'low',
    description: 'Minor joint stress. Rest recommended.',
    symptoms: ['Mild stiffness'],
  },
];

export const SEVERITY_COLORS = {
  low: '#f59e0b',
  medium: '#f97316',
  high: '#ef4444',
};

export const SEVERITY_LABELS = {
  low: 'Low Risk',
  medium: 'Moderate',
  high: 'High Risk',
};