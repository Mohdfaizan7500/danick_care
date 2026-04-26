import { Alert, Platform } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

const FCMHandler = ({ children }) => {
  const navigation = useNavigation();
  const navigationRef = useRef(navigation);

  // Update navigation ref when it changes
  useEffect(() => {
    navigationRef.current = navigation;
  }, [navigation]);

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
    }
  }

  const getToken = async () => {
    try {
      const token = await messaging().getToken();
      console.log("FCM Token:", token);
      // You can send this token to your backend here
    } catch (error) {
      console.log("Error getting FCM token:", error);
    }
  }

  // Create notification channels for Android
  async function createNotificationChannels() {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
        vibration: true,
        sound: 'default',
        lights: true,
        lightColor: '#FF0000',
      });

      await notifee.createChannel({
        id: 'important',
        name: 'Important Notifications',
        importance: AndroidImportance.HIGH,
        vibration: true,
        sound: 'default',
      });

      await notifee.createChannel({
        id: 'amc',
        name: 'AMC Notifications',
        importance: AndroidImportance.HIGH,
        vibration: true,
        sound: 'default',
      });
    }
  }

  // Display notification using Notifee
  async function displayNotification(remoteMessage) {
    try {
      const notification = remoteMessage.notification;
      const data = remoteMessage.data || {};
      
      // Determine channel based on notification type
      let channelId = 'default';
      if (data.type === 'amc' || data.screen === 'AMCList') {
        channelId = 'amc';
      } else if (data.priority === 'high') {
        channelId = 'important';
      }

      // Show notification
      await notifee.displayNotification({
        title: notification?.title || 'New Notification',
        body: notification?.body || 'You have a new message',
        data: data,
        android: {
          channelId,
          pressAction: {
            id: 'default',
          },
          smallIcon: 'ic_launcher', // Make sure this icon exists in your android resources
          importance: AndroidImportance.HIGH,
          autoCancel: true,
          actions: [
            {
              title: 'View',
              pressAction: { id: 'view' },
            },
          ],
        },
        ios: {
          sound: 'default',
          foregroundPresentationOptions: {
            badge: true,
            sound: true,
            banner: true,
            list: true,
          },
        },
      });
      
      console.log('Notification displayed successfully');
    } catch (error) {
      console.error('Error displaying notification:', error);
    }
  }

  // Handle notification press
  async function handleNotificationPress(remoteMessage) {
    const data = remoteMessage.data || {};
    const screenName = data.screen || remoteMessage.notification?.title;
    
    console.log('Notification pressed:', { screenName, data });
    
    // Navigate based on notification data
    if (screenName === 'Product') {
      navigationRef.current?.navigate('Product', { productId: data.productId });
    } else if (screenName === 'Profile') {
      navigationRef.current?.navigate('Profile');
    } else if (screenName === 'ComplaintDetails') {
      navigationRef.current?.navigate('ComplaintDetails', { 
        complaintId: data.complaintId 
      });
    } else if (screenName === 'AMCList') {
      navigationRef.current?.navigate('AMCList');
    } else if (screenName === 'Billing') {
      navigationRef.current?.navigate('Billing', { 
        complaintId: data.complaintId 
      });
    } else if (screenName) {
      // Default navigation
      navigationRef.current?.navigate(screenName);
    }
  }

  useEffect(() => {
    const setupNotifications = async () => {
      await requestUserPermission();
      await getToken();
      await createNotificationChannels();
    };
    
    setupNotifications();

    // Handle foreground messages
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log("Foreground message received:", remoteMessage);
      
      // Display notification using Notifee
      await displayNotification(remoteMessage);
    });

    // Handle notification press when app is in foreground (Notifee event listener)
    const unsubscribeForegroundEvent = notifee.onForegroundEvent(async ({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log('User pressed notification in foreground:', detail);
        const notification = detail.notification;
        if (notification?.data) {
          await handleNotificationPress({ data: notification.data });
        }
      } else if (type === EventType.ACTION_PRESS) {
        console.log('User pressed action button:', detail);
        const pressActionId = detail.pressAction?.id;
        const notification = detail.notification;
        
        if (pressActionId === 'view' && notification?.data) {
          await handleNotificationPress({ data: notification.data });
        }
      }
    });

    // Handle notification open when app is in background
    const unsubscribeBackgroundOpen = messaging().onNotificationOpenedApp(async remoteMessage => {
      console.log("App opened from background by notification:", remoteMessage);
      await handleNotificationPress(remoteMessage);
    });

    // Handle notification open when app is quit
    messaging().getInitialNotification().then(async remoteMessage => {
      if (remoteMessage) {
        console.log("App opened from quit state by notification:", remoteMessage);
        // Use a delay to ensure navigation is ready
        setTimeout(async () => {
          await handleNotificationPress(remoteMessage);
        }, 1000);
      }
    });

    return () => {
      unsubscribeForeground();
      unsubscribeForegroundEvent();
      unsubscribeBackgroundOpen();
    };
  }, []);

  return children;
};

export default FCMHandler;