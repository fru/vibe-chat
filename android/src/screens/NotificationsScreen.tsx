import { StyleSheet, View } from 'react-native';
import { Button, List, Text } from 'react-native-paper';

import { useRoomCount } from '@/hooks/useRoomCount';
import { useNavigation } from '@react-navigation/native';
import { authService } from '@/services/AuthService';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { DrawerParamList } from '@/navigation/types';

/**
 * Notifications / Profile tab.
 *
 * Shows a live summary of unread counts per room (driven by the same SignalR
 * `MessageCounts` events as the drawer badges) and a profile section with the
 * current user and a native logout button.
 */
export function NotificationsScreen() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const commonCount = useRoomCount('common');
  const session = authService.current;

  const handleLogout = () => {
    void authService.logout();
  };

  return (
    <View style={styles.container}>
      <List.Section>
        <List.Subheader>Ungelesene Nachrichten</List.Subheader>
        <List.Item
          title="Allgemein"
          description={commonCount > 0 ? `${commonCount} neu` : 'Alles gelesen'}
          left={(props) => <List.Icon {...props} icon="message" />}
          onPress={() =>
            navigation.navigate('Messages', { room: 'common' })
          }
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Profil</List.Subheader>
        <List.Item
          title="Angemeldet als"
          description={session?.userId ?? '—'}
          left={(props) => <List.Icon {...props} icon="account" />}
        />
        <View style={styles.logoutRow}>
          <Button mode="outlined" onPress={handleLogout} icon="logout">
            Abmelden
          </Button>
        </View>
      </List.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  logoutRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
