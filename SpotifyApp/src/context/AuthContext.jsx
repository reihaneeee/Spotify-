// src/context/AuthContext.jsx

import { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, loginUser as authLogin, logoutUser as authLogout, updateCurrentUser as authUpdate } from '../utils/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = getCurrentUser();
    setUser(storedUser);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const result = await authLogin(email, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = authUpdate(updates);
    if (updated) {
      setUser(updated);
    }
    return updated;
  };

  const value = { user, loading, login, logout, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for using the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};