import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthSession, AuthUser, Credentials } from '../types/auth.types';
import { authService } from '../services';
import { sessionStore } from '../services/sessionStore';

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isAuthenticating: boolean;
  error: string | null;
  login: (credentials: Credentials) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const restore = async () => {
      const previous = authService.restore
        ? await authService.restore().catch(() => null)
        : sessionStore.read();
      if (!active) return;
      if (previous) sessionStore.save(previous);
      setSession(previous);
      setIsInitializing(false);
    };

    void restore();

    const unsubscribe = authService.observeSession?.((current) => {
      if (current) sessionStore.save(current);
      else sessionStore.clear();
      setSession(current);
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const login = useCallback(async (credentials: Credentials): Promise<boolean> => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const next = await authService.login(credentials);
      sessionStore.save(next);
      setSession(next);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar sesión');
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const token = session?.token;
    sessionStore.clear();
    setSession(null);
    setError(null);
    if (token) {
      await authService.logout(token).catch(() => undefined);
    }
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session),
      isInitializing,
      isAuthenticating,
      error,
      login,
      logout,
    }),
    [session, isInitializing, isAuthenticating, error, login, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
