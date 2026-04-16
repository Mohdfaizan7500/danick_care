import { PermissionsAndroid, Platform, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';

const requestUserPermission = async () => {
    if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Notification permission granted');
        } else {
            console.log('Notification permission denied');
        }
    } else {
        // iOS permission
        const authStatus = await messaging().requestPermission();
        const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('iOS notification permission granted');
        }
    }
}

const getToken = async () => {
    try {
        // Wait for the app to register with FCM
        const token = await messaging().getToken();
        console.log("FCM token:", token);
        return token;
    } catch (error) {
        console.log("Failed to get FCM token:", error);

        // Handle specific errors
        if (error.code === 'messaging/unknown' && error.message.includes('SERVICE_NOT_AVAILABLE')) {
            console.log("Google Play Services not available. Check emulator/device setup.");
        }
    }
}

export const useNotification = () => {
    useEffect(() => {
        const setupNotifications = async () => {
            await requestUserPermission();

            // Add delay to ensure FCM is initialized
            setTimeout(async () => {
                await getToken();
            }, 2000);
        };

        setupNotifications();
    }, []);
}