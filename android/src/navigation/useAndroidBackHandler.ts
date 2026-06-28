import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';

import type { DrawerParamList } from './types';

/**
 * Hardware back-button logic from `plans/5-android-app.md` §2:
 *  - If the Drawer is open, Back closes it.
 *  - If in the Messages tab, Back routes to the Home tab.
 *
 * Mounted once inside the root navigator.
 */
export function useAndroidBackHandler() {
  const navigation =
    useNavigation<DrawerNavigationProp<DrawerParamList>>();

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        const state = navigation.getState();
        const isDrawerOpen = state.history?.some(
          (item) => item.type === 'drawer',
        );

        if (isDrawerOpen) {
          navigation.closeDrawer();
          return true;
        }

        // If we are on the Messages tab, route back to Home.
        const routes = navigation.getState().routes;
        const currentRouteName = routes[routes.length - 1]?.name;
        if (currentRouteName === 'Messages') {
          navigation.navigate('Home');
          return true;
        }

        // Let the default behavior (exit app) happen.
        return false;
      },
    );

    return () => subscription.remove();
  }, [navigation]);
}
