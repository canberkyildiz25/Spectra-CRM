import { create } from 'zustand';
import type { IUser } from '@/shared/types';

interface AuthStore {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: IUser) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    set({ token: null, user: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) return;
    try {
      set({ token, user: JSON.parse(userStr), isAuthenticated: true });
    } catch {
      localStorage.removeItem('user');
    }
  },
}));

/* Pages fetch only once this is true. A page's effects run as soon as it
   mounts — before ProtectedRoute has finished signing a first-time visitor
   into the demo — so an ungated fetch went out without a token, came back
   401, and the dashboard opened on an error screen. */
export const useAuthReady = () => useAuthStore((s) => s.isAuthenticated);
