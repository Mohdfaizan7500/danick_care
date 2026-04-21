/**
 * @format
 */
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
// Import modular API functions
import { setBackgroundMessageHandler, getMessaging } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get messaging instance using modular API
const messaging = getMessaging();

// Set background message handler for FCM using modular API
setBackgroundMessageHandler(messaging, async (remoteMessage) => {
    console.log('Message handled in the background!', remoteMessage);
    
    // Display notification from background using notifee
    await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'New Notification',
        body: remoteMessage.notification?.body || 'You have a new message',
        data: remoteMessage.data,
        android: {
            channelId: 'default',
            pressAction: { id: 'default' },
            smallIcon: 'ic_launcher',
            importance: AndroidImportance.HIGH,
            autoCancel: true,
        },
        ios: {
            badge: true,
            sound: true,
            banner: true,
        },
    });
});

// Set background event handler for notifee (for handling notification actions in background)
notifee.onBackgroundEvent(async ({ type, detail }) => {
    console.log('Background event received:', type, detail);
    
    // Handle notification press in background
    if (type === EventType.PRESS) {
        console.log('User pressed notification in background:', detail.notification);
        
        // Store the notification data to be processed when app opens
        const notificationData = detail.notification?.data;
        if (notificationData) {
            // Save to AsyncStorage to handle when app becomes active
            await AsyncStorage.setItem('pendingNotification', JSON.stringify(notificationData));
            console.log('Saved pending notification for handling on app open');
        }
    }
    
    // Handle action buttons if you have them
    if (type === EventType.ACTION_PRESS) {
        console.log('User pressed action button:', detail.pressAction.id);
    }
});

AppRegistry.registerComponent(appName, () => App);