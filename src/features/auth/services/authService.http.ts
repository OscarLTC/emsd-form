import type { AuthService, Credenciales, Sesion } from '../types/auth.types';
import { request } from '../../../core/http/httpClient';

export const httpAuthService: AuthService = {
  login(credenciales: Credenciales): Promise<Sesion> {
    return request<Sesion>('/auth/login', { method: 'POST', body: credenciales });
  },

  async logout(token: string): Promise<void> {
    await request<void>('/auth/logout', { method: 'POST', token });
  },
};
