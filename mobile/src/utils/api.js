import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Deployed Render backend URL
export const BASE_URL = 'https://chat-app-backend-kmr4.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to automatically attach authorization header
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('[API Interceptor] Error reading token', err);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
