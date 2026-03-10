const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T | null;
  errorCode: string | null;
  errors: string[];
}

function parseResponseBody<T>(res: Response): Promise<ApiResponse<T> | null> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return Promise.resolve(null);
  }
  const text = res.text();
  return text.then((body) => {
    if (!body || body.trim() === '') return null;
    try {
      return JSON.parse(body) as ApiResponse<T>;
    } catch {
      return null;
    }
  });
}

const SERVER_ERROR_MSG =
  'El servidor no respondió correctamente. Comprueba que el backend NestJS esté en marcha (puerto 3000).';

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = API_BASE ? `${API_BASE}${path}` : `/api${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const json = await parseResponseBody<T>(res);
  if (!res.ok) {
    if (json) {
      const msg = Array.isArray(json.errors) ? json.errors.join(', ') : json.message;
      throw new Error(msg || `Error ${res.status}`);
    }
    if (res.status >= 500) {
      throw new Error(SERVER_ERROR_MSG);
    }
    throw new Error(`Error ${res.status}: ${res.statusText || SERVER_ERROR_MSG}`);
  }
  if (json === null) {
    throw new Error(SERVER_ERROR_MSG);
  }
  return json;
}

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const out = await request<T>(path, { method: 'GET', headers });
  if (out && typeof out === 'object' && 'data' in out) {
    return out.data as T;
  }
  return out as unknown as T;
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  token?: string,
): Promise<T> {
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const out = await request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  });
  return out.data as T;
}
