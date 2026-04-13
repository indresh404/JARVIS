import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/config/supabase';

WebBrowser.maybeCompleteAuthSession();

export const normalizePhone = (value: string) => value.replace(/\D/g, '').slice(-10);

const OAUTH_CALLBACK_PATH = 'auth/callback';

// OTP Storage for local testing
const OTP_STORAGE_KEY = 'pending_otp';

export interface PendingOTP {
  phone: string;
  otp: string;
  timestamp: number;
  expiresIn: number; // milliseconds
}

export interface PatientRecord {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  phone: string | null;
  family_id: string | null;
  created_at?: string;
}

export interface FamilyRecord {
  id: string;
  family_name: string | null;
  qr_code: string | null;
  created_by: string | null;
  created_at: string;
  join_code: string | null;
}

export const getRedirectUrl = () => Linking.createURL(OAUTH_CALLBACK_PATH);

const isRlsError = (error: unknown) =>
  Boolean(error && typeof error === 'object' && (error as { code?: string }).code === '42501');

// OTP Functions for Dynamic Generation
export const generateRandomOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create user for phone auth (handles RLS gracefully)
export const createPhoneAuthUser = async (phone: string, name?: string): Promise<PatientRecord | null> => {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) return null;

  console.log('=== Creating Phone Auth User ===');
  console.log('Phone:', normalizedPhone, 'Name:', name);

  // Check if user already exists by phone
  const existingUser = await getPatientByPhone(normalizedPhone);
  if (existingUser) {
    console.log('User already exists:', existingUser.id);
    return existingUser;
  }

  // For new users, return a temporary user object
  // The actual user record will be created during profile setup
  const tempUserId = `temp_${normalizedPhone}`;
  console.log('Returning temporary user object for new phone:', normalizedPhone);
  
  return {
    id: tempUserId,
    name: name?.trim() || 'User',
    phone: normalizedPhone,
    age: null,
    gender: null,
    family_id: null,
    created_at: new Date().toISOString(),
  };
};

export const storeOTPLocally = async (phone: string, otp: string): Promise<void> => {
  const normalized = normalizePhone(phone);
  const pendingOtp: PendingOTP = {
    phone: normalized,
    otp,
    timestamp: Date.now(),
    expiresIn: 10 * 60 * 1000, // 10 minutes
  };
  console.log('Storing OTP:', { normalized, otp, timestamp: new Date(pendingOtp.timestamp).toISOString() });
  await AsyncStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(pendingOtp));
  console.log('OTP stored successfully');
};

export const getStoredOTP = async (phone: string): Promise<string | null> => {
  const normalized = normalizePhone(phone);
  const stored = await AsyncStorage.getItem(OTP_STORAGE_KEY);
  console.log('Getting OTP for phone:', normalized, 'Raw stored:', stored);
  
  if (!stored) {
    console.log('No OTP found in storage');
    return null;
  }

  try {
    const pendingOtp: PendingOTP = JSON.parse(stored);
    const isExpired = Date.now() - pendingOtp.timestamp > pendingOtp.expiresIn;
    const isPhoneMatch = pendingOtp.phone === normalized;
    
    console.log('OTP Details:', {
      storedPhone: pendingOtp.phone,
      requestedPhone: normalized,
      phoneMatch: isPhoneMatch,
      isExpired,
      age: Date.now() - pendingOtp.timestamp,
      expiresIn: pendingOtp.expiresIn,
    });

    if (isExpired || !isPhoneMatch) {
      console.log('OTP invalid - expired or phone mismatch');
      await AsyncStorage.removeItem(OTP_STORAGE_KEY);
      return null;
    }

    console.log('Returning stored OTP:', pendingOtp.otp);
    return pendingOtp.otp;
  } catch (error) {
    console.error('Error parsing OTP:', error);
    return null;
  }
};

export const clearStoredOTP = async (): Promise<void> => {
  console.log('Clearing stored OTP');
  await AsyncStorage.removeItem(OTP_STORAGE_KEY);
  console.log('OTP cleared');
};

const ensureAuthenticatedSession = async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (sessionData.session) return sessionData.session;

  const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
  if (anonError) return null;
  return anonData.session ?? null;
};

export const signInWithGoogle = async () => {
  const redirectTo = getRedirectUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data?.url) throw new Error('Unable to start Google sign in.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success' || !result.url) {
    throw new Error('Google sign in was cancelled.');
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(result.url);
  if (sessionError) throw sessionError;

  return sessionData.session;
};

export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const ensureUserRowForSession = async (input: {
  userId: string;
  phone: string;
  name?: string;
}) => {
  const normalizedPhone = normalizePhone(input.phone);
  if (!normalizedPhone) return null;

  const { data: byId, error: byIdError } = await supabase
    .from('users')
    .select('*')
    .eq('id', input.userId)
    .maybeSingle();
  if (byIdError && !isRlsError(byIdError)) throw byIdError;
  if (byId) return byId as PatientRecord;

  const { data: byPhone, error: byPhoneError } = await supabase
    .from('users')
    .select('*')
    .eq('phone', normalizedPhone)
    .maybeSingle();
  if (byPhoneError && !isRlsError(byPhoneError)) throw byPhoneError;
  if (byPhone) return byPhone as PatientRecord;

  const { data: inserted, error: insertError } = await supabase
    .from('users')
    .insert({
      id: input.userId,
      name: input.name?.trim() || 'User',
      phone: normalizedPhone,
    })
    .select('*')
    .maybeSingle();

  if (insertError && !isRlsError(insertError)) throw insertError;
  return (inserted as PatientRecord | null) ?? null;
};

export const getPatientByPhone = async (phone: string) => {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', normalizedPhone)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as PatientRecord | null;
};

export const getPatientById = async (id: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as PatientRecord | null;
};

export const getCurrentPatient = async () => {
  // This is now a no-op since we don't use Supabase auth sessions
  // Patient info is managed through Redux store and phone number
  return null;
};

export const savePatientProfile = async (input: {
  patientId?: string | null;
  name: string;
  age: number;
  gender: string;
  phone: string;
  familyId?: string | null;
}) => {
  console.log('=== Saving Patient Profile ===');
  console.log('PatientId:', input.patientId, 'Phone:', input.phone);

  const payload = {
    name: input.name.trim(),
    age: input.age,
    gender: input.gender,
    phone: normalizePhone(input.phone),
    family_id: input.familyId ?? null,
  };

  let patient: PatientRecord | null = null;

  if (input.patientId) {
    const { data, error } = await supabase
      .from('users')
      .update(payload)
      .eq('id', input.patientId)
      .select('*')
      .single();

    if (error) throw error;
    patient = data as PatientRecord;
  } else {
    const existingByPhone = await getPatientByPhone(payload.phone);
    if (existingByPhone) {
      const { data, error } = await supabase
        .from('users')
        .update(payload)
        .eq('id', existingByPhone.id)
        .select('*')
        .single();

      if (error) throw error;
      patient = data as PatientRecord;
    } else {
      const { data, error } = await supabase
        .from('users')
        .insert(payload)
        .select('*')
        .single();

      if (error) throw error;
      patient = data as PatientRecord;
    }
  }

  console.log('Patient profile saved:', patient?.id);
  return patient;
};

const generateJoinCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const getUniqueJoinCode = async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateJoinCode();
    const { data, error } = await supabase
      .from('families')
      .select('id')
      .eq('join_code', code)
      .maybeSingle();

    if (error) throw error;
    if (!data) return code;
  }

  throw new Error('Unable to generate a unique family code. Please try again.');
};

export const createFamilyForPatient = async (familyName: string, patient: PatientRecord) => {
  const joinCode = await getUniqueJoinCode();
  console.log('Creating family:', familyName, 'for patient:', patient.id, 'with code:', joinCode);

  const { data: family, error: familyError } = await supabase
    .from('families')
    .insert({
      family_name: familyName.trim(),
      created_by: patient.id,
      join_code: joinCode,
    })
    .select('*')
    .single();

  if (familyError) {
    console.error('Family creation error:', familyError);
    throw new Error(`Failed to create family: ${familyError.message}`);
  }

  if (!family) {
    throw new Error('Family creation returned no data. Please try again.');
  }

  console.log('Family created:', family.id);

  // Update patient with family ID
  const { error: patientUpdateError } = await supabase
    .from('users')
    .update({ family_id: family.id })
    .eq('id', patient.id);

  if (patientUpdateError) {
    console.error('Patient update error:', patientUpdateError);
    throw new Error(`Failed to update patient family: ${patientUpdateError.message}`);
  } else {
    console.log('Patient family ID updated successfully');
  }

  // Add patient to family_groups as admin
  const { error: memberError } = await supabase
    .from('family_groups')
    .insert({
      family_id: family.id,
      patient_id: patient.id,
      role: 'admin',
    });

  if (memberError) {
    if (memberError.code === '23505') {
      console.log('Admin member already exists (duplicate key)');
    } else {
      console.error('Member add error:', memberError);
      throw new Error(`Failed to add admin to family: ${memberError.message}`);
    }
  } else {
    console.log('Patient added to family as admin successfully');
  }

  return {
    family: family as FamilyRecord,
    joinCode,
  };
};

export const joinFamilyForPatient = async (joinCode: string, patient: PatientRecord) => {
  const normalizedCode = joinCode.trim();
  console.log('Joining family with code:', normalizedCode, 'patient:', patient.id);

  const { data: family, error: familyError } = await supabase
    .from('families')
    .select('*')
    .eq('join_code', normalizedCode)
    .maybeSingle();

  if (familyError) {
    console.error('Family lookup error:', familyError);
    throw new Error(`Failed to lookup family: ${familyError.message}`);
  }

  if (!family) {
    console.warn('No family found with code:', normalizedCode);
    console.log('Tip: Check that the family was created successfully and the code is correct');
    throw new Error('Invalid family code. Please check and try again.');
  }

  console.log('Found family:', family.id, 'Name:', family.family_name);

  try {
    const { data: existingMember, error: existingError } = await supabase
      .from('family_groups')
      .select('id')
      .eq('family_id', family.id)
      .eq('patient_id', patient.id)
      .maybeSingle();

    if (existingError && !isRlsError(existingError)) {
      console.error('Existing member check error:', existingError);
      throw new Error(`Failed to check family membership: ${existingError.message}`);
    }

    if (!existingMember) {
      console.log('Adding patient to family group');
      const { error: memberError } = await supabase
        .from('family_groups')
        .insert({
          family_id: family.id,
          patient_id: patient.id,
          role: 'member',
        });

      if (memberError) {
        if (memberError.code === '23505') {
          console.log('Member already exists (duplicate key)');
        } else if (isRlsError(memberError)) {
          console.warn('RLS policy prevented member addition, but continuing');
        } else {
          console.error('Member addition error:', memberError);
          throw new Error(`Failed to add member to family: ${memberError.message}`);
        }
      } else {
        console.log('Patient added to family group successfully');
      }
    } else {
      console.log('Patient is already a member of this family');
    }
  } catch (error) {
    console.error('Family membership error:', error);
    throw error;
  }

  console.log('Updating patient family ID');
  const { error: patientUpdateError } = await supabase
    .from('users')
    .update({ family_id: family.id })
    .eq('id', patient.id);

  if (patientUpdateError) {
    if (isRlsError(patientUpdateError)) {
      console.warn('RLS policy prevented patient update, but family join may still be valid');
    } else {
      console.error('Patient update error:', patientUpdateError);
      throw new Error(`Failed to update patient family: ${patientUpdateError.message}`);
    }
  } else {
    console.log('Patient family ID updated successfully');
  }

  console.log('Patient joined family successfully');
  return family as FamilyRecord;
};

export const getFamilyByPatientId = async (patientId: string) => {
  console.log('Fetching family for patient:', patientId);

  const { data: patient, error: patientError } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', patientId)
    .maybeSingle();

  if (patientError) {
    console.error('Patient lookup error:', patientError);
    return null;
  }

  if (!patient || !patient.family_id) {
    console.log('Patient does not have a family');
    return null;
  }

  const { data: family, error: familyError } = await supabase
    .from('families')
    .select('*')
    .eq('id', patient.family_id)
    .maybeSingle();

  if (familyError) {
    console.error('Family lookup error:', familyError);
    return null;
  }

  console.log('Found family:', family?.id);
  return family as FamilyRecord | null;
};

export const getFamilyMembers = async (familyId: string) => {
  console.log('Fetching family members for family:', familyId);

  const { data: members, error } = await supabase
    .from('family_groups')
    .select(`
      *,
      patient:users(id, name, age, gender, phone, family_id)
    `)
    .eq('family_id', familyId);

  if (error) {
    console.error('Family members lookup error:', error);
    return [];
  }

  console.log('Found family members:', members?.length || 0);
  return members || [];
};
