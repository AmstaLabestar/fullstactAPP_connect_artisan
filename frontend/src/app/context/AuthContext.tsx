import React, { createContext, useContext, useEffect, useState } from 'react';
import { Artisan } from '../types';
import { authApi, tokenService } from '../services/api';

interface AuthContextType {
  artisan: Artisan | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (artisan: Artisan, access: string, refresh: string) => void;
  logout: () => Promise<void>;
  updateArtisan: (artisan: Artisan) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const token = tokenService.getAccessToken();
      const savedArtisan = tokenService.getArtisan();

      if (!token) {
        if (mounted) {
          setIsLoading(false);
        }
        return;
      }

      if (savedArtisan && mounted) {
        setArtisan(savedArtisan);
        setIsAuthenticated(true);
      }

      try {
        const profile = await authApi.profile();
        if (!mounted) {
          return;
        }
        tokenService.setArtisan(profile);
        setArtisan(profile);
        setIsAuthenticated(true);
      } catch {
        if (!mounted) {
          return;
        }
        tokenService.clearTokens();
        setArtisan(null);
        setIsAuthenticated(false);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = (nextArtisan: Artisan, access: string, refresh: string) => {
    tokenService.setTokens(access, refresh);
    tokenService.setArtisan(nextArtisan);
    setArtisan(nextArtisan);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      tokenService.clearTokens();
      setArtisan(null);
      setIsAuthenticated(false);
    }
  };

  const updateArtisan = (updatedArtisan: Artisan) => {
    tokenService.setArtisan(updatedArtisan);
    setArtisan(updatedArtisan);
  };

  return (
    <AuthContext.Provider
      value={{ artisan, isAuthenticated, isLoading, login, logout, updateArtisan }}
    >
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
