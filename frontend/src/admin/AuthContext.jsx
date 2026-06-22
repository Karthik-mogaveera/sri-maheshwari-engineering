import { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin,   setAdmin]   = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore admin from localStorage immediately — no API call needed.
  // The token is verified by the backend on every protected API request anyway.
  useEffect(() => {
    try {
      const token = localStorage.getItem('smee_admin_token');
      const saved = localStorage.getItem('smee_admin_user');
      if (token && saved) {
        setAdmin(JSON.parse(saved));
      }
    } catch (_) {
      localStorage.removeItem('smee_admin_token');
      localStorage.removeItem('smee_admin_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/api/admin/auth/login', { email, password });
    localStorage.setItem('smee_admin_token', data.token);
    localStorage.setItem('smee_admin_user', JSON.stringify(data.admin));
    setAdmin(data.admin);
    return data;
  };

  const logout = () => {
    // Fire-and-forget — don't block on the API call
    api.post('/api/admin/auth/logout').catch(() => {});
    localStorage.removeItem('smee_admin_token');
    localStorage.removeItem('smee_admin_user');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
