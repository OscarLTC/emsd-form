import type { ItemCola, PedidosService } from '../types/pedido.types';
import { request } from '../../../core/http/httpClient';
import { sessionStore } from '../../auth/services/sessionStore';

export const httpPedidosService: PedidosService = {
  async enviar(item: ItemCola): Promise<void> {
    const sesion = sessionStore.read();
    const formData = new FormData();
    formData.append('id', item.id);
    formData.append('registro', JSON.stringify(item.registro));
    item.fotos.forEach((foto) => {
      formData.append('fotos', foto.blob, foto.nombre);
    });

    await request<void>('/pedidos', {
      method: 'POST',
      body: formData,
      token: sesion?.token ?? null,
    });
  },
};
