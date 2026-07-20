// src/navigation/hooks/useDeepLinking.js
import { useEffect } from 'react';
import { Linking, AppState } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { buildDeepLinkFromNotificationData } from '../../utils/deepLinkBuilder';

export function useDeepLinking(listener) {
  useEffect(() => {

    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      listener(url);
    });

    const unsubscribeNotification = messaging().onNotificationOpenedApp(remoteMessage => {
      const notificationScreen = remoteMessage?.data?.screen;
      const notificationTitle = remoteMessage?.notification?.title;
      const screenToNavigate = notificationScreen || notificationTitle;


      const url = buildDeepLinkFromNotificationData(screenToNavigate);
      if (url) {
        Linking.openURL(url).catch(err => {
        });
        listener(url);
      }
    });

    const appStateSubscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
      }
    });

    return () => {
      linkingSubscription.remove();
      unsubscribeNotification();
      appStateSubscription.remove();
    };
  }, [listener]);
}
