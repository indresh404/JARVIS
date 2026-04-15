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
    getNearestStores: async (lat: number, lon: number) => {
        return await safeFetchJson(`${BACKEND_URL}/schemes/nearby?lat=${lat}&lon=${lon}`);
    },

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

    generateRisk: async (data: any) => {
        return await safeFetchJson(`${BACKEND_URL}${API_ENDPOINTS.RISK.GENERATE}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    predictRisk: async (data: any) => {
        return {
            risk_score: 92,
            level: "CRITICAL"
        };
    },

    matchSchemes: async (data: any) => {
        return await safeFetchJson(`${BACKEND_URL}${API_ENDPOINTS.SCHEMES.MATCH}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    checkInteraction: async (data: any) => {
        return await safeFetchJson(`${BACKEND_URL}${API_ENDPOINTS.SAFETY.DRUG_INTERACTION}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    // ✅ FIXED: No hardcoded demo data - uses real parameters
    sendMessage: async (
        patientId: string,
        message: string,
        context: any,
        symptoms: any[] = [],
        conversationLog: any[] = []
    ) => {
        const requestBody = {
            message: message,
            patient_id: patientId || 'demo-patient-' + Date.now(),
            session_id: 'main-chat',
            symptoms: symptoms,  // ✅ Uses REAL symptoms, not hardcoded
            conversation_log: conversationLog,  // ✅ Uses REAL conversation log
            patient_context: {
                rolling_summary: context.rolling_summary || "New patient onboarding",
                profile_summary: context.profile_summary || "No profile yet",
                last_7_summaries: context.last_7_summaries || [],
                active_medications: context.active_medications || [],
                pending_doctor_questions: context.pending_doctor_questions || []
            }
        };

        console.log("📤 Sending to backend:", JSON.stringify(requestBody, null, 2));

        try {
            const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.CHAT.MESSAGE}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Chat API error:', response.status, errorText);
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Chat response:', data);
            return data;

        } catch (e) {
            console.error('🔥 Chat fetch error:', e);
            return {
                bot_reply: "I'm having trouble connecting. Please check if the backend is running.",
                extracted_symptom: null
            };
        }
    },

    extractReport: async (fileUri: string, fileName: string, fileType: string) => {
        const formData = new FormData();
        // @ts-ignore
        formData.append('file', {
            uri: fileUri,
            name: fileName,
            type: fileType,
        });

        try {
            const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.EXTRACT.REPORT}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.text();
                console.error('Extraction API Error:', error);
                return null;
            }
            return await response.json();
        } catch (e) {
            console.error('Extraction Fetch Error:', e);
            return null;
        }
    }
};