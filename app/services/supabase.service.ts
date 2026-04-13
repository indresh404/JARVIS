import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/config/supabase';

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

const fetchFromSupabase = async (path: string) => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers });
  return response.json();
};

export const getPatientProfile = async (id: string) =>
  fetchFromSupabase(`patients?id=eq.${id}&select=*`);

export const getRiskScore = async (id: string) =>
  fetchFromSupabase(`patient_profile_summary?patient_id=eq.${id}&select=*`);

export const getSymptoms = async (id: string) =>
  fetchFromSupabase(
    `symptoms?patient_id=eq.${id}&date=gte.${new Date(Date.now() - 7 * 86400000).toISOString()}&select=*`,
  );

export const getMedicines = async (id: string) =>
  fetchFromSupabase(`medicines?patient_id=eq.${id}&is_active=eq.true&select=*`);
