import { BACKEND_URL, API_ENDPOINTS } from '@/config/api';

export const getPatientProfile = async (id: string) => {
    const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.PROFILE.GET(id)}`);
    const data = await response.json();
    return data.status === 'success' ? data.profile : null;
};

export const updatePatientProfile = async (id: string, updates: any) => {
    const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.PROFILE.PATCH(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    return response.json();
};

export const getMedicines = async (id: string) => {
    const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.MEDS.LIST(id)}`);
    const data = await response.json();
    return data.status === 'success' ? data.medications : [];
};

export const logMedAdherence = async (patientId: string, medicine: string) => {
    const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.MEDS.LOG}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patientId, medicine }),
    });
    return response.json();
};

export const getPendingCheckins = async (id: string) => {
    const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.CHECKINS.PENDING(id)}`);
    const data = await response.json();
    return data.status === 'success' ? data.questions : [];
};

export const submitCheckin = async (patientId: string, answers: any[]) => {
    const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.CHECKINS.SUBMIT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patientId, answers }),
    });
    return response.json();
};
