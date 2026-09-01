import { env } from '../../../config/env';
import type { OrdersService } from '../types/order.types';
import { httpOrdersService } from './ordersService.http';
import { supabaseOrdersService } from './ordersService.supabase';

export const ordersService: OrdersService =
  env.api.mode === 'http' ? httpOrdersService : supabaseOrdersService;
