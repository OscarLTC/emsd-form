import type { AuthService, AuthSession, Credentials } from '../types/auth.types';
import { request } from '../../../core/http/httpClient';

export const httpAuthService: AuthService = {
  login(credentials: Credentials): Promise<AuthSession> {
    return request<AuthSession>('/auth/login', { method: 'POST', body: credentials });
  },

  async logout(token: string): Promise<void> {
    await request<void>('/auth/logout', { method: 'POST', token });
  },
};
