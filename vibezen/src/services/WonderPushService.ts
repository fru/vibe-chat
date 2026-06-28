import Constants from 'expo-constants';

/**
 * WonderPush integration (EU GDPR-compliant push provider).
 *
 * The native module is only available in a custom development build
 * (not Expo Go). When the module is absent (e.g. on simulator or Expo Go),
 * every method degrades to a no-op so the rest of the app keeps working.
 *
 * Geolocation is explicitly disabled so no location permission is ever
 * requested.
 */
interface WonderPushNative {
  initialize(clientId: string, clientSecret: string): Promise<void>;
  setUserId(userId: string): Promise<void>;
  disableGeolocation(): Promise<void>;
  subscribeToNotifications(fallbackToSettings?: boolean): Promise<void>;
  setDelegate(delegate: {
    onNotificationReceived?: (notification: unknown) => void;
    onNotificationOpened?: (notification: unknown, buttonIndex?: number) => void;
  } | null): void;
}

class WonderPushService {
  private native: WonderPushNative | null = null;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;
    const clientId = extra.wonderpushClientId!;
    const clientSecret = extra.wonderpushClientSecret!;

    console.log('[WonderPush] init() starting', {
      hasClientId: !!clientId && clientId !== 'YOUR_CLIENT_ID',
      hasClientSecret:
        !!clientSecret && clientSecret !== 'YOUR_CLIENT_SECRET',
    });

    try {
      // Lazy require so the bundler does not hard-fail when the native module
      // is absent (Expo Go / simulator).
      const mod = require('react-native-wonderpush');
      this.native = (mod.default ?? mod) as WonderPushNative;
      console.log('[WonderPush] native module loaded');
      await this.native.initialize(clientId, clientSecret);
      console.log('[WonderPush] initialized');
      // Explicitly disable geolocation — no location permission is requested.
      await this.native.disableGeolocation();
      console.log('[WonderPush] geolocation disabled');
      // Request the push notification permission (Android 13+ POST_NOTIFICATIONS
      // / iOS notification authorization). initialize() alone does not prompt.
      await this.native.subscribeToNotifications();
      console.log('[WonderPush] subscribeToNotifications done');
      this.initialized = true;
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
}

export const wonderPush = new WonderPushService();
