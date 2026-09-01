import { useEffect, useSyncExternalStore } from 'react';
import { env } from '../../../config/env';
import { syncService } from './syncService';
import type { EstadoSync } from './syncService';

export function useSync(): EstadoSync {
  return useSyncExternalStore(syncService.subscribe, syncService.getSnapshot, syncService.getSnapshot);
}

export function useSincronizacionAutomatica(activo: boolean): void {
  useEffect(() => {
    if (!activo) return;

    const intentar = () => void syncService.sincronizar();
    const alVolverAlFrente = () => {
      if (document.visibilityState === 'visible') intentar();
    };

    void syncService.refrescar();
    intentar();

    window.addEventListener('online', intentar);
    document.addEventListener('visibilitychange', alVolverAlFrente);
    const intervalo = window.setInterval(intentar, env.sync.intervalMs);

    return () => {
      window.removeEventListener('online', intentar);
      document.removeEventListener('visibilitychange', alVolverAlFrente);
      window.clearInterval(intervalo);
    };
  }, [activo]);
}
