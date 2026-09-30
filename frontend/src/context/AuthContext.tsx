import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  switchRole: (role: 'trainee' | 'trainer' | 'admin') => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const profile = await api.get<User>('/auth/me');
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        } catch (err) {
          console.warn('Session verification failed, logging out:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.post<{ access_token: string; user: User }>('/auth/login', {
        email,
        password
      });
      localStorage.setItem('token', res.access_token);
      setToken(res.access_token);

      // Fetch complete profile with role details
      const profile = await api.get<User>('/auth/me');
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.post<{ access_token: string; user: User }>('/auth/register', data);
      localStorage.setItem('token', res.access_token);
      setToken(res.access_token);

      const profile = await api.get<User>('/auth/me');
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Demo role switcher for effortless judging evaluation
  const switchRole = async (targetRole: 'trainee' | 'trainer' | 'admin') => {
    const demoAccounts: Record<string, { email: string; pass: string }> = {
      trainee: { email: 'trainee@capacityconnect.demo', pass: 'Demo@123' },
      trainer: { email: 'trainer@capacityconnect.demo', pass: 'Demo@123' },
      admin: { email: 'admin@capacityconnect.demo', pass: 'Demo@123' }
    };
    const creds = demoAccounts[targetRole];
    if (creds) {
      await login(creds.email, creds.pass);
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await api.get<User>('/auth/me');
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to refresh profile:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, switchRole, refreshProfile }}>
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
