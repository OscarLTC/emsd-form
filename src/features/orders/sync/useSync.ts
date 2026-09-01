import { useEffect, useSyncExternalStore } from 'react';
import { env } from '../../../config/env';
import { syncService } from './syncService';
import type { SyncState } from './syncService';

export function useSync(): SyncState {
  return useSyncExternalStore(
    syncService.subscribe,
    syncService.getSnapshot,
    syncService.getSnapshot,
  );
}

export function useAutoSync(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    const attempt = () => void syncService.sync();
    const onForeground = () => {
      if (document.visibilityState === 'visible') attempt();
    };

    void syncService.refresh();
    attempt();

    window.addEventListener('online', attempt);
    document.addEventListener('visibilitychange', onForeground);
    const interval = window.setInterval(attempt, env.sync.intervalMs);

    return () => {
      window.removeEventListener('online', attempt);
      document.removeEventListener('visibilitychange', onForeground);
      window.clearInterval(interval);
    };
  }, [enabled]);
}
