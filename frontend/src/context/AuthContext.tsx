import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getProfile } from '../api/user';
import type { Profile } from '../api/types';

const RoleIds = { Customer: 1, Merchant: 2, Admin: 3 } as const;

export type AuthContextValue = {
  token: string | null;
  user: Profile | null;
  login: (t: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  canManageProducts: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'ecommerce_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY),
  );
  const [user, setUser] = useState<Profile | null>(null);

  const fetchUser = useCallback(async (t: string) => {
    try {
      const profile = await getProfile(t);
      setUser(profile);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setUser(null);
    }
  }, [token, fetchUser]);

  const login = useCallback((t: string) => {
    setTokenState(t);
    localStorage.setItem(STORAGE_KEY, t);
  }, []);

  const logout = useCallback(() => {
    setTokenState(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const canManageProducts =
    !!user?.roleIds?.some((id) => id === RoleIds.Admin || id === RoleIds.Merchant);

  const value: AuthContextValue = {
    token,
    user,
    login,
    logout,
    isAuthenticated: !!token,
    canManageProducts,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
