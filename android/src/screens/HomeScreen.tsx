import { useNavigation } from '@react-navigation/native';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { config } from '@/config/env';
import { authService } from '@/services/AuthService';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { DrawerParamList } from '@/navigation/types';

/**
 * Home / Dashboard tab.
 *
 * Loads the Angular web app inside a WebView. Per the updated plan, login is
 * native — the WebView never hosts the login flow. Instead the authenticated
 * credentials are handed to the WebView so the web session shares identical
 * auth state:
 *   - The JWT is injected as `window.__VIBEZEN_TOKEN__` and as an
 *     `Authorization` header on every WebView request.
 *   - The user id is appended to the URL so the Angular `UserService` picks
 *     it up from the `?user=` query param.
 *
 * The bidirectional bridge from `plans/5-android-app.md` §4 is still wired so
 * actions inside the WebView (e.g. clicking a user profile) can trigger native
 * navigation events.
 */
interface BridgeMessage {
  type: 'navigate' | 'openChat' | 'openRoom' | string;
  route?: string;
  room?: string;
  [key: string]: unknown;
}

export function HomeScreen() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const webRef = useRef<WebView>(null);

  const session = authService.current;
  const token = session?.token ?? '';
  const userId = session?.userId ?? '';

  const webAppUrl = `${config.webAppUrl}/?user=${encodeURIComponent(userId)}`;

  // Inject the token into the web app's global scope before the page loads,
  // and stamp it onto fetch/XHR so the web session is authenticated.
  const injectedJavaScript = `
    (function() {
      window.__VIBEZEN_TOKEN__ = ${JSON.stringify(token)};
      window.__VIBEZEN_USER__ = ${JSON.stringify(userId)};
      var originalFetch = window.fetch;
      window.fetch = function(input, init) {
        init = init || {};
        init.headers = init.headers || {};
        if (typeof init.headers.set === 'function') {
          init.headers.set('Authorization', 'Bearer ' + window.__VIBEZEN_TOKEN__);
        } else {
          init.headers['Authorization'] = 'Bearer ' + window.__VIBEZEN_TOKEN__;
        }
        return originalFetch.call(this, input, init);
      };
      var XHR = window.XMLHttpRequest;
      var originalOpen = XHR.prototype.open;
      XHR.prototype.open = function() {
        var xhr = this;
        originalOpen.apply(xhr, arguments);
        xhr.setRequestHeader('Authorization', 'Bearer ' + window.__VIBEZEN_TOKEN__);
      };
      true;
    })();
  `;

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as BridgeMessage;

      switch (data.type) {
        case 'openChat':
        case 'navigate':
          if (data.room) {
            navigation.navigate('Messages', { room: data.room });
          } else {
            navigation.navigate('Messages');
          }
          break;
        case 'openRoom':
          navigation.navigate('Rooms');
          break;
        default:
          console.info('[WebView bridge] unhandled message', data);
      }
    } catch {
      // ignore non-JSON messages
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        source={{
          uri: webAppUrl,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1f3a',
  },
  webview: {
    flex: 1,
  },
});
