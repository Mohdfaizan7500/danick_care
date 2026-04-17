// src/notification/useNotification.js
import { PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType, AndroidColor } from '@notifee/react-native';
import { useEffect, useRef } from 'react';

// Configuration for notifications
const NOTIFICATION_CONFIG = {
    // Change these values as needed
    androidIcon: "ic_launcher", // Replace with your icon name (without extension)
    androidColor: "#4CAF50", // Orange color - change to any hex color you want
    channelId: "default",
    channelName: "Default Channel",
};

// Create notification channel (Android 8+ required)
const createNotificationChannel = async () => {
    await notifee.createChannel({
        id: NOTIFICATION_CONFIG.channelId,
        name: NOTIFICATION_CONFIG.channelName,
        importance: AndroidImportance.HIGH,
        vibration: true,
        sound: "default",
        // Optional: Set channel level color
        lightColor: NOTIFICATION_CONFIG.androidColor,
    });
};

// Display a notification using notifee
const displayNotification = async (title, body, data = {}) => {
    await notifee.displayNotification({
        title: title || "New Notification",
        body: body || "You have a new message",
        data: data,
        android: {
            channelId: NOTIFICATION_CONFIG.channelId,
            pressAction: { id: "default" },
            smallIcon: NOTIFICATION_CONFIG.androidIcon, // Custom icon
            color: NOTIFICATION_CONFIG.androidColor, // Background color for icon
            importance: AndroidImportance.HIGH,
            autoCancel: true,
            // Optional: Add large icon
            // largeIcon: NOTIFICATION_CONFIG.androidIcon,
            // Optional: Set priority
            priority: AndroidImportance.HIGH,
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
};

// Request permission (Android 13+ and iOS)
const requestUserPermission = async () => {
    if (Platform.OS === 'android') {
        if (Platform.Version >= 33) { // Android 13+
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Notification permission granted');
                return true;
            } else {
                console.log('Notification permission denied');
                return false;
            }
        }
        return true; // For Android versions below 13, permission is granted by default
    } else {
        // iOS permission
        const authStatus = await messaging().requestPermission();
        const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('iOS notification permission granted');
            return true;
        }
        return false;
    }
};

// Get FCM token using modular API
const getToken = async () => {
    try {
        // Use the modular API approach
        const fcmToken = await messaging().getToken();
        console.log("FCM token:", fcmToken);
        return fcmToken;
    } catch (error) {
        console.log("Failed to get FCM token:", error);
        if (error.code === 'messaging/unknown' && error.message.includes('SERVICE_NOT_AVAILABLE')) {
            console.log("Google Play Services not available. Check emulator/device setup.");
        }
        return null;
    }
};

// Navigation handler (you'll set this from App.js)
let navigationHandler = null;

export const setNotificationNavigationHandler = (handler) => {
    navigationHandler = handler;
};

export const useNotification = () => {
    const foregroundUnsubscribe = useRef(null);
    const backgroundUnsubscribe = useRef(null);
    const notifeeUnsubscribe = useRef(null);

    useEffect(() => {
        const setupNotifications = async () => {
            // Create channel for Android
            await createNotificationChannel();

            // Request permission
            const hasPermission = await requestUserPermission();

            if (hasPermission) {
                // Get FCM token
                const token = await getToken();
                // You can send this token to your backend here
                console.log("FCM Token ready:", token);
            }

            // Handle foreground notifications - using modular API
            foregroundUnsubscribe.current = messaging().onMessage(async (remoteMessage) => {
                console.log('FCM Message received in foreground:', JSON.stringify(remoteMessage));

                // Display notification using notifee
                await displayNotification(
                    remoteMessage.notification?.title,
                    remoteMessage.notification?.body,
                    remoteMessage.data
                );
            });

            // Handle notification when app is opened from quit state (completely closed)
            // Using modular API
            messaging()
                .getInitialNotification()
                .then(async (remoteMessage) => {
                    if (remoteMessage) {
                        console.log('App opened from quit state:', remoteMessage);
                        if (navigationHandler) {
                            navigationHandler(remoteMessage.data);
                        }
                    }
                })
                .catch(error => {
                    console.log('Error getting initial notification:', error);
                });

            // Handle notification when app is in background (but not closed)
            backgroundUnsubscribe.current = messaging().onNotificationOpenedApp(async (remoteMessage) => {
                console.log('App opened from background:', remoteMessage);
                if (navigationHandler) {
                    navigationHandler(remoteMessage.data);
                }
            });

            // Note: Background message handler is already set in index.js
            // Do NOT set it again here to avoid duplicates

            // Handle notifee events (like when user taps on notification while app is foreground)
            notifeeUnsubscribe.current = notifee.onForegroundEvent(({ type, detail }) => {
                if (type === EventType.PRESS) {
                    console.log('User pressed notification:', detail.notification);
                    if (detail.notification?.data && navigationHandler) {
                        navigationHandler(detail.notification.data);
                    }
                }
            });
        };

        setupNotifications();

        // Cleanup subscriptions
        return () => {
            if (foregroundUnsubscribe.current) {
                foregroundUnsubscribe.current();
            }
            if (backgroundUnsubscribe.current) {
                backgroundUnsubscribe.current();
            }
            if (notifeeUnsubscribe.current) {
                notifeeUnsubscribe.current();
            }
        };
    }, []);
};