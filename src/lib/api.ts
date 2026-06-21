import { storage } from '@/utils/storage';
import axios from 'axios';

const BACKEND_API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://localhost:8000';

export const api = axios.create({
  baseURL: BACKEND_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem('async_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);
