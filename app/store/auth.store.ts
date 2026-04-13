import { create } from 'zustand';

interface AuthState {
  userId: string | null;
  isLoggedIn: boolean;
  hasProfile: boolean;
  hasFamilyGroup: boolean;
  setUser: (userId: string | null) => void;
  setHasProfile: (value: boolean) => void;
  setHasFamilyGroup: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  isLoggedIn: false,
  hasProfile: false,
  hasFamilyGroup: false,
  setUser: (userId) => set({ userId, isLoggedIn: Boolean(userId) }),
  setHasProfile: (hasProfile) => set({ hasProfile }),
  setHasFamilyGroup: (hasFamilyGroup) => set({ hasFamilyGroup }),
  logout: () =>
    set({
      userId: null,
      isLoggedIn: false,
      hasProfile: false,
      hasFamilyGroup: false,
    }),
}));
