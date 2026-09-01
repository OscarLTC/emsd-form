import { idb, STORE_OUTBOX } from '../../../core/db/indexedDb';
import type { QueueItem } from '../types/order.types';

/**
 * Items queued by earlier versions: Spanish field names and a single photo.
 * They are mapped on read so a pending order is never lost on an app update.
 */
interface LegacyQueueItem extends Partial<QueueItem> {
  id: string;
  registro?: Record<string, string>;
  fotos?: QueueItem['photos'];
  foto?: Blob | null;
  fotoNombre?: string | null;
  estado?: string;
  intentos?: number;
  creadoEn?: string;
  ultimoError?: string | null;
}

const LEGACY_RESULTS: Record<string, string> = { entregado: 'delivered', fallido: 'failed' };

function normalize(item: LegacyQueueItem): QueueItem {
  if (item.record && item.photos) return item as QueueItem;

  const legacy = item.registro ?? {};
  const photos = item.photos ??
    item.fotos ?? (item.foto ? [{ id: item.id, blob: item.foto, name: item.fotoNombre ?? 'evidencia.jpg' }] : []);

  return {
    id: item.id,
    record: item.record ?? {
      orderNumber: legacy.numeroPedido,
      customer: legacy.cliente,
      address: legacy.direccion,
      result: LEGACY_RESULTS[legacy.resultado] ?? legacy.resultado,
      reason: legacy.motivo,
      comment: legacy.comentario,
      recordedAt: legacy.registradoEn,
      userId: legacy.usuarioId,
      userName: legacy.usuarioNombre,
    } as QueueItem['record'],
    photos,
    status: item.status ?? (item.estado === 'error' ? 'error' : 'pending'),
    attempts: item.attempts ?? item.intentos ?? 0,
    createdAt: item.createdAt ?? item.creadoEn ?? new Date().toISOString(),
    lastError: item.lastError ?? item.ultimoError ?? null,
  };
}

export const outboxRepository = {
  async list(): Promise<QueueItem[]> {
    const items = await idb.getAll<LegacyQueueItem>(STORE_OUTBOX);
    return items.map(normalize).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async save(item: QueueItem): Promise<void> {
    await idb.put(STORE_OUTBOX, item);
  },

  async remove(id: string): Promise<void> {
    await idb.remove(STORE_OUTBOX, id);
  },
};
