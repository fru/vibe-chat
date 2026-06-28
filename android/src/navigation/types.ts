import type {
  DrawerNavigationOptions,
  DrawerNavigationProp,
} from '@react-navigation/drawer';
import type {
  BottomTabNavigationOptions,
  BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/native';

/**
 * Centralized navigation param list.
 *
 * Mirrors the web routes in `frontend/src/app/app.routes.ts`:
 *   /messages/:room  -> Messages screen with a `room` param
 *   /filter/rooms    -> Rooms screen
 *   /filter/workflow -> Workflow screen
 */
export type DrawerParamList = {
  Home: undefined;
  Messages: { room: string } | undefined;
  Notifications: undefined;
  Rooms: undefined;
  Workflow: undefined;
};

export type DrawerRouteName = keyof DrawerParamList;

export type DrawerNavProp = DrawerNavigationProp<DrawerParamList>;
export type DrawerRouteProp = RouteProp<DrawerParamList, keyof DrawerParamList>;
export type DrawerOptions = DrawerNavigationOptions;

export type TabNavProp = BottomTabNavigationProp<DrawerParamList>;
export type TabOptions = BottomTabNavigationOptions;
