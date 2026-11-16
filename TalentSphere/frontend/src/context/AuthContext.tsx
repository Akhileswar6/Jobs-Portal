import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../services/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  demoLogin: (targetRole: 'candidate' | 'recruiter') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('talentsphere_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('talentsphere_access_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    if (!localStorage.getItem('talentsphere_access_token')) {
      setIsLoading(false);
      return;
    }
    try {
      const me = await authApi.getMe();
      setUser(me);
      localStorage.setItem('talentsphere_user', JSON.stringify(me));
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await authApi.login({ email, password });
      const accessToken = data.access_token;
      const loggedUser = data.user;

      setToken(accessToken);
      setUser(loggedUser);

      localStorage.setItem('talentsphere_access_token', accessToken);
      localStorage.setItem('talentsphere_user', JSON.stringify(loggedUser));

      toast.success(`Welcome back, ${loggedUser.name}!`);
      return loggedUser;
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to sign in. Please verify your credentials.';
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await authApi.register(userData);
      const accessToken = data.access_token;
      const newUser = data.user;

      setToken(accessToken);
      setUser(newUser);

      localStorage.setItem('talentsphere_access_token', accessToken);
      localStorage.setItem('talentsphere_user', JSON.stringify(newUser));

      toast.success(`Account created! Welcome to TalentSphere, ${newUser.name}.`);
      return newUser;
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed. Please check inputs.';
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('talentsphere_access_token');
    localStorage.removeItem('talentsphere_user');
    toast.info('You have been logged out.');
  };

  const demoLogin = async (targetRole: 'candidate' | 'recruiter') => {
    if (targetRole === 'recruiter') {
      await login('recruiter@talentsphere.io', 'Password123!');
    } else {
      await login('candidate@talentsphere.io', 'Password123!');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        demoLogin,
      }}
    >
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

