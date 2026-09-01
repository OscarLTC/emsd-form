import { HttpError, NetworkError } from '../http/httpClient';

const PATRON_RED = /fetch|network|failed to fetch|load failed|timeout/i;

interface ErrorSupabase {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
  statusCode?: string;
}

function describir(causa: unknown, mensajePorDefecto: string): string {
  if (typeof causa !== 'object' || causa === null) {
    return String(causa ?? mensajePorDefecto);
  }

  const { message, code, details } = causa as ErrorSupabase;
  const partes = [message || mensajePorDefecto];
  if (code) partes.push(`[${code}]`);
  if (details) partes.push(details);
  return partes.join(' ');
}

function estado(causa: unknown): number {
  const { status, statusCode } = (causa ?? {}) as ErrorSupabase;
  const numero = Number(status ?? statusCode);
  return Number.isFinite(numero) && numero > 0 ? numero : 500;
}

export function traducirError(causa: unknown, mensajePorDefecto: string): Error {
  const descripcion = describir(causa, mensajePorDefecto);

  if (!navigator.onLine || PATRON_RED.test(descripcion)) {
    return new NetworkError();
  }

  return new HttpError(estado(causa), descripcion);
}
