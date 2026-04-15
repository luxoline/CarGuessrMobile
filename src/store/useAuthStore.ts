import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface AuthState {
  token: string | null;
  username: string | null;  // display name (userName field from backend)
  email: string | null;
  isAuthenticated: boolean;
  login: (token: string, username: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// SecureStore web'de çalışmaz — fallback
const storage = {
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  deleteItem: async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  username: null,
  email: null,
  isAuthenticated: false,

  login: async (token, username, email) => {
    await storage.setItem('token', token);
    await storage.setItem('username', username);
    await storage.setItem('email', email);
    set({ token, username, email, isAuthenticated: true });
  },

  logout: async () => {
    await storage.deleteItem('token');
    await storage.deleteItem('username');
    await storage.deleteItem('email');
    set({ token: null, username: null, email: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = await storage.getItem('token');
    const username = await storage.getItem('username');
    const email = await storage.getItem('email');
    if (token) {
      set({ token, username, email, isAuthenticated: true });
    }
  },
}));
