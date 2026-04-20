/**
 * @format
 */
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
// Import modular API functions instead of the default namespace
import { setBackgroundMessageHandler, getMessaging } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

// Register background handler using the modular function
// Note: You need to pass the messaging instance to the handler
const messaging = getMessaging();
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

AppRegistry.registerComponent(appName, () => App);