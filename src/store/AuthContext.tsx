'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/types/models/user';
import { authAPI } from '@/lib/api/auth';
import { apiClient } from '@/lib/api/axios/axios';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch the current user profile
  const refreshUser = async (): Promise<User | null> => {
    try {
      setIsLoading(true);
      const res = await authAPI.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        return res.data;
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('Failed to fetch user session:', error);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch on mount
    refreshUser();

    // Listen for custom logout events from the axios interceptor
    const handleLogoutEvent = () => {
      logout();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('auth:logout', handleLogoutEvent);
      return () => {
        window.removeEventListener('auth:logout', handleLogoutEvent);
      };
    }
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
  };

  const logout = async (explicit = false) => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        const protectedRoutes = ['/dashboard', '/admin', '/dealer', '/profile', '/wishlist'];
        const currentPath = window.location.pathname;
        const isProtected = protectedRoutes.some(route => currentPath.startsWith(route));
        
        if (isProtected || explicit) {
          if (!currentPath.startsWith('/login')) {
            window.location.href = '/login';
          }
        }
      }
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
