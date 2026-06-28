import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  type DrawerNavigationProp,
} from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Badge,
  Divider,
  Icon,
  List,
  Text,
  TouchableRipple,
} from 'react-native-paper';

import { useRoomCount } from '@/hooks/useRoomCount';
import type { DrawerParamList, DrawerRouteName } from '@/navigation/types';

/**
 * Drawer content housing the 10+ secondary QA content menu items using native
 * accordions (`react-native-paper` `<List.Accordion>`), per
 * `plans/5-android-app.md` §2.
 *
 * The structure mirrors the Angular sidebar in `frontend/src/app/app.html`:
 *   - Nachrichten (chat menu item with unread badge)
 *   - Filter (expandable group)
 *       - Zimmer
 *       - Arbeitsablauf
 */
interface MenuItem {
  label: string;
  route: DrawerRouteName;
  icon: string;
  room?: string;
}

const PRIMARY_ITEMS: MenuItem[] = [
  { label: 'Dashboard', route: 'Home', icon: 'view-dashboard' },
  { label: 'Nachrichten', route: 'Messages', icon: 'message', room: 'common' },
  { label: 'Benachrichtigungen', route: 'Notifications', icon: 'bell' },
];

const FILTER_ITEMS: MenuItem[] = [
  { label: 'Zimmer', route: 'Rooms', icon: 'door' },
  { label: 'Arbeitsablauf', route: 'Workflow', icon: 'file-tree' },
];

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const navigation =
    useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const [filterExpanded, setFilterExpanded] = useState(false);

  const navigateTo = (route: DrawerRouteName) => {
    navigation.navigate(route);
    props.navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.title}>
          VibeZen
        </Text>
        <Text variant="labelSmall" style={styles.subtitle}>
          QA & Chat
        </Text>
      </View>

      <Divider />

      <View style={styles.section}>
        {PRIMARY_ITEMS.map((item) => (
          <DrawerChatItem
            key={item.route}
            item={item}
            onPress={() => navigateTo(item.route)}
          />
        ))}
      </View>

      <Divider />

      <View style={styles.section}>
        <List.Accordion
          title="Filter"
          left={(props) => <List.Icon {...props} icon="filter-variant" />}
          expanded={filterExpanded}
          onPress={() => setFilterExpanded((v) => !v)}
          theme={{ colors: { onSurface: '#0b1f3a' } }}
        >
          {FILTER_ITEMS.map((item) => (
            <List.Item
              key={item.route}
              title={item.label}
              left={(props) => <List.Icon {...props} icon={item.icon} />}
              onPress={() => navigateTo(item.route)}
              style={styles.subItem}
              titleStyle={styles.subItemTitle}
            />
          ))}
        </List.Accordion>
      </View>
    </DrawerContentScrollView>
  );
}

/** A drawer item that optionally shows a live unread badge. */
function DrawerChatItem({
  item,
  onPress,
}: {
  item: MenuItem;
  onPress: () => void;
}) {
  const count = item.room ? useRoomCount(item.room) : 0;

  return (
    <TouchableRipple onPress={onPress}>
      <View style={styles.itemRow}>
        <Icon source={item.icon} size={24} color="#0b1f3a" />
        <Text variant="bodyLarge" style={styles.itemLabel}>
          {item.label}
        </Text>
        {item.room && count > 0 ? (
          <Badge style={styles.badge}>{count}</Badge>
        ) : null}
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 20,
    backgroundColor: '#0b1f3a',
  },
  title: {
    color: '#ffffff',
    fontWeight: '700',
  },
  subtitle: {
    color: '#9fb3d1',
    marginTop: 4,
  },
  section: {
    paddingVertical: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 16,
  },
  itemLabel: {
    flex: 1,
    color: '#0b1f3a',
  },
  badge: {
    backgroundColor: '#e53935',
  },
  subItem: {
    paddingLeft: 56,
  },
  subItemTitle: {
    color: '#0b1f3a',
  },
});
