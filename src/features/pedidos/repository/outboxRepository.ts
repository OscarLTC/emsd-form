import { idb, STORE_OUTBOX } from '../../../core/db/indexedDb';
import type { ItemCola } from '../types/pedido.types';

/** Formato anterior a la evidencia múltiple: una sola foto por pedido. */
interface ItemColaLegado extends Omit<ItemCola, 'fotos'> {
  fotos?: ItemCola['fotos'];
  foto?: Blob | null;
  fotoNombre?: string | null;
}

function normalizar(item: ItemColaLegado): ItemCola {
  const { foto, fotoNombre, ...resto } = item;
  if (resto.fotos) return resto as ItemCola;

  return {
    ...resto,
    fotos: foto ? [{ id: item.id, blob: foto, nombre: fotoNombre ?? 'evidencia.jpg' }] : [],
  };
}

export const outboxRepository = {
  async listar(): Promise<ItemCola[]> {
    const items = await idb.getAll<ItemColaLegado>(STORE_OUTBOX);
    return items.map(normalizar).sort((a, b) => a.creadoEn.localeCompare(b.creadoEn));
  },

  async guardar(item: ItemCola): Promise<void> {
    await idb.put(STORE_OUTBOX, item);
  },

  async eliminar(id: string): Promise<void> {
    await idb.remove(STORE_OUTBOX, id);
  },
};
