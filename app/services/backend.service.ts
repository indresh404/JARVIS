import { BACKEND_URL, API_ENDPOINTS } from '@/config/api';

const safeFetchJson = async (url: string, init?: RequestInit) => {
    try {
        const response = await fetch(url, init);
        if (!response.ok) {
            const error = await response.text();
            console.error(`API Error [${url}]:`, error);
            return null;
        }
        return await response.json();
    } catch (e) {
        console.error(`Fetch Error [${url}]:`, e);
        return null;
    }
};

export const backendService = {
    // Chat End Session
    endSession: async (patientId: string, log: any[], existingSummary: string) => {
        return await safeFetchJson(`${BACKEND_URL}${API_ENDPOINTS.CHAT.END_SESSION}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patient_id: patientId,
                full_conversation_log: log,
                existing_rolling_summary: existingSummary
            })
        });
    },

    // Risk Scoring
    generateRisk: async (data: any) => {
        return await safeFetchJson(`${BACKEND_URL}${API_ENDPOINTS.RISK.GENERATE}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    // Risk Prediction
    predictRisk: async (data: any) => {
        return await safeFetchJson(`${BACKEND_URL}${API_ENDPOINTS.RISK.PREDICT}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    // Scheme Matching (Jan Aushadhi included)
    matchSchemes: async (data: any) => {
        return await safeFetchJson(`${BACKEND_URL}${API_ENDPOINTS.SCHEMES.MATCH}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    // Drug Interaction
    checkInteraction: async (data: any) => {
        return await safeFetchJson(`${BACKEND_URL}${API_ENDPOINTS.SAFETY.DRUG_INTERACTION}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    // Main Chat
    sendMessage: async (patientId: string, message: string, context: any) => {
        return await safeFetchJson(`${BACKEND_URL}${API_ENDPOINTS.CHAT.MESSAGE}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                patient_id: patientId,
                session_id: 'main-chat',
                patient_context: context
            })
        });
    }
};
