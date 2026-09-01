import { env } from '../../../config/env';
import type { PedidosService } from '../types/pedido.types';
import { httpPedidosService } from './pedidosService.http';
import { supabasePedidosService } from './pedidosService.supabase';

export const pedidosService: PedidosService =
  env.api.mode === 'http' ? httpPedidosService : supabasePedidosService;
