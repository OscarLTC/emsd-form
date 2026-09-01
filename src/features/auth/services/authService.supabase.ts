import type { Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js';
import { getSupabase } from '../../../core/supabase/client';
import { translateError } from '../../../core/supabase/errors';
import { NetworkError } from '../../../core/http/httpClient';
import { sessionStore } from './sessionStore';
import type { AuthService, AuthSession, AuthUser, Credentials } from '../types/auth.types';

const PROFILES_TABLE = 'profiles';

const MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Correo o contraseña incorrectos',
  'Email not confirmed': 'La cuenta aún no está confirmada',
};

function translateAuthError(cause: unknown): Error {
  const error = translateError(cause, 'No se pudo iniciar sesión');
  if (error instanceof NetworkError) {
    return new NetworkError('Sin conexión: no es posible iniciar sesión ahora');
  }
  return new Error(MESSAGES[error.message] ?? error.message);
}

async function buildUser(user: SupabaseUser): Promise<AuthUser> {
  const cached = sessionStore.read()?.user;
  const metadata = user.user_metadata ?? {};
  const base: AuthUser = {
    id: user.id,
    name: (metadata.name as string) || cached?.name || user.email || 'Usuario',
    username: user.email ?? '',
    role: (metadata.role as string) || cached?.role || 'Transportista',
    zone: (metadata.zone as string) || cached?.zone || '',
  };

  try {
    const { data } = await getSupabase()
      .from(PROFILES_TABLE)
      .select('name, role, zone')
      .eq('id', user.id)
      .maybeSingle();

    if (!data) return base;
    return {
      ...base,
      name: data.name || base.name,
      role: data.role || base.role,
      zone: data.zone || base.zone,
    };
  } catch {
    return base;
  }
}

async function toSession(session: SupabaseSession): Promise<AuthSession> {
  return { token: session.access_token, user: await buildUser(session.user) };
}

export const supabaseAuthService: AuthService = {
  async login({ username, password }: Credentials): Promise<AuthSession> {
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email: username,
      password,
    });

    if (error || !data.session) throw translateAuthError(error);
    return toSession(data.session);
  },

  async logout(): Promise<void> {
    await getSupabase().auth.signOut();
  },

  async restore(): Promise<AuthSession | null> {
    try {
      const { data } = await getSupabase().auth.getSession();
      if (data.session) return await toSession(data.session);
    } catch {
      /* Without network the token cannot be refreshed: fall back to the cached session. */
    }
    return sessionStore.read();
  },

  observeSession(onChange: (session: AuthSession | null) => void): () => void {
    const { data } = getSupabase().auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return;

      if (!session) {
        onChange(null);
        return;
      }

      const cached = sessionStore.read()?.user;
      if (event === 'TOKEN_REFRESHED' && cached) {
        onChange({ token: session.access_token, user: cached });
        return;
      }

      void toSession(session).then(onChange);
    });

    return () => data.subscription.unsubscribe();
  },
};
