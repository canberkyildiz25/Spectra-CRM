import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* A stored token outlives its JWT (seven days). When the API rejects it,
   drop it and reload: ProtectedRoute then opens a fresh demo session instead
   of leaving the visitor on a page of failed requests. Only when a token was
   sent, so a 401 on the login form itself cannot loop. */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const sentToken = Boolean(error?.config?.headers?.Authorization);
    if (typeof window !== 'undefined' && error?.response?.status === 401 && sentToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  },
);

export default api;
