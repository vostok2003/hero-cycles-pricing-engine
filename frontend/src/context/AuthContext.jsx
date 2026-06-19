import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../services/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('hcpe_user');
    const storedToken = localStorage.getItem('hcpe_token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  /**
   * Login and persist user/token
   */
  const login = useCallback((userData) => {
    const { token, ...userInfo } = userData;
    localStorage.setItem('hcpe_token', token);
    localStorage.setItem('hcpe_user', JSON.stringify(userInfo));
    setUser(userInfo);
  }, []);

  /**
   * Logout and clear storage
   */
  const logout = useCallback(() => {
    localStorage.removeItem('hcpe_token');
    localStorage.removeItem('hcpe_user');
    setUser(null);
  }, []);

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  const isAdmin = user?.role === 'admin';
  const isSalesperson = user?.role === 'salesperson';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole, isAdmin, isSalesperson }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
