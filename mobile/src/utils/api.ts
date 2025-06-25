import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://192.168.74.213:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_data');
    }
    return Promise.reject(error);
  }
);

export const apiRequest = async (url: string, options?: any) => {
  try {
    const response = await api.request({
      url,
      ...options,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 
      error.response?.data?.message || 
      error.message || 
      'Network error'
    );
  }
};

export const uploadFile = async (url: string, formData: FormData) => {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 
      error.response?.data?.message || 
      error.message || 
      'Upload failed'
    );
  }
};

export default api;