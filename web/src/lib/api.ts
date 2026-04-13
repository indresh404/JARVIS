import { supabase } from './supabase';
import { Patient, Alert, BriefingEntry, Symptom, DailySummary, QnAEntry, RiskLevel, Doctor, Review } from '../types';
import * as mock from './mockData';

const isUsingPlaceholder = (supabase as any).supabaseUrl?.includes('placeholder');

export const api = {
  async getPatients() {
    if (isUsingPlaceholder) return mock.MOCK_PATIENTS;

    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          patient_risk_scores (
            final_score,
            risk_level,
            risk_reason,
            confidence
          )
        `)
        .order('current_risk_score', { ascending: false });

      if (error || !data || data.length === 0) return mock.MOCK_PATIENTS;
      
      const mapRiskLevel = (level: string | undefined): RiskLevel => {
        if (!level) return 'Low';
        const l = level.toLowerCase();
        if (l === 'green' || l === 'low') return 'Low';
        if (l === 'yellow' || l === 'moderate') return 'Moderate';
        if (l === 'orange' || l === 'elevated') return 'Elevated';
        if (l === 'red' || l === 'high') return 'High';
        return 'Low';
      };

      return data.map(p => {
        const riskData = Array.isArray(p.patient_risk_scores) 
          ? p.patient_risk_scores[0] 
          : p.patient_risk_scores;

        return {
          ...p,
          risk_score: riskData?.final_score || p.current_risk_score || 0,
          risk_level: mapRiskLevel(riskData?.risk_level || p.risk_level),
          risk_reason: riskData?.risk_reason,
          confidence: riskData?.confidence
        };
      });
    } catch (e) {
      return mock.MOCK_PATIENTS;
    }
  },

  async getPatientDetail(patientId: string) {
    if (isUsingPlaceholder || patientId.startsWith('p')) {
      const p = mock.MOCK_PATIENTS.find(p => p.id === patientId) || mock.MOCK_PATIENTS[0];
      return {
        ...p,
        symptoms: mock.MOCK_SYMPTOMS.filter(s => s.patient_id === p.id),
        medicines: [],
        health_predictions: { trajectory: 'Stable', risk_reason: p.risk_reason },
        daily_summaries: []
      };
    }

    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        patient_risk_scores (*),
        health_predictions (*),
        medicines (*),
        symptoms (*),
        daily_summaries (*)
      `)
      .eq('id', patientId)
      .single();

    if (error) throw error;
    return data;
  },

  async getAlerts(doctorId?: string) {
    if (isUsingPlaceholder) return mock.MOCK_ALERTS;

    try {
      let query = supabase
        .from('doctor_alerts')
        .select(`
          *,
          users (name)
        `)
        .order('created_at', { ascending: false });

      if (doctorId) {
        query = query.eq('doctor_id', doctorId);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) return mock.MOCK_ALERTS;
      
      return data.map(a => ({
        ...a,
        patient_name: (a as any).users?.name
      })) as Alert[];
    } catch (e) {
      return mock.MOCK_ALERTS;
    }
  },

  async markAlertsRead(doctorId: string) {
    if (isUsingPlaceholder) return;
    const { error } = await supabase
      .from('doctor_alerts')
      .update({ is_read: true })
      .eq('doctor_id', doctorId)
      .eq('is_read', false);

    if (error) throw error;
  },

  async getMorningBriefing(doctorId: string) {
    if (isUsingPlaceholder) return mock.MOCK_BRIEFING;
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('doctor_briefing')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('date', today)
        .single();

      if (error || !data) return mock.MOCK_BRIEFING;
      return data?.briefing as BriefingEntry[] || mock.MOCK_BRIEFING;
    } catch (e) {
      return mock.MOCK_BRIEFING;
    }
  },

  async getSymptoms(patientId: string) {
    if (isUsingPlaceholder || patientId.startsWith('p')) {
      return mock.MOCK_SYMPTOMS.filter(s => s.patient_id === patientId);
    }
    const { data, error } = await supabase
      .from('symptoms')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data as Symptom[];
  },

  async getQnA(patientId: string) {
    if (isUsingPlaceholder) return [];
    const { data, error } = await supabase
      .from('pending_checkin_questions')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data as QnAEntry[];
  },

  async addMedicine(patientId: string, medicine: any) {
    if (isUsingPlaceholder) return { id: 'm-new', ...medicine };
    const { data, error } = await supabase
      .from('medicines')
      .insert({
        patient_id: patientId,
        medicine_name: medicine.name,
        is_active: true,
        is_critical: medicine.is_critical || false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async seedSampleData() {
    const samplePatients = [
      { name: 'Patient 1', age: 45, gender: 'Male', phone: '9876543210', current_risk_score: 72, risk_level: 'High' },
      { name: 'Patient 2', age: 32, gender: 'Female', phone: '9876543211', current_risk_score: 25, risk_level: 'Low' },
      { name: 'Patient 3', age: 58, gender: 'Male', phone: '9876543212', current_risk_score: 55, risk_level: 'Elevated' }
    ];

    const { data, error } = await supabase
      .from('users')
      .insert(samplePatients)
      .select();

    if (error) throw error;
    return data;
  },

  async getDoctors() {
    if (isUsingPlaceholder) return mock.MOCK_DOCTORS;
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('rating', { ascending: false });

      if (error || !data || data.length === 0) return mock.MOCK_DOCTORS;
      return data as Doctor[];
    } catch (e) {
      return mock.MOCK_DOCTORS;
    }
  },

  async getDoctorReviews(doctorId: string) {
    if (isUsingPlaceholder) {
      return mock.MOCK_REVIEWS.filter(r => r.doctor_id === doctorId);
    }
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return mock.MOCK_REVIEWS.filter(r => r.doctor_id === doctorId);
      }
      return data as Review[];
    } catch (e) {
      return mock.MOCK_REVIEWS.filter(r => r.doctor_id === doctorId);
    }
  },

  async seedDoctorData() {
    const sampleDoctors = [
      { id: 'd1111111-1111-1111-1111-111111111111', name: 'Dr. Sarah Johnson', email: 'sarah.j@swasthya.ai', qualification: 'MD, Cardiology', specialization: 'Cardiologist', experience_years: 15, rating: 4.9, review_count: 124 },
      { id: 'd2222222-2222-2222-2222-222222222222', name: 'Dr. Michael Chen', email: 'm.chen@swasthya.ai', qualification: 'MBBS, MS Orthopaedics', specialization: 'Orthopaedic Surgeon', experience_years: 12, rating: 4.7, review_count: 89 },
      { id: 'd3333333-3333-3333-3333-333333333333', name: 'Dr. Priya Sharma', email: 'priya.s@swasthya.ai', qualification: 'MD, Pediatrics', specialization: 'Pediatrician', experience_years: 8, rating: 4.8, review_count: 156 },
      { id: 'd4444444-4444-4444-4444-444444444444', name: 'Dr. Robert Wilson', email: 'r.wilson@swasthya.ai', qualification: 'MD, Neurology', specialization: 'Neurologist', experience_years: 20, rating: 4.6, review_count: 210 },
      { id: 'd5555555-5555-5555-5555-555555555555', name: 'Dr. Ananya Iyer', email: 'ananya.i@swasthya.ai', qualification: 'MD, Endocrinology', specialization: 'Endocrinologist', experience_years: 10, rating: 4.5, review_count: 75 },
      { id: 'd6666666-6666-6666-6666-666666666666', name: 'Dr. David Miller', email: 'd.miller@swasthya.ai', qualification: 'MD, Dermatology', specialization: 'Dermatologist', experience_years: 18, rating: 4.4, review_count: 112 },
      { id: 'd7777777-7777-7777-7777-777777777777', name: 'Dr. Sunita Gupta', email: 's.gupta@swasthya.ai', qualification: 'MD, Oncology', specialization: 'Oncologist', experience_years: 25, rating: 5.0, review_count: 45 }
    ];

    const sampleReviews = [
      { doctor_id: 'd1111111-1111-1111-1111-111111111111', patient_name: 'Amit K.', rating: 5, comment: 'Excellent doctor, very attentive to details.' },
      { doctor_id: 'd1111111-1111-1111-1111-111111111111', patient_name: 'Neha S.', rating: 4, comment: 'Great experience, highly recommended.' },
      { doctor_id: 'd7777777-7777-7777-7777-777777777777', patient_name: 'Rajesh M.', rating: 5, comment: 'The best oncologist in the city. Truly life-saving.' }
    ];

    const { error: docError } = await supabase
      .from('doctors')
      .upsert(sampleDoctors);

    if (docError) throw docError;

    const { error: revError } = await supabase
      .from('reviews')
      .upsert(sampleReviews);

    if (revError) throw revError;

    return { doctors: sampleDoctors, reviews: sampleReviews };
  },

  async seedAllData() {
    // 1. Seed Doctors
    const doctors = await this.seedDoctorData();
    const doctorId = doctors.doctors[0].id;

    // 2. Seed Patients (Users)
    const samplePatients = [
      { id: 'p1111111-1111-1111-1111-111111111111', name: 'Amit Kumar', age: 45, gender: 'Male', phone: '9876543210', current_risk_score: 72, risk_level: 'High', doctor_id: doctorId },
      { id: 'p2222222-2222-2222-2222-222222222222', name: 'Neha Singh', age: 32, gender: 'Female', phone: '9876543211', current_risk_score: 25, risk_level: 'Low', doctor_id: doctorId },
      { id: 'p3333333-3333-3333-3333-333333333333', name: 'Rajesh Mehra', age: 58, gender: 'Male', phone: '9876543212', current_risk_score: 55, risk_level: 'Elevated', doctor_id: doctorId }
    ];

    const { error: userError } = await supabase.from('users').upsert(samplePatients);
    if (userError) throw userError;

    // 3. Seed Risk Scores
    const riskScores = samplePatients.map(p => ({
      patient_id: p.id,
      final_score: p.current_risk_score,
      risk_level: p.risk_level,
      risk_reason: p.risk_level === 'High' ? 'Persistent hypertension and reported chest pain.' : 'Stable vitals.',
      confidence: 85
    }));
    await supabase.from('patient_risk_scores').upsert(riskScores);

    // 4. Seed Symptoms
    const symptoms = [
      { patient_id: 'p1111111-1111-1111-1111-111111111111', symptom_name: 'Chest Pain', body_zone: 'chest', severity: 8, onset: 'Morning' },
      { patient_id: 'p1111111-1111-1111-1111-111111111111', symptom_name: 'Shortness of Breath', body_zone: 'lungs', severity: 6, onset: 'After walking' },
      { patient_id: 'p3333333-3333-3333-3333-333333333333', symptom_name: 'Joint Pain', body_zone: 'legs', severity: 4, onset: 'Evening' }
    ];
    await supabase.from('symptoms').upsert(symptoms);

    // 5. Seed Alerts
    const alerts = [
      { patient_id: 'p1111111-1111-1111-1111-111111111111', doctor_id: doctorId, risk_score: 82, risk_level: 'High', message: 'Critical: Sudden spike in chest pain severity reported.', alert_type: 'symptom' },
      { patient_id: 'p3333333-3333-3333-3333-333333333333', doctor_id: doctorId, risk_score: 58, risk_level: 'Elevated', message: 'Trend: Risk score increasing over last 3 days.', alert_type: 'auto' }
    ];
    await supabase.from('doctor_alerts').upsert(alerts);

    // 6. Seed Daily Summaries
    const summaries = samplePatients.map(p => ({
      patient_id: p.id,
      date: new Date().toISOString().split('T')[0],
      daily_summary: `Patient ${p.name} reported ${p.risk_level === 'High' ? 'severe' : 'mild'} symptoms today. Vitals are ${p.risk_level === 'High' ? 'unstable' : 'within normal range'}.`,
      key_risks: p.risk_level === 'High' ? 'Cardiac arrest risk' : 'None',
      urgency: p.risk_level === 'High' ? 'Urgent' : 'Routine'
    }));
    await supabase.from('daily_summaries').upsert(summaries);

    return { success: true };
  }
};
