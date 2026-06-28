import Constants from 'expo-constants';

/**
 * Centralized runtime configuration.
 *
 * Values are injected from `app.config.ts` `extra` block, which EAS populates
 * from environment variables at build time. This keeps secrets out of the
 * bundle and lets us swap dev/staging/prod endpoints per build profile.
 */
export interface AppConfig {
  /** Base URL of the .NET backend (no trailing slash). */
  apiUrl: string;
  /** Base URL of the Angular web app loaded inside the WebView. */
  webAppUrl: string;
  /** SignalR hub endpoint, derived from apiUrl. */
  hubUrl: string;
  /** WonderPush credentials (EU GDPR-compliant push provider). */
  wonderpush: {
    clientId: string;
    clientSecret: string;
  };
}

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

function resolveUrl(key: string, fallback: string): string {
  const value = extra[key] ?? fallback;
  return value.replace(/\/+$/, '');
}

export const config: AppConfig = {
  apiUrl: resolveUrl('apiUrl', 'http://10.0.2.2:5000'),
  webAppUrl: resolveUrl('webAppUrl', 'http://10.0.2.2:4200'),
  hubUrl: `${resolveUrl('apiUrl', 'http://10.0.2.2:5000')}/api/chathub`,
  wonderpush: {
    clientId: extra.WONDERPUSH_CLIENT_ID ?? 'YOUR_CLIENT_ID',
    clientSecret: extra.WONDERPUSH_CLIENT_SECRET ?? 'YOUR_CLIENT_SECRET',
  },
};
