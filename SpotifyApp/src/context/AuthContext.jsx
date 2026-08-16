// src/context/AuthContext.jsx
//
// Same public API as the phase-1 version (user, loading, login, logout,
// updateUser) so pages that consume useAuth() don't need to change, but the
// implementation now talks to the real backend (accounts app) through
// services/authApi.js instead of utils/auth.js's localStorage fake.

import { createContext, useState, useContext, useEffect } from 'react';
import * as authApi from '../services/authApi';
import { tokenStorage } from '../services/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    if (!tokenStorage.getAccess()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await authApi.fetchMe();
      setUser(me);
    } catch {
      tokenStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
    const onLogout = () => setUser(null);
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  const login = async (email, password) => {
    try {
      const loggedInUser = await authApi.login(email, password);
      // /auth/login/ returns a slim public-profile shape; fetch the full
      // self-profile (birth_date, artist_status, etc.) right after.
      const me = await authApi.fetchMe();
      setUser(me);
      return { success: true, user: me };
    } catch (err) {
      const message = err?.response?.data?.detail || 'Invalid email or password';
      return { success: false, message };
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const updateUser = async (updates) => {
    const updated = await authApi.updateMe(updates);
    setUser(updated);
    return updated;
  };

  const value = { user, loading, login, logout, updateUser, refreshUser: loadMe };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
