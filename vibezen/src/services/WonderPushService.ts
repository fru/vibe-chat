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
  disableGeolocation(): Promise<void>;
  subscribeToNotifications(fallbackToSettings?: boolean): Promise<void>;
  isSubscribedToNotifications(): Promise<boolean>;
  getInstallationId(): Promise<string>;
  getDeviceId(): Promise<string>;
  getPushToken(): Promise<string>;
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

      // Diagnostic: report the real registration state so we can tell whether
      // the device actually reached WonderPush servers (the dashboard is the
      // source of truth — the JS calls above resolve even when registration
      // silently fails, e.g. missing FCM configuration).
      try {
        const subscribed =
          await this.native.isSubscribedToNotifications();
        const installationId = await this.native.getInstallationId();
        const deviceId = await this.native.getDeviceId();
        const pushToken = await this.native.getPushToken();
        console.log('[WonderPush] registration state', {
          subscribed,
          installationId,
          deviceId,
          pushToken,
        });
      } catch (diagErr) {
        console.warn(
          '[WonderPush] failed to read registration state',
          diagErr,
        );
      }

      this.initialized = true;
    } catch (err) {
      // Native module unavailable — push notifications disabled, app continues.
      console.warn(
        '[WonderPush] Native module unavailable; push notifications disabled.',
        err,
      );
    }
  }

}

export const wonderPush = new WonderPushService();
