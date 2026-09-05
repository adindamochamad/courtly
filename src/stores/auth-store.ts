import { create } from 'zustand';

import { authToken } from '@/api/auth-token';
import type { AuthUser, LoginResponse } from '@/api/schemas';
import { secureStorage } from '@/lib/storage';

const TOKEN_KEY = 'courtly.accessToken';
const USER_KEY = 'courtly.user';

type AuthStatus = 'bootstrapping' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  token: string | null;
  user: AuthUser | null;
  /** Restore the persisted session on app start. */
  bootstrap: () => Promise<void>;
  /** Persist a fresh session after login/register. */
  signIn: (session: LoginResponse) => Promise<void>;
  /** Clear the session locally (logout / expired token). */
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  status: 'bootstrapping',
  token: null,
  user: null,

  bootstrap: async () => {
    try {
      const [token, rawUser] = await Promise.all([
        secureStorage.get(TOKEN_KEY),
        secureStorage.get(USER_KEY),
      ]);
      if (token && rawUser) {
        authToken.set(token);
        set({
          status: 'authenticated',
          token,
          user: JSON.parse(rawUser) as AuthUser,
        });
        return;
      }
    } catch {
      // Corrupted storage — fall through to a clean slate.
    }
    set({ status: 'unauthenticated', token: null, user: null });
  },

  signIn: async ({ accessToken, user }) => {
    authToken.set(accessToken);
    await Promise.all([
      secureStorage.set(TOKEN_KEY, accessToken),
      secureStorage.set(USER_KEY, JSON.stringify(user)),
    ]);
    set({ status: 'authenticated', token: accessToken, user });
  },

  signOut: async () => {
    authToken.set(null);
    await Promise.all([
      secureStorage.remove(TOKEN_KEY),
      secureStorage.remove(USER_KEY),
    ]);
    set({ status: 'unauthenticated', token: null, user: null });
  },
}));

// When any API call gets a 401, drop the session so the
// route guard redirects to the login screen automatically.
authToken.setUnauthorizedHandler(() => {
  void useAuthStore.getState().signOut();
});
