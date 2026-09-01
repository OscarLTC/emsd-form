import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Credenciales, Sesion, Usuario } from '../types/auth.types';
import { authService } from '../services';
import { sessionStore } from '../services/sessionStore';

export interface AuthContextValue {
  usuario: Usuario | null;
  token: string | null;
  autenticado: boolean;
  inicializando: boolean;
  autenticando: boolean;
  error: string | null;
  login: (credenciales: Credenciales) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [inicializando, setInicializando] = useState(true);
  const [autenticando, setAutenticando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;

    const restaurar = async () => {
      const previa = authService.restaurar ? await authService.restaurar().catch(() => null) : sessionStore.read();
      if (!vigente) return;
      if (previa) sessionStore.save(previa);
      setSesion(previa);
      setInicializando(false);
    };

    void restaurar();

    const desuscribir = authService.observarSesion?.((actual) => {
      if (actual) sessionStore.save(actual);
      else sessionStore.clear();
      setSesion(actual);
    });

    return () => {
      vigente = false;
      desuscribir?.();
    };
  }, []);

  const login = useCallback(async (credenciales: Credenciales): Promise<boolean> => {
    setAutenticando(true);
    setError(null);
    try {
      const nueva = await authService.login(credenciales);
      sessionStore.save(nueva);
      setSesion(nueva);
      return true;
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : 'No se pudo iniciar sesión');
      return false;
    } finally {
      setAutenticando(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const token = sesion?.token;
    sessionStore.clear();
    setSesion(null);
    setError(null);
    if (token) {
      await authService.logout(token).catch(() => undefined);
    }
  }, [sesion]);

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario: sesion?.usuario ?? null,
      token: sesion?.token ?? null,
      autenticado: Boolean(sesion),
      inicializando,
      autenticando,
      error,
      login,
      logout,
    }),
    [sesion, inicializando, autenticando, error, login, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
