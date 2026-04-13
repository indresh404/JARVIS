// store/auth.store.ts
import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  userId: string | null;
  patientId: string | null;
  phoneNumber: string | null;
  isLoggedIn: boolean;
  hasProfile: boolean;
  hasFamilyGroup: boolean;
  user: User | null;
  session: Session | null;
  setSession: (session: Session | null) => void;
  setSessionState: (state: Partial<Pick<AuthState, 'userId' | 'patientId' | 'phoneNumber' | 'isLoggedIn' | 'hasProfile' | 'hasFamilyGroup'>>) => void;
  setHasProfile: (value: boolean) => void;
  setHasFamilyGroup: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  patientId: null,
  phoneNumber: null,
  isLoggedIn: false,
  hasProfile: false,
  hasFamilyGroup: false,
  user: null,
  session: null,
  setSession: (session) => set({
    session,
    user: session?.user || null,
    userId: session?.user?.id || null,
    patientId: (session?.user?.user_metadata?.patient_id as string | undefined) || session?.user?.id || null,
    phoneNumber: (session?.user?.user_metadata?.phone as string | undefined) || null,
    isLoggedIn: Boolean(session),
  }),
  setSessionState: (state) => set((prev) => ({
    ...prev,
    ...state,
  })),
  setHasProfile: (hasProfile) => set({ hasProfile }),
  setHasFamilyGroup: (hasFamilyGroup) => set({ hasFamilyGroup }),
  logout: () =>
    set({
      userId: null,
      patientId: null,
      phoneNumber: null,
      isLoggedIn: false,
      hasProfile: false,
      hasFamilyGroup: false,
      user: null,
      session: null,
    }),
}));
