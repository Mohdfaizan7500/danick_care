// src/notification/useNotification.js
import { PermissionsAndroid, Platform } from 'react-native';
import { getMessaging, getToken, onMessage, getInitialNotification, onNotificationOpenedApp } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { useEffect, useRef, useState } from 'react';

// Configuration for notifications
const NOTIFICATION_CONFIG = {
    androidIcon: "ic_launcher",
    channelId: "default",
    channelName: "Default Channel",
    androidColor: '#FF6B6B',
};

// Store FCM token globally
let globalFCMToken = null;

// Navigation handler
let navigationHandler = null;

export const setNotificationNavigationHandler = (handler) => {
    navigationHandler = handler;
};

// Create notification channel (Android 8+ required)
const createNotificationChannel = async () => {
    try {
        await notifee.createChannel({
            id: NOTIFICATION_CONFIG.channelId,
            name: NOTIFICATION_CONFIG.channelName,
            importance: AndroidImportance.HIGH,
            vibration: true,
            sound: "default",
        });
        console.log('Notification channel created');
    } catch (error) {
        console.log('Error creating notification channel:', error);
    }
};

// Display a notification using notifee (works in all app states)
const displayNotification = async (title, body, data = {}) => {
    try {
        await notifee.displayNotification({
            title: title || "New Notification",
            body: body || "You have a new message",
            data: data,
            android: {
                channelId: NOTIFICATION_CONFIG.channelId,
                pressAction: { id: "default" },
                smallIcon: NOTIFICATION_CONFIG.androidIcon,
                importance: AndroidImportance.HIGH,
                autoCancel: true,
                color: NOTIFICATION_CONFIG.androidColor,
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
        console.log('Notification displayed successfully');
    } catch (error) {
        console.log('Error displaying notification:', error);
    }
};

// Request permission (Android 13+ and iOS) - Updated to modular API
const requestUserPermission = async () => {
    try {
        const messaging = getMessaging();
        
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
            const authStatus = await messaging.requestPermission();
            const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;
            if (enabled) {
                console.log('iOS notification permission granted');
                return true;
            }
            console.log('iOS notification permission denied');
            return false;
        }
    } catch (error) {
        console.log('Error requesting permission:', error);
        return false;
    }
};

// Get FCM token using modular API
const getFCMTokenModular = async () => {
    try {
        const messaging = getMessaging();
        const fcmToken = await getToken(messaging);
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

export const useNotification = () => {
    const [fcmToken, setFCMToken] = useState(null);
    const foregroundUnsubscribe = useRef(null);
    const backgroundUnsubscribe = useRef(null);
    const notifeeUnsubscribe = useRef(null);

    useEffect(() => {
        const setupNotifications = async () => {
            try {
                const messaging = getMessaging();
                
                await createNotificationChannel();
                const hasPermission = await requestUserPermission();

                if (hasPermission) {
                    const token = await getFCMTokenModular();
                    setFCMToken(token);
                    globalFCMToken = token;
                    console.log("FCM Token ready:", token);
                }

                // Handle foreground notifications using modular API
                foregroundUnsubscribe.current = onMessage(messaging, async (remoteMessage) => {
                    console.log('📱 FCM Message received in FOREGROUND:', JSON.stringify(remoteMessage));
                    
                    const title = remoteMessage.notification?.title || remoteMessage.data?.title || "New Notification";
                    const body = remoteMessage.notification?.body || remoteMessage.data?.body || "You have a new message";
                    const data = remoteMessage.data || {};
                    
                    await displayNotification(title, body, data);
                });

                // Handle notification when app is opened from quit state using modular API
                const initialNotification = await getInitialNotification(messaging);
                if (initialNotification) {
                    console.log('App opened from quit state:', initialNotification);
                    if (navigationHandler) {
                        setTimeout(() => {
                            navigationHandler(initialNotification.data);
                        }, 1000);
                    }
                }

                // Handle notification when app is in background using modular API
                backgroundUnsubscribe.current = onNotificationOpenedApp(messaging, async (remoteMessage) => {
                    console.log('App opened from background:', remoteMessage);
                    if (navigationHandler) {
                        navigationHandler(remoteMessage.data);
                    }
                });

                // Handle notifee events (when user taps on notification)
                notifeeUnsubscribe.current = notifee.onForegroundEvent(({ type, detail }) => {
                    if (type === EventType.PRESS) {
                        console.log('User pressed notification:', detail.notification);
                        // Fix: Use detail.notification.data instead of detail.notification
                        if (detail.notification?.data && navigationHandler) {
                            navigationHandler(detail.notification.data);
                        }
                    }
                });
                
                console.log('✅ Notifications setup complete');
            } catch (error) {
                console.log('Error setting up notifications:', error);
            }
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

    return fcmToken;
};