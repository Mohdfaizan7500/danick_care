/**
 * @format
 */
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './src2/App';
import { name as appName } from './app.json';
// Import modular API functions
import {
    setBackgroundMessageHandler,
    getMessaging,
    onMessage
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get messaging instance using modular API
const messaging = getMessaging();

// Foreground message handler
onMessage(messaging, async (remoteMessage) => {
    console.log('📱 FOREGROUND message received in index.js:', remoteMessage);

    // Extract data from notification - IMPORTANT: data might be in different places
    const notificationData = remoteMessage.data || {};
    const notification = remoteMessage.notification || {};

    console.log('📱 Notification title:', notification.title);
    console.log('📱 Notification body:', notification.body);
    console.log('📱 Notification data:', notificationData);

    // Display notification in foreground
    await notifee.displayNotification({
        title: notification.title || 'New Notification',
        body: notification.body || 'You have a new message',
        data: {
            ...notificationData,
            title: notification.title,  // Include title in data
            body: notification.body,    // Include body in data
            screen: notification.body || notification.title || 'complaints' // Use body/title as screen identifier
        },
        android: {
            channelId: 'default',
            pressAction: { id: 'default' },
            smallIcon: 'ic_launcher',
            importance: AndroidImportance.HIGH,
            autoCancel: true,
        },
        ios: {
            foregroundPresentationOptions: {
                badge: true,
                sound: true,
                banner: true,
                list: true,
            },
        },
    });
});

// Background message handler
setBackgroundMessageHandler(messaging, async (remoteMessage) => {
    console.log('📱 BACKGROUND message received:', remoteMessage);

    // Extract data
    const notificationData = remoteMessage.data || {};
    const notification = remoteMessage.notification || {};

    // Display notification from background using notifee
    await notifee.displayNotification({
        title: notification.title || 'New Notification',
        body: notification.body || 'You have a new message',
        data: {
            ...notificationData,
            title: notification.title,
            body: notification.body,
            screen: notification.body || notification.title || 'complaints'
        },
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

// Background event handler for notifee
notifee.onBackgroundEvent(async ({ type, detail }) => {
    console.log('Background event received:', type, detail);

    // Handle notification press in background
    if (type === EventType.PRESS) {
        console.log('User pressed notification in background:', detail.notification);

        // Get notification data - CRITICAL FIX: Extract properly
        let notificationData = detail.notification?.data || {};

        // If data is empty but notification has title/body, use those
        if (Object.keys(notificationData).length === 0 && detail.notification) {
            notificationData = {
                title: detail.notification.title,
                body: detail.notification.body,
                screen: detail.notification.body || detail.notification.title || 'complaints'
            };
            console.log('Created data from notification:', notificationData);
        }

        console.log('Saving notification data:', notificationData);

        if (notificationData && Object.keys(notificationData).length > 0) {
            // Save to AsyncStorage to handle when app opens
            await AsyncStorage.setItem('pendingNotification', JSON.stringify(notificationData));
            console.log('Saved pending notification for handling on app open');
        } else {
            console.log('No notification data to save');
        }
    }

    // Handle action buttons if you have them
    if (type === EventType.ACTION_PRESS) {
        console.log('User pressed action button:', detail.pressAction.id);
    }
});

AppRegistry.registerComponent(appName, () => App);