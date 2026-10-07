import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('family_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getErrorMessage = (error) => error.response?.data?.error?.message
  ?? 'Something went wrong. Please try again.';

export default api;
