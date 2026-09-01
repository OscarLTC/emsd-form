import { env } from '../../config/env';

function marca(): string {
  return new Date().toLocaleTimeString('es-PE', { hour12: false });
}

export const log = {
  info(ambito: string, mensaje: string, datos?: unknown): void {
    if (!env.debug) return;
    console.info(`%c${marca()} [${ambito}]`, 'color:#1358d8;font-weight:600', mensaje, datos ?? '');
  },

  error(ambito: string, mensaje: string, datos?: unknown): void {
    console.error(`${marca()} [${ambito}] ${mensaje}`, datos ?? '');
  },
};
