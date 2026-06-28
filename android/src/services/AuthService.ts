import * as SecureStore from 'expo-secure-store';

import { config } from '@/config/env';

/**
 * Native authentication.
 *
 * Per the updated plan, login/logout happens natively in the app (not inside
 * the WebView). The resulting credentials (JWT/session token + user id) are:
 *   1. Stored securely via `expo-secure-store`.
 *   2. Injected into the WebView so the web session shares identical
 *      credentials (see `HomeScreen`).
 *   3. Used by the SignalR client and REST client.
 *
 * The backend does not yet expose a real auth endpoint, so `login` posts to a
 * placeholder `/api/auth/login` route. Swap the URL/shape once the backend
 * implements real authentication.
 */
export interface AuthSession {
  token: string;
  userId: string;
}

const TOKEN_KEY = 'vibezen.token';
const USER_KEY = 'vibezen.user';

interface LoginResponse {
  token: string;
  userId: string;
}

class AuthService {
  private session: AuthSession | null = null;
  private listeners = new Set<(session: AuthSession | null) => void>();

  get current(): AuthSession | null {
    return this.session;
  }

  get isAuthenticated(): boolean {
    return this.session !== null;
  }

  /** Restore a previously stored session. Call once during bootstrap. */
  async init(): Promise<void> {
    try {
      const [token, userId] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);
      if (token && userId) {
        this.session = { token, userId };
      }
    } catch {
      // SecureStore unavailable — treat as logged out.
    }
  }

  async login(username: string, password: string): Promise<AuthSession> {
    const res = await fetch(`${config.apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      throw new Error(`Login failed: ${res.status}`);
    }

    const data = (await res.json()) as LoginResponse;
    this.session = { token: data.token, userId: data.userId };

    await SecureStore.setItemAsync(TOKEN_KEY, this.session.token);
    await SecureStore.setItemAsync(USER_KEY, this.session.userId);

    this.emit();
    return this.session;
  }

  async logout(): Promise<void> {
    this.session = null;
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    this.emit();
  }

  subscribe(listener: (session: AuthSession | null) => void): () => void {
    this.listeners.add(listener);
    listener(this.session);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener(this.session);
    }
  }
}

export const authService = new AuthService();
