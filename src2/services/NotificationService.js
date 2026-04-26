import notifee, {
  AndroidImportance,
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
        
        console.log('Notification channels created');
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
    try {
      // First check data object
      const data = remoteMessage.data || {};
      if (data.deepLink && typeof data.deepLink === 'string') return data.deepLink;
      if (data.link && typeof data.link === 'string') return data.link;
      
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
    } catch (error) {
      console.error('Error extracting deep link:', error);
      return null;
    }
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
      
      console.log('Displaying notification:', { title, body, deepLink, channelId });
      
      // Build notification object
      const notificationObj = {
        title: title,
        body: body,
        data: notificationData,
        android: {
          channelId: channelId,
          pressAction: {
            id: 'default',
          },
          smallIcon: 'ic_launcher',
          importance: AndroidImportance.HIGH,
          autoCancel: true,
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
      };
      
      // Add actions only if deep link exists
      if (deepLink) {
        notificationObj.android.actions = [
          {
            title: 'Open Link',
            pressAction: { id: 'open_link' },
          },
          {
            title: 'Dismiss',
            pressAction: { id: 'dismiss' },
          },
        ];
      }
      
      // Display notification
      await notifee.displayNotification(notificationObj);
      
      console.log('Notification displayed successfully');
      
      // If app is in foreground and has deep link, show an alert
      if (deepLink && navigationRef?.current) {
        console.log('Deep link available in notification:', deepLink);
        // You can show an in-app alert here if needed
      }
      
    } catch (error) {
      console.error('Error displaying notification:', error);
      
      // Fallback: Display simple notification without any extras
      try {
        console.log('Attempting fallback notification...');
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
        console.log('Fallback notification displayed');
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
    
    console.log('Handling deep link navigation:', deepLink);
    
    if (!navigation) {
      console.log('Navigation not available, opening with Linking');
      try {
        const canOpen = await Linking.canOpenURL(deepLink);
        if (canOpen) {
          await Linking.openURL(deepLink);
        } else {
          console.log('Cannot open URL:', deepLink);
          this.parseAndNavigate(deepLink, null);
        }
      } catch (error) {
        console.error('Error opening deep link with Linking:', error);
        this.parseAndNavigate(deepLink, null);
      }
      return;
    }
    
    try {
      // Try to open with Linking first
      const canOpen = await Linking.canOpenURL(deepLink);
      if (canOpen) {
        await Linking.openURL(deepLink);
      } else {
        this.parseAndNavigate(deepLink, navigation);
      }
    } catch (error) {
      console.log('Linking.openURL failed, using manual navigation:', error);
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
      
      if (!navigation) {
        console.log('No navigation available for manual navigation');
        return;
      }
      
      if (route === 'profile' || route === 'Profile') {
        navigation.navigate('Profile');
      } else if (route === 'product' || route === 'Product') {
        navigation.navigate('Product', { productId: param || '1' });
      } else if (route === 'home' || route === 'Home') {
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
          }, 1500);
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
      console.log('Notification service initialized successfully');
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