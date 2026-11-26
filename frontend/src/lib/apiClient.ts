import { auth } from './firebase';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  requireAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (requireAuth) {
    const currentUser = auth?.currentUser;
    if (!currentUser) {
      throw new ApiError('Please sign in with Pi first.', 401);
    }
    const idToken = await currentUser.getIdToken();
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.detail || body.message || `Request failed (${res.status})`, res.status);
  }
  return body as T;
}

export const apiClient = {
  get: <T>(path: string, requireAuth = true) => request<T>(path, { method: 'GET' }, requireAuth),
  post: <T>(path: string, payload?: unknown, requireAuth = true) =>
    request<T>(
      path,
      {
        method: 'POST',
        body: payload !== undefined ? JSON.stringify(payload) : undefined,
      },
      requireAuth
    ),
  patch: <T>(path: string, payload?: unknown, requireAuth = true) =>
    request<T>(
      path,
      {
        method: 'PATCH',
        body: payload !== undefined ? JSON.stringify(payload) : undefined,
      },
      requireAuth
    ),
  delete: <T>(path: string, requireAuth = true) =>
    request<T>(path, { method: 'DELETE' }, requireAuth),
};
