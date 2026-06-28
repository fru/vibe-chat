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
  plugins: [
    [
      'react-native-wonderpush',
      {
        // Replace with real keys before building. See README.md.
        clientId: process.env.WONDERPUSH_CLIENT_ID ?? 'YOUR_CLIENT_ID',
        clientSecret:
          process.env.WONDERPUSH_CLIENT_SECRET ?? 'YOUR_CLIENT_SECRET',
      },
    ],
  ],
  extra: {
    eas: {
      projectId: 'vibezen',
    },
    // Backend base URL. Override via app.config extra or .env for EAS.
    apiUrl: process.env.VIBEZEN_API_URL ?? 'http://10.0.2.2:5000',
    webAppUrl: process.env.VIBEZEN_WEB_URL ?? 'http://10.0.2.2:4200',
  },
});
