import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function AdminProtection({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <LoadingSpinner message="Verifying admin access…" />;
  if (!isAuthenticated || !isAdmin) return <Navigate to="/login" replace />;
  return children;
}
