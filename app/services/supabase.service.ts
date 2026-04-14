import { BACKEND_URL, API_ENDPOINTS } from '@/config/api';

const safeFetchJson = async (url: string, init?: RequestInit) => {
    try {
        const response = await fetch(url, init);
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
};

export const getPatientProfile = async (id: string) => {
    const data = await safeFetchJson(`${BACKEND_URL}${API_ENDPOINTS.PROFILE.GET(id)}`);
    return data?.status === 'success' ? data.profile : null;
};

export const updatePatientProfile = async (id: string, updates: any) => {
    const data = await safeFetchJson(`${BACKEND_URL}${API_ENDPOINTS.PROFILE.PATCH(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    return data ?? { status: 'demo', updated: true };
};

export const getMedicines = async (id: string) => {
    const data = await safeFetchJson(`${BACKEND_URL}${API_ENDPOINTS.MEDS.LIST(id)}`);
    return data?.status === 'success' ? data.medications : [];
};

export const logMedAdherence = async (patientId: string, medicine: string) => {
    const data = await safeFetchJson(`${BACKEND_URL}${API_ENDPOINTS.MEDS.LOG}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patientId, medicine }),
    });
    return data ?? { status: 'demo', logged: true };
};

export const addMedicine = async (patientId: string, medicineData: any) => {
    const data = await safeFetchJson(`${BACKEND_URL}${API_ENDPOINTS.MEDS.ADD(patientId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patientId, ...medicineData }),
    });
    return data ?? { status: 'demo', added: true };
};


export const getPendingCheckins = async (id: string) => {
    const data = await safeFetchJson(`${BACKEND_URL}${API_ENDPOINTS.CHECKINS.PENDING(id)}`);
    return data?.status === 'success' ? data.questions : [];
};

export const submitCheckin = async (patientId: string, answers: any[]) => {
    const data = await safeFetchJson(`${BACKEND_URL}${API_ENDPOINTS.CHECKINS.SUBMIT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patientId, answers }),
    });
    return data ?? { status: 'demo', submitted: true };
};
