import { env } from '../../config/env';

function timestamp(): string {
  return new Date().toLocaleTimeString('es-PE', { hour12: false });
}

export const log = {
  info(scope: string, message: string, data?: unknown): void {
    if (!env.debug) return;
    console.info(`%c${timestamp()} [${scope}]`, 'color:#1358d8;font-weight:600', message, data ?? '');
  },

  error(scope: string, message: string, data?: unknown): void {
    console.error(`${timestamp()} [${scope}] ${message}`, data ?? '');
  },
};
