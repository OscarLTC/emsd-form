import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { env } from '../../config/env';

let cliente: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!cliente) {
    cliente = createClient(env.supabase.url, env.supabase.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }
  return cliente;
}
