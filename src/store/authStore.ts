import { create } from 'zustand';
import {
  login as loginUser,
  register as registerUser,
  getCurrentUser as getUser,
} from '@/services/auth';
import { User } from '@/types/user';
import { storage } from '@/utils/storage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialised: boolean;
  token: string | null;

  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialised: false,
  token: null,

  login: async (email, password) => {
    const data = await loginUser(email, password);

    await storage.setItem('access_token', data.tokens.access_token);
    await storage.setItem('refresh_token', data.tokens.refresh_token);

    set({
      user: data.user,
      isAuthenticated: true,
      token: data.tokens.access_token,
    });
  },

  signup: async (name, email, password) => {
    const data = await registerUser(name, email, password);

    await storage.setItem('access_token', data.tokens.access_token);
    await storage.setItem('refresh_token', data.tokens.refresh_token);

    set({
      user: data.user,
      isAuthenticated: true,
      token: data.tokens.access_token,
    });
  },

  logout: async () => {
    await storage.removeItem('access_token');
    await storage.removeItem('refresh_token');

    set({
      user: null,
      isAuthenticated: false,
      token: null,
    });
  },

  restoreSession: async () => {
    set({ isLoading: true });

    const access_token = await storage.getItem('access_token');

    if (access_token) {
      try {
        const data = await getUser();
        set({
          user: data,
          isAuthenticated: true,
          isLoading: false,
          isInitialised: true,
          token: access_token,
        });
      } catch {
        await storage.removeItem('access_token');
        await storage.removeItem('refresh_token');
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialised: true,
          token: null,
        });
      }
    } else {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialised: true,
        token: null,
      });
    }
  },

  setUser: (user) => set({ user }),
}));
