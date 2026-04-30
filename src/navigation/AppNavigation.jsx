// src/navigation/AppNavigation.js
import React, { forwardRef, useEffect, useRef } from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  View,
  Platform,
  AppState,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AppStack from './AppStack/AppStack';
import AuthStack from './AuthStack/AuthStack';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

// Define NAVIGATION_IDS based on notification titles
const NAVIGATION_IDS = ['home', 'spare', 'orders', 'complaints', 'amc', 'bucket', 'notifications', 'assign'];

function buildDeepLinkFromNotificationData(title) {
  if (!title) return null;

  const navigationId = title.toLowerCase();
  console.log('Building deep link for navigationId:', navigationId);

  if (!NAVIGATION_IDS.includes(navigationId)) {
    console.warn('Unverified navigationId:', navigationId);
    return null;
  }

  switch (navigationId) {
    case 'home':
      return 'partner://app/home';
    case 'spare':
      return 'partner://app/spare';
    case 'orders':
      return 'partner://app/orders';  // This will navigate to Orders tab
    case 'complaints':
      return 'partner://app/complaints?tab=all';
    case 'assign':
      return 'partner://app/complaints?tab=assign';
    case 'amc':
      return 'partner://app/amc';
    case 'bucket':
      return 'partner://app/bucket';
    case 'notifications':
      return 'partner://app/notifications';
    default:
      console.warn('Missing valid navigationId');
      return null;
  }
}

async function createNotificationChannels() {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      vibration: true,
      importance: AndroidImportance.HIGH,
      sound: 'notification',
    });

    await notifee.createChannel({
      id: 'orders',
      name: 'Orders Channel',
      vibration: true,
      importance: AndroidImportance.HIGH,
      sound: 'notification',
    });

    await notifee.createChannel({
      id: 'complaints',
      name: 'Complaints Channel',
      vibration: true,
      importance: AndroidImportance.HIGH,
      sound: 'notification',
    });

    await notifee.createChannel({
      id: 'amc',
      name: 'AMC Channel',
      vibration: true,
      importance: AndroidImportance.HIGH,
      sound: 'notification',
    });

    console.log('✅ Notification channels created');
  }
}

const AppNavigation = forwardRef((props, ref) => {
  const { accessToken, isLoading } = useAuth();
  const navigationRef = useRef();
  const isListenerSetup = useRef(false);

  React.useImperativeHandle(ref, () => navigationRef.current);

  useEffect(() => {
    if (isListenerSetup.current) {
      console.log('⚠️ Notification listeners already setup, skipping...');
      return;
    }

    isListenerSetup.current = true;
    console.log('🔧 Setting up notification listeners (once)...');

    let unsubscribeForeground = null;
    let unsubscribeNotifeeEvent = null;

    const setupNotifications = async () => {
      try {
        await createNotificationChannels();

        unsubscribeForeground = messaging().onMessage(async remoteMessage => {
          console.log('📱 Foreground message received:', remoteMessage);

          const notification = remoteMessage.notification || {};
          const notificationTitle = notification.title || '';
          const notificationBody = notification.body || '';
          const notificationData = remoteMessage.data || {};
          const notificationScreen = notificationData?.screen || notificationTitle;

          console.log('screen to navigate:', notificationScreen);

          let channelId = 'default';
          const title = notificationTitle.toLowerCase();
          if (title === 'orders') channelId = 'orders';
          else if (title === 'complaints' || title === 'assign') channelId = 'complaints';
          else if (title === 'amc') channelId = 'amc';

          await notifee.displayNotification({
            title: notificationTitle || 'Partner App',
            body: notificationBody || 'You have a new notification',
            data: { ...notificationData, title: notificationTitle, screen: notificationScreen },
            android: {
              channelId: channelId,
              importance: AndroidImportance.HIGH,
              pressAction: { id: 'default' },
              smallIcon: 'ic_launcher',
              sound: 'notification',
              autoCancel: true,
            },
            ios: {
              sound: 'notification',
              foregroundPresentationOptions: {
                badge: true,
                sound: true,
                banner: true,
                list: true,
              },
            },
          });
        });

        unsubscribeNotifeeEvent = notifee.onForegroundEvent(({ type, detail }) => {
          if (type === EventType.PRESS && detail.notification) {
            const notificationTitle = detail.notification.data?.screen || detail.notification.title;
            console.log('📱 Notification clicked in foreground, title:', notificationTitle);

            const url = buildDeepLinkFromNotificationData(notificationTitle);
            console.log('🔗 Built URL from title:', url);

            if (url) {
              console.log('🚀 Opening URL via Linking:', url);
              Linking.openURL(url).catch(err => {
                console.error('❌ Error opening URL:', err);
              });
            }
          }
        });
      } catch (error) {
        console.error('❌ Error setting up notifications:', error);
      }
    };

    setupNotifications();

    return () => {
      console.log('🧹 Cleaning up notification listeners...');
      if (unsubscribeForeground) unsubscribeForeground();
      if (unsubscribeNotifeeEvent) unsubscribeNotifeeEvent();
      isListenerSetup.current = false;
    };
  }, []);

  const linking = {
    prefixes: ['partner://app', 'partner://'],
    config: {
      screens: {
        Login: 'login',
        // IMPORTANT: Define the path for BottomTabs with nested screens
        BottomTabs: {
          path: '',
          screens: {
            Home: 'home',
            Orders: 'orders',  // This handles partner://app/orders
            Scan: 'scan',
            Parts: 'partstab',
            Profile: 'profile',
          },
        },
        // Individual screens that are not in BottomTabs
        ComplaintsTopNavigation: {
          path: 'complaints',
          parse: {
            tab: (tab) => tab || 'all',
          },
        },
        SparePartScreen: 'spare',
        PartDetails: 'part/:partId',
        ComplaintDetail: 'complaint/:complaintId',
        MyComplaints: 'mycomplaints',
        Bucket: 'bucket',
        BucketpartDetails: 'bucketpart/:partId',
        AddPart: 'addpart',
        AMC: 'amc',
        AMCDetails: 'amcdetails/:amcId',
        AMCList: 'amclist',
        MyAmc: 'myamc',
        CompleteAMCDetails: 'completeamc/:amcId',
        PreBooking: 'prebooking',
        PayOut: 'payout',
        NotificationTopNavigation: 'notifications',
        Password: 'password',
        ReplaceParts: 'replaceparts',
        TermsConditions: 'terms',
        Support: 'support',
        Billing: 'billing/:billId',
        AddPartBilling: 'addpartbilling',
        Remarkscreen: 'remark/:remarkId',
        ProductDetails: 'product/:productId',
        QRCodes: 'qrcodes',
        QRCodeDetails: 'qrcode/:qrId',
        Services: 'services',
        ProfileDetails: 'profiledetails',
      },
    },

    async getInitialURL() {
      try {
        console.log('🔗 Getting initial URL...');

        const url = await Linking.getInitialURL();
        if (typeof url === 'string' && url) {
          console.log('✅ Initial URL found:', url);
          return url;
        }

        const message = await messaging().getInitialNotification();
        console.log('Initial notification message:', message);

        if (message) {
          // First try to get screen from data
          let notificationScreen = message?.data?.screen;
          const notificationTitle = message?.notification?.title;
          
          // Use screen from data, fallback to title
          const screenToNavigate = notificationScreen || notificationTitle;

          console.log('📱 Initial notification screen:', screenToNavigate);
          console.log('📱 Notification title:', notificationTitle);
          console.log('📱 Notification data.screen:', notificationScreen);

          if (screenToNavigate) {
            const deeplinkURL = buildDeepLinkFromNotificationData(screenToNavigate);
            if (deeplinkURL) {
              console.log('🔗 Built deeplink from notification:', deeplinkURL);
              return deeplinkURL;
            }
          }
        }

        console.log('❌ No initial URL or notification found');
        return null;
      } catch (error) {
        console.error('❌ Error getting initial URL:', error);
        return null;
      }
    },

    subscribe(listener) {
      console.log('🔗 Setting up deep link subscribers...');

      const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
        console.log('🔗 Deep link received:', url);
        listener(url);
      });

      const unsubscribeNotification = messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Background notification opened:', remoteMessage);
        
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
    },
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('../assets/images/AppIcon.png')}
          style={{ width: 100, height: 100 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      {accessToken ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
});

AppNavigation.displayName = 'AppNavigation';

export default AppNavigation;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});