import { modoApi } from '../../../config/adaptadores';
import type { PedidosService } from '../types/pedido.types';
import { mockPedidosService } from './pedidosService.mock';
import { httpPedidosService } from './pedidosService.http';
import { supabasePedidosService } from './pedidosService.supabase';

const ADAPTADORES: Record<typeof modoApi, PedidosService> = {
  mock: mockPedidosService,
  http: httpPedidosService,
  supabase: supabasePedidosService,
};

export const pedidosService: PedidosService = ADAPTADORES[modoApi];
