import { z } from 'zod';

import { authToken } from './auth-token';

export const API_BASE_URL = 'https://courtly-api.hyge.web.id';

/**
 * Typed API error. `status` mirrors the HTTP status code so callers
 * can branch on specific cases (401 expired token, 409 conflict, ...).
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  /** Skip attaching the Authorization header (public endpoints). */
  public?: boolean;
};

/**
 * Thin typed wrapper around fetch.
 *
 * - Attaches `Authorization: Bearer <token>` for protected routes
 * - Validates the response against a Zod schema (fail fast on drift)
 * - Normalizes errors into `ApiError`
 * - Signs the user out when the token is rejected (401)
 */
export async function apiRequest<S extends z.ZodType>(
  path: string,
  schema: S,
  options: RequestOptions = {},
): Promise<z.infer<S>> {
  const { method = 'GET', body, query, public: isPublic = false } = options;

  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  const token = authToken.get();
  if (!isPublic && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'No internet connection. Please try again.');
  }

  if (response.status === 401) {
    authToken.notifyUnauthorized();
    throw new ApiError(401, 'Your session has expired. Please sign in again.');
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const errorBody = await response.json();
      if (typeof errorBody?.message === 'string') {
        message = errorBody.message;
      } else if (Array.isArray(errorBody?.message)) {
        message = errorBody.message.join(', ');
      }
    } catch {
      // Non-JSON error body — keep the generic message.
    }
    throw new ApiError(response.status, message);
  }

  const json = await response.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    console.error('[api] Response failed schema validation', {
      path,
      issues: parsed.error.issues,
    });
    throw new ApiError(response.status, 'Unexpected response from server.');
  }
  return parsed.data;
}
