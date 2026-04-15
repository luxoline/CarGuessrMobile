import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface AuthState {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  login: (token: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// SecureStore doesn't work on web — use a simple fallback
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
  isAuthenticated: false,

  login: async (token, username) => {
    await storage.setItem('token', token);
    await storage.setItem('username', username);
    set({ token, username, isAuthenticated: true });
  },

  logout: async () => {
    await storage.deleteItem('token');
    await storage.deleteItem('username');
    set({ token: null, username: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = await storage.getItem('token');
    const username = await storage.getItem('username');
    if (token) {
      set({ token, username, isAuthenticated: true });
    }
  },
}));
