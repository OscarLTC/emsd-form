const API_MODES = ['supabase', 'http'] as const;

type ApiMode = (typeof API_MODES)[number];

const toApiMode = (value: string | undefined): ApiMode =>
  API_MODES.includes(value as ApiMode) ? (value as ApiMode) : 'supabase';

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const env = {
  debug: import.meta.env.VITE_DEBUG === 'true' || import.meta.env.DEV,
  appName: import.meta.env.VITE_APP_NAME || 'Formulario móvil de contingencia',
  api: {
    mode: toApiMode(import.meta.env.VITE_API_MODE),
    baseUrl: (import.meta.env.VITE_API_URL || '').replace(/\/$/, ''),
    timeoutMs: toNumber(import.meta.env.VITE_API_TIMEOUT_MS, 15000),
    requestTimeoutMs: toNumber(import.meta.env.VITE_REQUEST_TIMEOUT_MS, 20000),
    uploadTimeoutMs: toNumber(import.meta.env.VITE_UPLOAD_TIMEOUT_MS, 60000),
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    bucket: import.meta.env.VITE_SUPABASE_BUCKET || 'evidence',
    configured: Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
  },
  session: {
    storageKey: import.meta.env.VITE_SESSION_STORAGE_KEY || 'emsd.session',
    ttlMs: toNumber(import.meta.env.VITE_SESSION_TTL_HOURS, 12) * 60 * 60 * 1000,
  },
  sync: {
    intervalMs: toNumber(import.meta.env.VITE_SYNC_INTERVAL_MS, 30000),
    maxAttempts: toNumber(import.meta.env.VITE_SYNC_MAX_ATTEMPTS, 5),
  },
  photo: {
    maxCount: toNumber(import.meta.env.VITE_PHOTO_MAX_COUNT, 4),
    maxWidth: toNumber(import.meta.env.VITE_PHOTO_MAX_WIDTH, 1280),
    quality: Math.min(Math.max(toNumber(import.meta.env.VITE_PHOTO_QUALITY, 0.7), 0.1), 1),
  },
} as const;
