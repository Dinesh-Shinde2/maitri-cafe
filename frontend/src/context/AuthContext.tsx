import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

interface AuthContextType {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  login: (token: string, username: string, fullName: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('maitri_admin_token'));
  const [user, setUser] = useState<any | null>(() => {
    const savedUser = localStorage.getItem('maitri_admin_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (newToken: string, username: string, fullName: string) => {
    const userData = { username, fullName, role: 'admin' };
    localStorage.setItem('maitri_admin_token', newToken);
    localStorage.setItem('maitri_admin_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('maitri_admin_token');
    localStorage.removeItem('maitri_admin_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
