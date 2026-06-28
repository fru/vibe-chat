import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { ActivityIndicator, Button, Text, TextInput } from 'react-native-paper';

import { authService } from '@/services/AuthService';

/**
 * Native login screen.
 *
 * Login/logout is handled natively per the updated plan — the WebView only
 * receives the resulting credentials, it never hosts the login flow.
 */
export function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill dev credentials so local testing is frictionless.
  useEffect(() => {
    setUsername('A');
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setError('Bitte Benutzername und Passwort eingeben.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authService.login(username.trim(), password);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Login fehlgeschlagen.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text variant="headlineSmall" style={styles.title}>
          VibeZen
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Anmelden
        </Text>

        <TextInput
          label="Benutzername"
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          label="Passwort"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
        />

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        {loading ? (
          <ActivityIndicator style={{ marginTop: 12 }} />
        ) : (
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
          >
            Anmelden
          </Button>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1f3a',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
    color: '#0b1f3a',
  },
  subtitle: {
    textAlign: 'center',
    color: '#5a6b85',
    marginBottom: 16,
  },
  input: {
    marginTop: 12,
  },
  button: {
    marginTop: 20,
    paddingVertical: 4,
  },
  error: {
    color: '#e53935',
    marginTop: 12,
    textAlign: 'center',
  },
});
