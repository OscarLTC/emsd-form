import { modoApi } from '../../../config/adaptadores';
import type { AuthService } from '../types/auth.types';
import { mockAuthService } from './authService.mock';
import { httpAuthService } from './authService.http';
import { supabaseAuthService } from './authService.supabase';

const ADAPTADORES: Record<typeof modoApi, AuthService> = {
  mock: mockAuthService,
  http: httpAuthService,
  supabase: supabaseAuthService,
};

export const authService: AuthService = ADAPTADORES[modoApi];
