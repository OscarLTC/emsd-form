import { env } from '../../config/env';

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export class NetworkError extends Error {
  constructor(message = 'Sin conexión con el servidor') {
    super(message);
    this.name = 'NetworkError';
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
}

async function parseError(response: Response): Promise<string> {
  try {
    const payload = await response.json();
    return payload?.message ?? payload?.error ?? response.statusText;
  } catch {
    return response.statusText || `Error ${response.status}`;
  }
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, signal } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.api.timeoutMs);
  signal?.addEventListener('abort', () => controller.abort());

  const isFormData = body instanceof FormData;
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json';

  try {
    const response = await fetch(`${env.api.baseUrl}${path}`, {
      method,
      headers,
      signal: controller.signal,
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new HttpError(response.status, await parseError(response));
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new NetworkError();
  } finally {
    clearTimeout(timeout);
  }
}
