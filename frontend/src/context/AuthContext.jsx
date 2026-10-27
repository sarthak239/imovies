import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('imovies_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem('imovies_token');
      const storedUser  = localStorage.getItem('imovies_user');
      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          const res = await api.get('/auth/profile');
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('imovies_user', JSON.stringify(res.data.user));
          }
        } catch {
          _clear();
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const _persist = (tkn, usr) => {
    setToken(tkn); setUser(usr);
    localStorage.setItem('imovies_token', tkn);
    localStorage.setItem('imovies_user', JSON.stringify(usr));
  };

  const _clear = () => {
    setToken(null); setUser(null);
    localStorage.removeItem('imovies_token');
    localStorage.removeItem('imovies_user');
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) { _persist(res.data.token, res.data.user); return res.data; }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data?.success) {
      if (res.data.token && res.data.user) {
        _persist(res.data.token, res.data.user);
      }
      return res.data;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const verifyOtp = async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    if (res.data?.success && res.data.token && res.data.user) {
      _persist(res.data.token, res.data.user);
      return res.data;
    }
    throw new Error(res.data?.message || 'OTP verification failed');
  };

  const resendOtp = async (email) => {
    const res = await api.post('/auth/resend-otp', { email });
    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  };

  const resetPassword = async ({ email, otp, token, newPassword }) => {
    const res = await api.post('/auth/reset-password', { email, otp, token, newPassword });
    return res.data;
  };

  const logout = () => _clear();

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      isAuthenticated: !!token && !!user,
      isAdmin: user?.role === 'admin',
      login, register, logout,
      verifyOtp, resendOtp, forgotPassword, resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
