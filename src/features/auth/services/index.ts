import { env } from '../../../config/env';
import type { AuthService } from '../types/auth.types';
import { httpAuthService } from './authService.http';
import { supabaseAuthService } from './authService.supabase';

export const authService: AuthService =
  env.api.mode === 'http' ? httpAuthService : supabaseAuthService;
