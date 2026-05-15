import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { authApi, setToken, clearToken, getToken } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (partial: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Map backend role string → frontend UserRole enum */
function mapRole(role: string): UserRole {
  const map: Record<string, UserRole> = {
    'Staff':                UserRole.STAFF,
    'Team Lead':            UserRole.TEAM_LEAD,
    'Dept Head':            UserRole.DEPT_HEAD,
    'Deputy Director':      UserRole.DEPUTY_DIRECTOR,
    'National Coordinator': UserRole.NC,
    'Super Admin':          UserRole.SUPER_ADMIN,
  };
  return map[role] ?? UserRole.STAFF;
}

/** Normalise backend user payload → frontend User shape */
function mapUser(raw: any): User {
  return {
    id:               String(raw.id),
    ippisNo:          raw.ippis_no ?? '',
    surname:          raw.surname ?? '',
    firstname:        raw.firstname ?? '',
    othername:        raw.othername ?? undefined,
    email:            raw.email ?? '',
    phone:            raw.phone ?? '',
    designation:      raw.designation ?? '',
    departmentId:     raw.department_id ?? '',
    role:             mapRole(raw.role),
    supervisorId:     raw.supervisor_id ? String(raw.supervisor_id) : undefined,
    counterSignerId:  raw.counter_signer_id ? String(raw.counter_signer_id) : undefined,
    isActive:         raw.is_active ?? true,
    avatarUrl:        raw.avatar_url ?? undefined,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(() => !!getToken()); // Only load if token exists

  // Rehydrate session from stored token on app load
  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }

    authApi.me()
      .then(res => setUser(mapUser(res.data)))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      setToken(res.token);
      setUser(mapUser(res.user));
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    // Optimistic: Clear local state immediately for instant UI response
    clearToken();
    setUser(null);
    
    // Background: Invalidate session on server
    try { await authApi.logout(); } catch { /* ignore */ }
  }, []);

  const updateUser = useCallback((partial: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...partial } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
