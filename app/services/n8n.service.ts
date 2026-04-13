import { CHAT_ENDPOINT, DOCTOR_ENDPOINT, N8N_BASE_URL } from '@/config/n8n';
import { Message } from '@/types/chat.types';

export const sendChatMessage = async (message: string, sessionId: string, patientId: string) => {
  const response = await fetch(`${N8N_BASE_URL}${CHAT_ENDPOINT}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId, patientId }),
  });
  return response.json();
};

export const endChatSession = async (conversation: Message[], sessionId: string, patientId: string) => {
  const response = await fetch(`${N8N_BASE_URL}${CHAT_ENDPOINT}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endChat: true, conversation, sessionId, patientId }),
  });
  return response.json();
};

export const askDoctor = async (question: string, patientId: string) => {
  const response = await fetch(`${N8N_BASE_URL}${DOCTOR_ENDPOINT}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'ask', question, patientId }),
  });
  return response.json();
};
