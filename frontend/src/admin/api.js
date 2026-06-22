import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Inject JWT on every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smee_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// NOTE: No global 401 redirect here.
// Each caller handles auth errors themselves so login flow is never interrupted.

export default api;