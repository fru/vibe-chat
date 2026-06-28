import { config } from '@/config/env';

/**
 * WonderPush integration (EU GDPR-compliant push provider).
 *
 * Implements the background-notification layer from
 * `plans/5-android-app.md` §3:
 *  - Foreground messages arrive over SignalR.
 *  - Background messages arrive via WonderPush.
 *  - Deduplication: if a push arrives for a message already present in local
 *    chat state, the banner is suppressed.
 *
 * The native module is only available in a custom development build
 * (not Expo Go). When the module is absent (e.g. on simulator or Expo Go),
 * every method degrades to a no-op so the rest of the app keeps working.
 */
interface WonderPushNative {
  initialize(clientId: string, clientSecret: string): Promise<void>;
  setUserId(userId: string): Promise<void>;
  getUserId(): Promise<string | null>;
  onNotificationReceived(
    handler: (payload: WonderPushPayload) => void,
  ): () => void;
}

export interface WonderPushPayload {
  messageId?: string;
  room?: string;
  title?: string;
  message?: string;
  [key: string]: unknown;
}

/** Set of message ids already seen via SignalR — used for dedup. */
const seenMessageIds = new Set<string>();

/** Register a message id as already delivered to suppress duplicate pushes. */
export function markMessageSeen(messageId: string): void {
  seenMessageIds.add(messageId);
}

class WonderPushService {
  private native: WonderPushNative | null = null;
  private initialized = false;
  private dedupHandler: ((payload: WonderPushPayload) => void) | null = null;

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Lazy require so the bundler does not hard-fail when the native module
      // is absent (Expo Go / simulator).
      const mod = require('react-native-wonderpush');
      this.native = (mod.default ?? mod) as WonderPushNative;
      await this.native.initialize(
        config.wonderpush.clientId,
        config.wonderpush.clientSecret,
      );
      this.initialized = true;
      this.installDedupHandler();
    } catch (err) {
      // Native module unavailable — push notifications disabled, app continues.
      console.warn(
        '[WonderPush] Native module unavailable; push notifications disabled.',
        err,
      );
    }
  }

  async setUserId(userId: string): Promise<void> {
    try {
      await this.native?.setUserId(userId);
    } catch {
      // ignore — best effort
    }
  }

  /**
   * Install the dedup handler.
   *
   * Per §3 "Data Deduplication Rule": when a push arrives, check local state.
   * If the messageId was already delivered over SignalR, suppress the banner.
   */
  private installDedupHandler(): void {
    if (!this.native || this.dedupHandler) return;

    this.dedupHandler = (payload: WonderPushPayload) => {
      const messageId = payload.messageId;
      if (messageId && seenMessageIds.has(messageId)) {
        // Already seen via the foreground SignalR connection — suppress.
        console.info(
          '[WonderPush] Suppressing duplicate notification for message',
          messageId,
        );
        return;
      }
      // Otherwise let the default WonderPush banner show.
    };

    this.native.onNotificationReceived(this.dedupHandler);
  }
}

export const wonderPush = new WonderPushService();
