
"use client";

import React, { createContext } from 'react';
import { useAuth, type AuthState } from '@/hooks/use-auth';

export const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
