import { env } from '../../../config/env';
import { getSupabase } from '../../../core/supabase/client';
import { translateError } from '../../../core/supabase/errors';
import type { OrdersService, QueueItem } from '../types/order.types';

const ORDERS_TABLE = 'contingency_orders';

async function uploadEvidence(item: QueueItem): Promise<string[]> {
  const paths: string[] = [];

  for (const photo of item.photos) {
    const path = `${item.record.userId}/${item.id}/${photo.id}.jpg`;
    const { error } = await getSupabase()
      .storage.from(env.supabase.bucket)
      .upload(path, photo.blob, {
        upsert: true,
        contentType: photo.blob.type || 'image/jpeg',
      });

    if (error) throw translateError(error, 'No se pudo subir la evidencia');
    paths.push(path);
  }

  return paths;
}

export const supabaseOrdersService: OrdersService = {
  async send(item: QueueItem): Promise<void> {
    const photoPaths = await uploadEvidence(item);
    const { record } = item;

    const { error } = await getSupabase()
      .from(ORDERS_TABLE)
      .upsert(
        {
          id: item.id,
          order_number: record.orderNumber,
          customer: record.customer,
          address: record.address,
          result: record.result,
          reason: record.reason || null,
          comment: record.comment || null,
          recorded_at: record.recordedAt,
          user_id: record.userId,
          user_name: record.userName,
          photo_paths: photoPaths,
          queued_at: item.createdAt,
        },
        { onConflict: 'id' },
      );

    if (error) throw translateError(error, 'No se pudo registrar el pedido');
  },
};
