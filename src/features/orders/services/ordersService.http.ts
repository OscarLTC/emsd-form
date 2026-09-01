import type { OrdersService, QueueItem } from '../types/order.types';
import { request } from '../../../core/http/httpClient';
import { sessionStore } from '../../auth/services/sessionStore';

export const httpOrdersService: OrdersService = {
  async send(item: QueueItem): Promise<void> {
    const session = sessionStore.read();
    const formData = new FormData();
    formData.append('id', item.id);
    formData.append('record', JSON.stringify(item.record));
    item.photos.forEach((photo) => {
      formData.append('photos', photo.blob, photo.name);
    });

    await request<void>('/orders', {
      method: 'POST',
      body: formData,
      token: session?.token ?? null,
    });
  },
};
