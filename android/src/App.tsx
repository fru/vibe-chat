import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';

import { RootDrawerNavigator } from './RootDrawerNavigator';
import { LoginScreen } from './screens/LoginScreen';
import { authService, type AuthSession } from '@/services/AuthService';
import { userStore } from '@/services/UserStore';
import { signalR } from '@/services/SignalRService';
import { wonderPush } from '@/services/WonderPushService';
import { useAndroidBackHandler } from './navigation/useAndroidBackHandler';

/**
 * App root.
 *
 * Bootstrap order:
 *  1. Restore any persisted auth session (native login).
 *  2. Load the persisted user id.
 *  3. Initialize WonderPush (EU GDPR-compliant push).
 *  4. Connect the SignalR hub for the foreground layer.
 *
 * Login/logout is native: until a session exists we show the LoginScreen.
 * Once authenticated, the SignalR client and WebView both receive the
 * session credentials.
 */
export default function App() {
  useAndroidBackHandler();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;
    let unsubscribeUser: (() => void) | undefined;

    (async () => {
      await authService.init();
      await userStore.init();
      await wonderPush.init();

      // Stay in sync with login/logout.
      unsubscribeAuth = authService.subscribe((next) => {
        setSession(next);
        if (next) {
          // Keep the legacy user store in sync with the authenticated user.
          userStore.setUser(next.userId);
          wonderPush.setUserId(next.userId);
          signalR.connect(next.userId);
        } else {
          signalR.disconnect();
        }
      });

      // Reconnect the hub if the user id ever changes independently.
      unsubscribeUser = userStore.subscribe((next) => {
        if (authService.isAuthenticated) {
          signalR.connect(next);
        }
      });

      setReady(true);
    })();

    return () => {
      unsubscribeAuth?.();
      unsubscribeUser?.();
      signalR.disconnect();
    };
  }, []);

  if (!ready) {
    return null; // splash while bootstrapping
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            {session ? <RootDrawerNavigator /> : <LoginScreen />}
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
