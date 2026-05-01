// src/navigation/hooks/useDeepLinking.js
import { useEffect } from 'react';
import { Linking, AppState } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { buildDeepLinkFromNotificationData } from '../../utils/deepLinkBuilder';

export function useDeepLinking(listener) {
  useEffect(() => {
    console.log('🔗 Setting up deep link subscribers...');

    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      console.log('🔗 Deep link received:', url);
      listener(url);
    });

    const unsubscribeNotification = messaging().onNotificationOpenedApp(remoteMessage => {
      const notificationScreen = remoteMessage?.data?.screen;
      const notificationTitle = remoteMessage?.notification?.title;
      const screenToNavigate = notificationScreen || notificationTitle;

      console.log('📱 Notification opened from background, screen:', screenToNavigate);

      const url = buildDeepLinkFromNotificationData(screenToNavigate);
      if (url) {
        console.log('🔗 Navigating via notification title:', url);
        Linking.openURL(url).catch(err => {
          console.error('❌ Error opening URL from background:', err);
        });
        listener(url);
      }
    });

    const appStateSubscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        console.log('📱 App became active, checking for pending deep links...');
      }
    });

    return () => {
      console.log('🔗 Cleaning up deep link subscribers');
      linkingSubscription.remove();
      unsubscribeNotification();
      appStateSubscription.remove();
    };
  }, [listener]);
}