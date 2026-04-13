// store/auth.store.ts
import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  userId: string | null;
  isLoggedIn: boolean;
  hasProfile: boolean;
  hasFamilyGroup: boolean;
  user: User | null;
  session: Session | null;
  setSession: (session: Session | null) => void;
  setHasProfile: (value: boolean) => void;
  setHasFamilyGroup: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  isLoggedIn: false,
  hasProfile: false,
  hasFamilyGroup: false,
  user: null,
  session: null,
  setSession: (session) => set({
    session,
    user: session?.user || null,
    userId: session?.user?.id || null,
    isLoggedIn: Boolean(session),
  }),
  setHasProfile: (hasProfile) => set({ hasProfile }),
  setHasFamilyGroup: (hasFamilyGroup) => set({ hasFamilyGroup }),
  logout: () =>
    set({
      userId: null,
      isLoggedIn: false,
      hasProfile: false,
      hasFamilyGroup: false,
      user: null,
      session: null,
    }),
}));