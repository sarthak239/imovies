import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('imovies_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('imovies_token');
      const storedUser = localStorage.getItem('imovies_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);

          // Verify with backend
          const res = await api.get('/auth/profile');
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('imovies_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.warn('[AuthContext] Session expired or invalid:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.success) {
      const { token: receivedToken, user: receivedUser } = response.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('imovies_token', receivedToken);
      localStorage.setItem('imovies_user', JSON.stringify(receivedUser));
      return response.data;
    }
    throw new Error(response.data?.message || 'Login failed');
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data?.success) {
      const { token: receivedToken, user: receivedUser } = response.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('imovies_token', receivedToken);
      localStorage.setItem('imovies_user', JSON.stringify(receivedUser));
      return response.data;
    }
    throw new Error(response.data?.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('imovies_token');
    localStorage.removeItem('imovies_user');
  };

  const updateProfile = async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    if (response.data?.success) {
      const { user: updatedUser, token: refreshedToken } = response.data;
      setUser(updatedUser);
      localStorage.setItem('imovies_user', JSON.stringify(updatedUser));
      if (refreshedToken) {
        setToken(refreshedToken);
        localStorage.setItem('imovies_token', refreshedToken);
      }
      return response.data;
    }
    throw new Error(response.data?.message || 'Failed to update profile');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
