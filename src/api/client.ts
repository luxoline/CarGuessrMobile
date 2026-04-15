import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Android emülatörü için 10.0.2.2, iOS/web için localhost
// Fiziksel cihazda Wi-Fi kullanıyorsan bilgisayarının IP'sini yaz:
// Örn: 'https://192.168.1.X:7264/api'
const BASE_URL = Platform.OS === 'android'
  ? 'https://10.0.2.2:7264/api'
  : 'https://localhost:7264/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — her istekte token ekle
apiClient.interceptors.request.use(async (config) => {
  try {
    let token: string | null = null;
    if (Platform.OS === 'web') {
      token = localStorage.getItem('token');
    } else {
      token = await SecureStore.getItemAsync('token');
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {}
  return config;
});

// Response interceptor — hata logla
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      console.warn(
        '[API Error]',
        error?.config?.url,
        error?.response?.status,
        JSON.stringify(error?.response?.data),
      );
    }
    return Promise.reject(error);
  }
);

export default apiClient;
