import { HttpError, NetworkError } from '../http/httpClient';

const NETWORK_PATTERN = /fetch|network|failed to fetch|load failed|timeout|abort/i;

interface SupabaseErrorShape {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
  statusCode?: string;
}

function isTimeout(cause: unknown): boolean {
  const name = (cause as { name?: string })?.name;
  return name === 'TimeoutError' || name === 'AbortError';
}

function describe(cause: unknown, fallbackMessage: string): string {
  if (typeof cause !== 'object' || cause === null) {
    return String(cause ?? fallbackMessage);
  }

  const { message, code, details } = cause as SupabaseErrorShape;
  const parts = [message || fallbackMessage];
  if (code) parts.push(`[${code}]`);
  if (details) parts.push(details);
  return parts.join(' ');
}

function statusOf(cause: unknown): number {
  const { status, statusCode } = (cause ?? {}) as SupabaseErrorShape;
  const parsed = Number(status ?? statusCode);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 500;
}

export function translateError(cause: unknown, fallbackMessage: string): Error {
  const description = describe(cause, fallbackMessage);

  if (isTimeout(cause)) {
    return new NetworkError('La señal es demasiado débil para completar el envío');
  }

  if (!navigator.onLine || NETWORK_PATTERN.test(description)) {
    return new NetworkError();
  }

  return new HttpError(statusOf(cause), description);
}
