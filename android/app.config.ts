import type { ExpoConfig, ConfigContext } from '@expo/config';

/**
 * Expo config for the VibeZen Android app.
 *
 * A custom development build is required (not Expo Go) because the app depends
 * on custom native SDKs: `react-native-webview`, `react-native-wonderpush`,
 * and `@microsoft/signalr` over WebSockets.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'VibeZen',
  slug: 'vibezen',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'vibezen',
  userInterfaceStyle: 'automatic',
  // @ts-expect-error — newArchEnabled is valid at runtime but not in the
  // installed @expo/config type version.
  newArchEnabled: true,
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0b1f3a',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.vibezen.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0b1f3a',
    },
    package: 'com.vibezen.app',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: [],
  extra: {
    eas: {
      projectId: "5c4c0907-be67-446a-a7e3-6a335e2d2b36"
    },
    // Backend base URL. Override via app.config extra or .env for EAS.
    apiUrl: process.env.VIBEZEN_API_URL ?? 'http://10.0.2.2:5000',
    webAppUrl: process.env.VIBEZEN_WEB_URL ?? 'http://10.0.2.2:4200',
    // WonderPush credentials (EU GDPR-compliant push provider).
    // The react-native-wonderpush package ships no Expo config plugin, so
    // credentials are passed at runtime via WonderPushService.init() rather
    // than through the plugins array. Replace with real keys before building.
    WONDERPUSH_CLIENT_ID: process.env.WONDERPUSH_CLIENT_ID ?? 'YOUR_CLIENT_ID',
    WONDERPUSH_CLIENT_SECRET:
      process.env.WONDERPUSH_CLIENT_SECRET ?? 'YOUR_CLIENT_SECRET',
  },
});
