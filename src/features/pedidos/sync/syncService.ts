import { env } from '../../../config/env';
import { NetworkError } from '../../../core/http/httpClient';
import { log } from '../../../core/logging/logger';
import { outboxRepository } from '../repository/outboxRepository';
import { pedidosService } from '../services';
import type { ItemCola } from '../types/pedido.types';

export interface EstadoSync {
  pendientes: number;
  fallidos: number;
  sincronizando: boolean;
  ultimaSincronizacion: string | null;
  ultimoError: string | null;
}

let estado: EstadoSync = {
  pendientes: 0,
  fallidos: 0,
  sincronizando: false,
  ultimaSincronizacion: null,
  ultimoError: null,
};

const suscriptores = new Set<() => void>();

function emitir(cambios: Partial<EstadoSync>): void {
  const siguiente = { ...estado, ...cambios };
  const sinCambios = (Object.keys(siguiente) as (keyof EstadoSync)[]).every(
    (clave) => siguiente[clave] === estado[clave],
  );
  if (sinCambios) return;

  estado = siguiente;
  suscriptores.forEach((notificar) => notificar());
}

function mensajeError(causa: unknown): string {
  return causa instanceof Error ? causa.message : 'Error desconocido al sincronizar';
}

async function contar(): Promise<ItemCola[]> {
  const items = await outboxRepository.listar();
  emitir({
    pendientes: items.filter((item) => item.estado === 'pendiente').length,
    fallidos: items.filter((item) => item.estado === 'error').length,
  });
  return items;
}

export const syncService = {
  subscribe(listener: () => void): () => void {
    suscriptores.add(listener);
    return () => suscriptores.delete(listener);
  },

  getSnapshot(): EstadoSync {
    return estado;
  },

  async refrescar(): Promise<void> {
    await contar().catch(() => undefined);
  },

  async encolar(item: ItemCola): Promise<void> {
    await outboxRepository.guardar(item);
    log.info('sync', `encolado ${item.registro.numeroPedido}`, { id: item.id, fotos: item.fotos.length });
    await contar();
    void syncService.sincronizar();
  },

  async descartar(id: string): Promise<void> {
    await outboxRepository.eliminar(id);
    await contar();
  },

  async sincronizar(opciones: { forzarFallidos?: boolean } = {}): Promise<void> {
    if (estado.sincronizando) {
      log.info('sync', 'ciclo omitido: ya hay uno en curso');
      return;
    }
    if (!navigator.onLine) {
      log.info('sync', 'ciclo omitido: sin conexión', { pendientes: estado.pendientes });
      return;
    }

    const items = await contar().catch(() => [] as ItemCola[]);
    const pendientes = items.filter(
      (item) =>
        item.estado === 'pendiente' ||
        opciones.forzarFallidos ||
        item.intentos < env.sync.maxAttempts,
    );
    if (pendientes.length === 0) {
      log.info('sync', 'nada por enviar', { enCola: items.length });
      return;
    }

    emitir({ sincronizando: true, ultimoError: null });
    log.info('sync', `ciclo iniciado con ${pendientes.length} pedido(s)`, {
      forzarFallidos: Boolean(opciones.forzarFallidos),
    });

    let errorFinal: string | null = null;
    let enviados = 0;

    for (const item of pendientes) {
      try {
        await pedidosService.enviar(item);
        await outboxRepository.eliminar(item.id);
        enviados += 1;
        log.info('sync', `enviado ${item.registro.numeroPedido}`, { id: item.id });
      } catch (causa) {
        if (causa instanceof NetworkError || !navigator.onLine) {
          errorFinal = 'Sin conexión: la cola se reenviará automáticamente';
          log.info('sync', 'ciclo cortado por falta de red', { id: item.id });
          break;
        }

        errorFinal = mensajeError(causa);
        const intentos = item.intentos + 1;
        log.error('sync', `falló ${item.registro.numeroPedido} (intento ${intentos}/${env.sync.maxAttempts})`, causa);

        await outboxRepository.guardar({
          ...item,
          estado: 'error',
          intentos,
          ultimoError: errorFinal,
        });
      }
    }

    emitir({
      sincronizando: false,
      ultimoError: errorFinal,
      ultimaSincronizacion: new Date().toISOString(),
    });
    await contar();
    log.info('sync', `ciclo terminado: ${enviados} enviado(s)`, {
      pendientes: estado.pendientes,
      fallidos: estado.fallidos,
    });
  },
};
