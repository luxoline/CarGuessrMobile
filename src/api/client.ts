import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// For Android emulator to access localhost, use 10.0.2.2.
// For iOS simulator, localhost works.
// For physical device, you need the local IP (e.g., 192.168.1.X)
// To keep things simple during development if you are running on your actual device over Wi-Fi, 
// replace with your computer's IP address (e.g., http://192.168.X.X:5264/api or https://192.168.X.X:7264/api)
const BASE_URL = Platform.OS === 'android' ? 'https://10.0.2.2:7264/api' : 'https://localhost:7264/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
