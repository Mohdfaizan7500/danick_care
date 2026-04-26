import notifee, {
  AndroidImportance,
  AndroidStyle,
  EventType,
} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { Linking, Platform } from 'react-native';

class NotificationService {
  constructor() {
    this.onNotificationOpenedListener = null;
    this.onMessageListener = null;
  }

  // Create notification channels (Android only)
  async createNotificationChannels() {
    if (Platform.OS === 'android') {
      try {
        await notifee.createChannel({
          id: 'default',
          name: 'Default Notifications',
          importance: AndroidImportance.HIGH,
          vibration: true,
          sound: 'default',
          lights: true,
          lightColor: '#007AFF',
        });

        await notifee.createChannel({
          id: 'deep_link',
          name: 'Deep Link Notifications',
          importance: AndroidImportance.HIGH,
          vibration: true,
          sound: 'default',
          lights: true,
          lightColor: '#28A745',
        });

        await notifee.createChannel({
          id: 'important',
          name: 'Important Notifications',
          importance: AndroidImportance.HIGH,
          vibration: true,
          sound: 'default',
        });
      } catch (error) {
        console.error('Error creating channels:', error);
      }
    }
  }

  // Request permissions
  async requestPermissions() {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('iOS notification permission granted');
        }
      } else if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const settings = await notifee.requestPermission();
          console.log('Android notification permission:', settings);
        }
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  }

  // Get FCM token
  async getFCMToken() {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  // Extract deep link from notification
  extractDeepLink(remoteMessage) {
    // First check data object
    const data = remoteMessage.data || {};
    if (data.deepLink) return data.deepLink;
    if (data.link) return data.link;
    
    // Then check notification title and body
    const notification = remoteMessage.notification || {};
    const title = notification.title || '';
    const body = notification.body || '';
    
    // Look for partner:// pattern
    const linkMatch = (title + body).match(/partner:\/\/[^\s]+/);
    if (linkMatch) return linkMatch[0];
    
    // Look for https://partner.com pattern
    const httpsMatch = (title + body).match(/https:\/\/partner\.com\/[^\s]+/);
    if (httpsMatch) return httpsMatch[0];
    
    return null;
  }

  // Display notification with deep link
  async displayNotification(remoteMessage, navigationRef) {
    try {
      const notification = remoteMessage.notification || {};
      const data = remoteMessage.data || {};
      
      // Extract deep link safely
      let deepLink = this.extractDeepLink(remoteMessage);
      
      // Use default values if notification is missing
      const title = notification.title || 'New Notification';
      const body = notification.body || 'You have a new message';
      
      // Determine channel based on whether it has a deep link
      const channelId = deepLink ? 'deep_link' : 'default';
      
      // Prepare notification data (ensure all values are strings)
      const notificationData = {};
      if (deepLink) notificationData.deepLink = deepLink;
      if (data.productId) notificationData.productId = String(data.productId);
      if (data.screen) notificationData.screen = String(data.screen);
      notificationData.timestamp = Date.now().toString();
      
      console.log('Displaying notification:', { title, body, deepLink });
      
      // Display notification
      await notifee.displayNotification({
        title: title,
        body: body,
        data: notificationData,
        android: {
          channelId,
          pressAction: {
            id: 'default',
          },
          smallIcon: 'ic_launcher',
          importance: AndroidImportance.HIGH,
          autoCancel: true,
          ...(deepLink && {
            actions: [
              {
                title: 'Open Link',
                pressAction: { id: 'open_link' },
              },
              {
                title: 'Dismiss',
                pressAction: { id: 'dismiss' },
              },
            ],
          }),
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
      
      console.log('Notification displayed successfully with deep link:', deepLink);
      
    } catch (error) {
      console.error('Error displaying notification:', error);
      // Fallback: Display simple notification without deep link
      try {
        await notifee.displayNotification({
          title: remoteMessage.notification?.title || 'New Notification',
          body: remoteMessage.notification?.body || 'You have a new message',
          android: {
            channelId: 'default',
            pressAction: { id: 'default' },
            smallIcon: 'ic_launcher',
          },
          ios: {
            sound: 'default',
          },
        });
      } catch (fallbackError) {
        console.error('Fallback notification also failed:', fallbackError);
      }
    }
  }

  // Handle deep link navigation
  async handleDeepLinkNavigation(deepLink, navigation) {
    if (!deepLink) {
      console.log('No deep link to navigate');
      return;
    }
    
    if (!navigation) {
      console.log('Navigation not available, opening with Linking');
      try {
        await Linking.openURL(deepLink);
      } catch (error) {
        console.error('Error opening deep link with Linking:', error);
      }
      return;
    }
    
    try {
      // Try to open with Linking first
      await Linking.openURL(deepLink);
    } catch (error) {
      console.log('Linking.openURL failed, using manual navigation:', error);
      // Fallback: Parse and navigate manually
      this.parseAndNavigate(deepLink, navigation);
    }
  }

  // Parse deep link and navigate manually
  parseAndNavigate(deepLink, navigation) {
    try {
      let path = deepLink.replace('partner://', '');
      const parts = path.split('/');
      const route = parts[0];
      const param = parts[1];
      
      console.log('Manual navigation to:', route, 'with param:', param);
      
      if (route === 'profile') {
        navigation.navigate('Profile');
      } else if (route === 'product') {
        navigation.navigate('Product', { productId: param });
      } else if (route === 'home') {
        navigation.navigate('Home');
      } else {
        console.log('Unknown route:', route);
      }
    } catch (error) {
      console.error('Error parsing deep link:', error);
    }
  }

  // Setup Firebase message listeners
  setupMessageListeners(navigationRef) {
    // Handle messages when app is in foreground
    this.onMessageListener = messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground message received:', remoteMessage);
      await this.displayNotification(remoteMessage, navigationRef);
    });

    // Handle messages when app is in background
    this.onNotificationOpenedListener = messaging().onNotificationOpenedApp(async (remoteMessage) => {
      console.log('App opened from background by notification:', remoteMessage);
      const deepLink = this.extractDeepLink(remoteMessage);
      
      if (deepLink && navigationRef?.current) {
        setTimeout(() => {
          this.handleDeepLinkNavigation(deepLink, navigationRef.current);
        }, 500);
      }
    });

    // Handle app opened from quit state
    messaging().getInitialNotification().then(async (remoteMessage) => {
      if (remoteMessage) {
        console.log('App opened from quit state by notification:', remoteMessage);
        const deepLink = this.extractDeepLink(remoteMessage);
        
        if (deepLink && navigationRef?.current) {
          setTimeout(() => {
            this.handleDeepLinkNavigation(deepLink, navigationRef.current);
          }, 1000);
        }
      }
    });
  }

  // Initialize the service
  async initialize(navigationRef) {
    try {
      await this.requestPermissions();
      await this.createNotificationChannels();
      await this.getFCMToken();
      this.setupMessageListeners(navigationRef);
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  // Cleanup listeners
  cleanup() {
    if (this.onMessageListener) {
      this.onMessageListener();
    }
    if (this.onNotificationOpenedListener) {
      this.onNotificationOpenedListener();
    }
  }
}

export default new NotificationService();