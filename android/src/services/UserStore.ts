import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'vibezen.user';

/**
 * Owns the current user id and persists it across launches.
 *
 * Mirrors `frontend/src/app/services/user.ts` but uses AsyncStorage instead
 * of the URL query param (there is no URL bar on mobile). The default user
 * matches the web app's `UserService.DEFAULT_USER = 'A'` so dev sessions
 * line up across platforms.
 */
class UserStore {
  static readonly DEFAULT_USER = 'A';

  private current = UserStore.DEFAULT_USER;
  private listeners = new Set<(user: string) => void>();

  get user(): string {
    return this.current;
  }

  /** Load persisted user. Call once during app bootstrap. */
  async init(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored && stored.trim()) {
        this.current = stored.trim();
      }
    } catch {
      // fall back to default
    }
  }

  setUser(user: string): void {
    const next = user.trim() || UserStore.DEFAULT_USER;
    if (next === this.current) return;
    this.current = next;
    void AsyncStorage.setItem(STORAGE_KEY, next);
    for (const listener of this.listeners) {
      listener(next);
    }
  }

  subscribe(listener: (user: string) => void): () => void {
    this.listeners.add(listener);
    listener(this.current);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const userStore = new UserStore();
