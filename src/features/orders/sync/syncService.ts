import { env } from '../../../config/env';
import { NetworkError } from '../../../core/http/httpClient';
import { log } from '../../../core/logging/logger';
import { outboxRepository } from '../repository/outboxRepository';
import { ordersService } from '../services';
import type { QueueItem } from '../types/order.types';

export interface SyncState {
  pending: number;
  failed: number;
  isSyncing: boolean;
  lastSyncAt: string | null;
  lastError: string | null;
}

let state: SyncState = {
  pending: 0,
  failed: 0,
  isSyncing: false,
  lastSyncAt: null,
  lastError: null,
};

const subscribers = new Set<() => void>();

function emit(changes: Partial<SyncState>): void {
  const next = { ...state, ...changes };
  const unchanged = (Object.keys(next) as (keyof SyncState)[]).every(
    (key) => next[key] === state[key],
  );
  if (unchanged) return;

  state = next;
  subscribers.forEach((notify) => notify());
}

function errorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'Error desconocido al sincronizar';
}

async function count(): Promise<QueueItem[]> {
  const items = await outboxRepository.list();
  emit({
    pending: items.filter((item) => item.status === 'pending').length,
    failed: items.filter((item) => item.status === 'error').length,
  });
  return items;
}

export const syncService = {
  subscribe(listener: () => void): () => void {
    subscribers.add(listener);
    return () => subscribers.delete(listener);
  },

  getSnapshot(): SyncState {
    return state;
  },

  async refresh(): Promise<void> {
    await count().catch(() => undefined);
  },

  async enqueue(item: QueueItem): Promise<void> {
    await outboxRepository.save(item);
    log.info('sync', `queued ${item.record.orderNumber}`, {
      id: item.id,
      photos: item.photos.length,
    });
    await count();
    void syncService.sync();
  },

  async discard(id: string): Promise<void> {
    await outboxRepository.remove(id);
    await count();
  },

  async sync(options: { retryFailed?: boolean } = {}): Promise<void> {
    if (state.isSyncing) {
      log.info('sync', 'cycle skipped: one is already running');
      return;
    }
    if (!navigator.onLine) {
      log.info('sync', 'cycle skipped: offline', { pending: state.pending });
      return;
    }

    const items = await count().catch(() => [] as QueueItem[]);
    const pending = items.filter(
      (item) =>
        item.status === 'pending' || options.retryFailed || item.attempts < env.sync.maxAttempts,
    );
    if (pending.length === 0) {
      log.info('sync', 'nothing to send', { queued: items.length });
      return;
    }

    emit({ isSyncing: true, lastError: null });
    log.info('sync', `cycle started with ${pending.length} order(s)`, {
      retryFailed: Boolean(options.retryFailed),
    });

    let finalError: string | null = null;
    let sent = 0;

    try {
      for (const item of pending) {
        try {
          await ordersService.send(item);
          await outboxRepository.remove(item.id);
          sent += 1;
          log.info('sync', `sent ${item.record.orderNumber}`, { id: item.id });
        } catch (cause) {
          if (cause instanceof NetworkError || !navigator.onLine) {
            finalError = cause instanceof NetworkError ? cause.message : 'Sin conexión';
            log.info('sync', 'cycle stopped by a network problem', {
              id: item.id,
              cause: finalError,
            });
            break;
          }

          finalError = errorMessage(cause);
          const attempts = item.attempts + 1;
          log.error(
            'sync',
            `failed ${item.record.orderNumber} (attempt ${attempts}/${env.sync.maxAttempts})`,
            cause,
          );

          await outboxRepository.save({
            ...item,
            status: 'error',
            attempts,
            lastError: finalError,
          });
        }
      }
    } finally {
      emit({
        isSyncing: false,
        lastError: finalError,
        lastSyncAt: new Date().toISOString(),
      });
      await count().catch(() => undefined);
      log.info('sync', `cycle finished: ${sent} sent`, {
        pending: state.pending,
        failed: state.failed,
      });
    }
  },
};
