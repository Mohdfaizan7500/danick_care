/**
 * @format
 */
import 'react-native-gesture-handler';
import { AppRegistry, Platform } from 'react-native';
import notifee, { EventType, AndroidImportance } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import App from './src2/App';
import { name as appName } from './app.json';

// Handle background messages
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background message received:', remoteMessage);
  
  const notification = remoteMessage.notification || {};
  const data = remoteMessage.data || {};
  
  // Extract deep link from title/body
  let deepLink = null;
  const title = notification.title || '';
  const body = notification.body || '';
  
  const linkMatch = (title + body).match(/partner:\/\/[^\s]+/);
  if (linkMatch) {
    deepLink = linkMatch[0];
  }
  
  // Prepare data
  const notificationData = {};
  if (deepLink) notificationData.deepLink = deepLink;
  if (data.productId) notificationData.productId = data.productId;
  if (data.screen) notificationData.screen = data.screen;
  notificationData.timestamp = Date.now().toString();
  
  try {
    // Simple notification object for background
    const notificationObj = {
      title: title || 'New Notification',
      body: body || 'You have a new message',
      data: notificationData,
      android: {
        channelId: 'default',
        pressAction: {
          id: 'default',
        },
        smallIcon: 'ic_launcher',
        importance: AndroidImportance.HIGH,
        autoCancel: true,
      },
    };
    
    // Add iOS support
    if (Platform.OS === 'ios') {
      notificationObj.ios = {
        sound: 'default',
      };
    }
    
    await notifee.displayNotification(notificationObj);
    console.log('Background notification displayed');
  } catch (error) {
    console.error('Error displaying background notification:', error);
  }
});

// Handle background notification press
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    console.log('Background notification pressed:', detail);
    const notification = detail.notification;
    const deepLink = notification?.data?.deepLink;
    
    if (deepLink) {
      console.log('Deep link from background press:', deepLink);
      // The deep link will be handled when the app opens
      // Store it for when the app initializes
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('pendingDeepLink', deepLink);
      } catch (error) {
        console.error('Error storing pending deep link:', error);
      }
    }
  }
});

AppRegistry.registerComponent(appName, () => App);