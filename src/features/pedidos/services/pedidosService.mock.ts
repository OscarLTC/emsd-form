import type { ItemCola, PedidosService } from '../types/pedido.types';

const demora = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockPedidosService: PedidosService = {
  async enviar(item: ItemCola): Promise<void> {
    await demora(500);
    console.info('[mock] pedido sincronizado', item.registro.numeroPedido);
  },
};
