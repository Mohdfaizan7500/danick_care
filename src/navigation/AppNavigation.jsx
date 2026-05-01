// src/navigation/AppNavigation.js
import React, { forwardRef, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Linking,
  AppState,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import { useAuth } from '../context/AuthContext';
import AppStack from './AppStack/AppStack';
import AuthStack from './AuthStack/AuthStack';
import NotificationHandler from './NotificationHandler';
import { buildDeepLinkFromNotificationData } from './utils/deepLinkBuilder';

// Linking configuration
const linkingConfig = {
  screens: {
    Login: 'login',
    BottomTabs: {
      path: '',
      screens: {
        Home: 'home',
        Orders: 'orders',
        Scan: 'scan',
        Parts: 'partstab',
        Profile: 'profile',
      },
    },
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
};

const LoadingScreen = () => {
  return (
    <View style={styles.loadingContainer}>
      <Image
        source={require('../assets/images/AppIcon.png')}
        style={{ width: 100, height: 100 }}
        resizeMode="contain"
      />
    </View>
  );
};

const AppNavigation = forwardRef((props, ref) => {
  const { accessToken, isLoading } = useAuth();
  const navigationRef = useRef();

  React.useImperativeHandle(ref, () => navigationRef.current);

  const linking = {
    prefixes: ['partner://app', 'partner://'],
    config: linkingConfig,

    async getInitialURL() {
      try {
        console.log('🔗 Getting initial URL...');

        // Check for deep link from app open
        const url = await Linking.getInitialURL();
        if (typeof url === 'string' && url) {
          console.log('✅ Initial URL found:', url);
          return url;
        }

        // Check for notification that opened the app from quit state
        const message = await messaging().getInitialNotification();
        console.log('Initial notification message:', message);

        if (message) {
          const notificationScreen = message?.data?.screen;
          const notificationTitle = message?.notification?.title;
          const screenToNavigate = notificationScreen || notificationTitle;

          console.log('📱 Initial notification screen:', screenToNavigate);

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
    return <LoadingScreen />;
  }

  return (
    <>
      <NotificationHandler />
      <NavigationContainer ref={navigationRef} linking={linking}>
        {accessToken ? <AppStack /> : <AuthStack />}
      </NavigationContainer>
    </>
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