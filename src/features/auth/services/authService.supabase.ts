import type { Session, User } from '@supabase/supabase-js';
import { getSupabase } from '../../../core/supabase/client';
import { traducirError } from '../../../core/supabase/errores';
import { NetworkError } from '../../../core/http/httpClient';
import { sessionStore } from './sessionStore';
import type { AuthService, Credenciales, Sesion, Usuario } from '../types/auth.types';

const TABLA_PERFILES = 'profiles';

const MENSAJES: Record<string, string> = {
  'Invalid login credentials': 'Correo o contraseña incorrectos',
  'Email not confirmed': 'La cuenta aún no está confirmada',
};

function traducirAuth(causa: unknown): Error {
  const error = traducirError(causa, 'No se pudo iniciar sesión');
  if (error instanceof NetworkError) {
    return new NetworkError('Sin conexión: no es posible iniciar sesión ahora');
  }
  return new Error(MENSAJES[error.message] ?? error.message);
}

async function construirUsuario(user: User): Promise<Usuario> {
  const cache = sessionStore.read()?.usuario;
  const metadata = user.user_metadata ?? {};
  const base: Usuario = {
    id: user.id,
    nombre: (metadata.name as string) || cache?.nombre || user.email || 'Usuario',
    usuario: user.email ?? '',
    rol: (metadata.role as string) || cache?.rol || 'Transportista',
    zona: (metadata.zone as string) || cache?.zona || '',
  };

  try {
    const { data } = await getSupabase()
      .from(TABLA_PERFILES)
      .select('name, role, zone')
      .eq('id', user.id)
      .maybeSingle();

    if (!data) return base;
    return {
      ...base,
      nombre: data.name || base.nombre,
      rol: data.role || base.rol,
      zona: data.zone || base.zona,
    };
  } catch {
    return base;
  }
}

async function aSesion(session: Session): Promise<Sesion> {
  return { token: session.access_token, usuario: await construirUsuario(session.user) };
}

export const supabaseAuthService: AuthService = {
  async login({ usuario, clave }: Credenciales): Promise<Sesion> {
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email: usuario,
      password: clave,
    });

    if (error || !data.session) throw traducirAuth(error);
    return aSesion(data.session);
  },

  async logout(): Promise<void> {
    await getSupabase().auth.signOut();
  },

  async restaurar(): Promise<Sesion | null> {
    try {
      const { data } = await getSupabase().auth.getSession();
      if (data.session) return await aSesion(data.session);
    } catch {
      /* sin red no se puede refrescar el token: se usa la sesión cacheada */
    }
    return sessionStore.read();
  },

  observarSesion(alCambiar: (sesion: Sesion | null) => void): () => void {
    const { data } = getSupabase().auth.onAuthStateChange((evento, session) => {
      if (evento === 'INITIAL_SESSION') return;

      if (!session) {
        alCambiar(null);
        return;
      }

      const cache = sessionStore.read()?.usuario;
      if (evento === 'TOKEN_REFRESHED' && cache) {
        alCambiar({ token: session.access_token, usuario: cache });
        return;
      }

      void aSesion(session).then(alCambiar);
    });

    return () => data.subscription.unsubscribe();
  },
};
