import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    agency?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(() => {
    const saved = localStorage.getItem('smartflow_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('smartflow_token'));
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('smartflow_token');
      if (storedToken) {
        try {
          const res = await api.getCurrentUser(storedToken);
          setUser(res.user);
          setToken(storedToken);
          localStorage.setItem('smartflow_user', JSON.stringify(res.user));
        } catch {
          // Token expired or invalid
          setUser(null);
          setToken(null);
          localStorage.removeItem('smartflow_user');
          localStorage.removeItem('smartflow_token');
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setIsLoadingAuth(false);
    };

    verifySession();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('smartflow_user', JSON.stringify(res.user));
    localStorage.setItem('smartflow_token', res.token);
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    agency?: string;
  }) => {
    const res = await api.register(payload);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('smartflow_user', JSON.stringify(res.user));
    localStorage.setItem('smartflow_token', res.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smartflow_user');
    localStorage.removeItem('smartflow_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoadingAuth,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
