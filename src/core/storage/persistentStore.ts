interface StoredEntry<T> {
  data: T;
  expiresAt: number;
}

export function createPersistentStore<T>(key: string, ttlMs: number) {
  return {
    read(): T | null {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;

        const entry = JSON.parse(raw) as StoredEntry<T>;
        if (!entry || typeof entry.expiresAt !== 'number' || Date.now() > entry.expiresAt) {
          localStorage.removeItem(key);
          return null;
        }
        return entry.data;
      } catch {
        localStorage.removeItem(key);
        return null;
      }
    },

    save(data: T): void {
      const entry: StoredEntry<T> = { data, expiresAt: Date.now() + ttlMs };
      try {
        localStorage.setItem(key, JSON.stringify(entry));
      } catch {
        /* Storage full or blocked: the session lives in memory only. */
      }
    },

    clear(): void {
      localStorage.removeItem(key);
    },
  };
}
