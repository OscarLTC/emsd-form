import { env } from './env';

function resolverModo() {
  if (env.api.mode === 'supabase' && !env.supabase.configurado) {
    console.warn(
      '[config] VITE_API_MODE=supabase pero faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY: se usa el adaptador mock.',
    );
    return 'mock' as const;
  }
  return env.api.mode;
}

export const modoApi = resolverModo();
