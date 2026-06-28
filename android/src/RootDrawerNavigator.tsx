import { createDrawerNavigator } from '@react-navigation/drawer';
import { Pressable } from 'react-native';
import { IconButton } from 'react-native-paper';

import { CustomDrawerContent } from './components/CustomDrawerContent';
import { HomeScreen } from './screens/HomeScreen';
import { MessagesScreen } from './screens/MessagesScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { RoomsScreen } from './screens/RoomsScreen';
import { WorkflowScreen } from './screens/WorkflowScreen';
import type { DrawerParamList } from './navigation/types';

const Drawer = createDrawerNavigator<DrawerParamList>();

/**
 * Root navigator: a Drawer whose main content is a Bottom Tab Navigator.
 *
 * Layout (from `plans/5-android-app.md` §2):
 *   DrawerNavigator
 *     ├── CustomDrawerContent (10+ secondary QA menu items, accordions)
 *     └── MainScreen -> BottomTabNavigator
 *          ├── Home / Dashboard (WebView)
 *          ├── Messages (native chat)
 *          └── Notifications / Profile
 *
 * The secondary QA pages (Rooms, Workflow) are registered as drawer routes so
 * they can be reached from the accordion menu without occupying a tab.
 */
export function RootDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerTintColor: '#ffffff',
        headerStyle: { backgroundColor: '#0b1f3a' },
        headerLeft: () => (
          <Pressable
            onPress={() => navigation.toggleDrawer()}
            style={{ paddingHorizontal: 8 }}
            accessibilityLabel="Toggle menu"
          >
            <IconButton icon="menu" iconColor="#ffffff" size={24} />
          </Pressable>
        ),
      })}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Dashboard' }}
      />
      <Drawer.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ title: 'Nachrichten' }}
      />
      <Drawer.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Benachrichtigungen' }}
      />
      <Drawer.Screen
        name="Rooms"
        component={RoomsScreen}
        options={{ title: 'Zimmer', drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen
        name="Workflow"
        component={WorkflowScreen}
        options={{
          title: 'Arbeitsablauf',
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer.Navigator>
  );
}
