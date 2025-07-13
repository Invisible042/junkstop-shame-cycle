import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = 'http://10.142.73.154:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to attach token and set headers conditionally
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    // ✅ Only set 'Content-Type' to JSON if it's not a FormData
    const isFormData = config.data instanceof FormData;
    if (config.data && typeof config.data === 'object' && !isFormData) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to clear tokens on 401
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

// Standard API request for non-file endpoints
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

// File upload handler (e.g. for junk food photo upload)
export const uploadFile = async (url: string, formData: FormData) => {
  try {
    console.log("url =",url)
    console.log("formdata = ", FormData)
    const token = await SecureStore.getItemAsync('auth_token');
    console.log(token)

    const response = await axios.post(`${API_BASE_URL}${url}`, formData, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        'Content-Type':'multipart/form-data'
        // ⚠️ DO NOT set 'Content-Type' manually — let Axios handle it
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Upload failed:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'Upload failed'
    );
  }
};

export default api;
