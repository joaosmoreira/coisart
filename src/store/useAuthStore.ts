import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'seller';
  sellerId?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const savedToken = localStorage.getItem('coisart_token');
const savedUser = localStorage.getItem('coisart_user');

export const useAuthStore = create<AuthState>((set) => ({
  token: savedToken || null,
  user: savedUser ? JSON.parse(savedUser) : null,
  setAuth: (token, user) => {
    localStorage.setItem('coisart_token', token);
    localStorage.setItem('coisart_user', JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('coisart_token');
    localStorage.removeItem('coisart_user');
    set({ token: null, user: null });
  }
}));
