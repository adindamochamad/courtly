/**
 * Module-level holder for the access token.
 *
 * The API client reads from here and the auth store writes to it.
 * This indirection avoids a circular import between
 * `api/client.ts` and `stores/auth-store.ts`.
 */

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export const authToken = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token;
  },
  /** Called by the API client when the server rejects the token (401). */
  setUnauthorizedHandler: (handler: (() => void) | null) => {
    onUnauthorized = handler;
  },
  notifyUnauthorized: () => {
    onUnauthorized?.();
  },
};
