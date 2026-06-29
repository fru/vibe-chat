import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Expo FCM push messaging integration (expo-notifications).
 *
 * The native module is only available in a custom development build
 * (not Expo Go). When the module is absent (e.g. on simulator or Expo Go),
 * every method degrades to a no-op so the rest of the app keeps working.
 *
 * Uses Expo's default FCM push messaging — no third-party push provider.
 */

// Configure how notifications are presented when the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    console.log('[Notifications] init() starting');

    try {
      // Request the push notification permission (Android 13+
      // POST_NOTIFICATIONS / iOS notification authorization).
      const granted = await this.requestPermissions();
      console.log('[Notifications] permission granted:', granted);

      if (!granted) {
        console.warn(
          '[Notifications] permission not granted; push notifications disabled.',
        );
        return;
      }

      // Obtain the Expo push token (FCM on Android, APNs on iOS).
      const token = await this.getPushToken();
      console.log('[Notifications] push token:', token);

      // Wire up notification listeners.
      this.setupListeners();

      this.initialized = true;
      console.log('[Notifications] initialized');
    } catch (err) {
      // Native module unavailable — push notifications disabled, app continues.
      console.warn(
        '[Notifications] Native module unavailable; push notifications disabled.',
        err,
      );
    }
  }

  /**
   * Request notification permissions. Returns true if granted.
   */
  private async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  /**
   * Obtain the Expo push token. On Android this requires an FCM project
   * configured via the `expo.googleServicesFile` (google-services.json) and
   * the `projectId` (Expo account / EAS) for `getExpoPushTokenAsync`.
   */
  private async getPushToken(): Promise<string | null> {
    try {
      const projectId = process.env.EXPO_PROJECT_ID;
      const tokenResponse = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined,
      );
      return tokenResponse.data;
    } catch (err) {
      console.warn('[Notifications] failed to get Expo push token', err);
      return null;
    }
  }

  /**
   * Set up foreground and response listeners. Kept as instance fields so
   * they can be torn down if needed.
   */
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  private setupListeners(): void {
    // Fired when a notification is received while the app is foregrounded.
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[Notifications] received', notification);
      },
    );

    // Fired when the user taps/opens a notification.
    this.responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('[Notifications] opened', response);
      });
  }

  /**
   * Tear down listeners (useful for tests / hot reload).
   */
  teardown(): void {
    this.notificationListener?.remove();
    this.responseListener?.remove();
    this.notificationListener = null;
    this.responseListener = null;
    this.initialized = false;
  }
}

export const notifications = new NotificationService();

// Re-export the platform for callers that need Android channel setup.
export { Platform };
