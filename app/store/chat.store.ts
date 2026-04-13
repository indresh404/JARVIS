import { create } from 'zustand';
import { Message } from '@/types/chat.types';

interface ChatState {
  messages: Message[];
  isTyping: boolean;
  sessionId: string;
  addMessage: (message: Message) => void;
  setTyping: (isTyping: boolean) => void;
  clearChat: () => void;
  setSessionId: (sessionId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isTyping: false,
  sessionId: `session_${Date.now()}`,
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setTyping: (isTyping) => set({ isTyping }),
  clearChat: () => set({ messages: [] }),
  setSessionId: (sessionId) => set({ sessionId }),
}));
