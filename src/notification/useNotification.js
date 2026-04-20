// src/notification/useNotification.js
import { PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType, AndroidColor } from '@notifee/react-native';
import { useEffect, useRef, useState } from 'react';

// Configuration for notifications
const NOTIFICATION_CONFIG = {
    androidIcon: "ic_launcher",
    channelId: "default",
    channelName: "Default Channel",
};

// Store FCM token globally
let globalFCMToken = null;

// Create notification channel (Android 8+ required)
const createNotificationChannel = async () => {
    await notifee.createChannel({
        id: NOTIFICATION_CONFIG.channelId,
        name: NOTIFICATION_CONFIG.channelName,
        importance: AndroidImportance.HIGH,
        vibration: true,
        sound: "default",
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
            smallIcon: NOTIFICATION_CONFIG.androidIcon,
            color: NOTIFICATION_CONFIG.androidColor,
            importance: AndroidImportance.HIGH,
            autoCancel: true,
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
        if (Platform.Version >= 33) {
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
        return true;
    } else {
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
        const fcmToken = await messaging().getToken();
        console.log("FCM token:", fcmToken);
        globalFCMToken = fcmToken;
        return fcmToken;
    } catch (error) {
        console.log("Failed to get FCM token:", error);
        if (error.code === 'messaging/unknown' && error.message.includes('SERVICE_NOT_AVAILABLE')) {
            console.log("Google Play Services not available. Check emulator/device setup.");
        }
        return null;
    }
};

// Export function to get FCM token
export const getFCMToken = () => {
    return globalFCMToken;
};

// Navigation handler
let navigationHandler = null;

export const setNotificationNavigationHandler = (handler) => {
    navigationHandler = handler;
};

export const useNotification = () => {
    const [fcmToken, setFCMToken] = useState(null);
    const foregroundUnsubscribe = useRef(null);
    const backgroundUnsubscribe = useRef(null);
    const notifeeUnsubscribe = useRef(null);

    useEffect(() => {
        const setupNotifications = async () => {
            await createNotificationChannel();
            const hasPermission = await requestUserPermission();

            if (hasPermission) {
                const token = await getToken();
                setFCMToken(token);
                globalFCMToken = token;
                console.log("FCM Token ready:", token);
            }

            // Handle foreground notifications
            foregroundUnsubscribe.current = messaging().onMessage(async (remoteMessage) => {
                console.log('FCM Message received in foreground:', JSON.stringify(remoteMessage));
                await displayNotification(
                    remoteMessage.notification?.title,
                    remoteMessage.notification?.body,
                    remoteMessage.data
                );
            });

            // Handle notification when app is opened from quit state
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

            // Handle notification when app is in background
            backgroundUnsubscribe.current = messaging().onNotificationOpenedApp(async (remoteMessage) => {
                console.log('App opened from background:', remoteMessage);
                if (navigationHandler) {
                    navigationHandler(remoteMessage.data);
                }
            });

            // Handle notifee events
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

    // Return the token from the hook if needed
    return fcmToken;
};