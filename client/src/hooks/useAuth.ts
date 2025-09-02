import { useState, useEffect, createContext, useContext } from 'react';
import { authApi } from '../services/api';
import type { User } from '@shared/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
  needsSetup: boolean;
  createPin: (pin: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authApi.getStatus();
      
      if (response.success && response.data) {
        setNeedsSetup(response.data.requiresSetup);
        
        if (!response.data.requiresSetup) {
          // Check if we have a valid token
          const token = localStorage.getItem('authToken');
          if (token) {
            // Token exists, assume user is authenticated
            // In a real app, you might want to validate the token
            setUser({ id: 'current-user', createdAt: new Date().toISOString() });
          }
        }
      }
    } catch (err) {
      setError('Erro ao verificar status de autenticação');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (pin: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await authApi.login(pin);
      
      if (response.success && response.data) {
        localStorage.setItem('authToken', response.data.token);
        setUser(response.data.user);
        setNeedsSetup(false);
        return true;
      } else {
        setError(response.error || 'Erro ao fazer login');
        return false;
      }
    } catch (err) {
      setError('Erro de conexão');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createPin = async (pin: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await authApi.setup(pin);
      
      if (response.success) {
        // After creating PIN, automatically login
        return await login(pin);
      } else {
        setError(response.error || 'Erro ao criar PIN');
        return false;
      }
    } catch (err) {
      setError('Erro de conexão');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    needsSetup,
    createPin,
  };
};