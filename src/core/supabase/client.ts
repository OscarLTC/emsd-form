import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { env } from '../../config/env';

let client: SupabaseClient | null = null;

/**
 * supabase-js applies no timeout: on a very weak signal the request hangs
 * forever. It is cut off manually, with a wider margin for uploads because a
 * photo over a slow network is legitimately slow.
 */
function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const limit = url.includes('/storage/v1/') ? env.api.uploadTimeoutMs : env.api.requestTimeoutMs;

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new DOMException('request timeout', 'TimeoutError')),
    limit,
  );

  init?.signal?.addEventListener('abort', () => controller.abort(init.signal?.reason));

  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}

export function getSupabase(): SupabaseClient {
  if (!env.supabase.configured) {
    throw new Error('Falta configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY');
  }

  if (!client) {
    client = createClient(env.supabase.url, env.supabase.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
      global: { fetch: fetchWithTimeout },
    });
  }
  return client;
}
