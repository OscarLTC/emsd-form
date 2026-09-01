/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_DEBUG?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_API_MODE?: 'supabase' | 'http';
  readonly VITE_API_URL?: string;
  readonly VITE_API_TIMEOUT_MS?: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_BUCKET?: string;
  readonly VITE_SESSION_STORAGE_KEY?: string;
  readonly VITE_SESSION_TTL_HOURS?: string;
  readonly VITE_SYNC_INTERVAL_MS?: string;
  readonly VITE_SYNC_MAX_ATTEMPTS?: string;
  readonly VITE_PHOTO_MAX_COUNT?: string;
  readonly VITE_PHOTO_MAX_WIDTH?: string;
  readonly VITE_PHOTO_QUALITY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
