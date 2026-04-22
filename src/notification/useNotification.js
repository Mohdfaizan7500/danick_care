// src/notification/useNotification.js
import { PermissionsAndroid, Platform } from 'react-native';
import { getMessaging, getToken, getInitialNotification, onNotificationOpenedApp } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    
    // Check for pending notification when handler is set
    checkPendingNotification();
};

// Check for pending notification from AsyncStorage
const checkPendingNotification = async () => {
    try {
        const pendingData = await AsyncStorage.getItem('pendingNotification');
        if (pendingData) {
            console.log('Found pending notification:', pendingData);
            const notificationData = JSON.parse(pendingData);
            if (navigationHandler) {
                navigationHandler(notificationData);
                await AsyncStorage.removeItem('pendingNotification');
            }
        }
    } catch (error) {
        console.log('Error checking pending notification:', error);
    }
};

// Create notification channel (Android 8+ required)
const createNotificationChannel = async () => {
    try {
        const channel = await notifee.createChannel({
            id: NOTIFICATION_CONFIG.channelId,
            name: NOTIFICATION_CONFIG.channelName,
            importance: AndroidImportance.HIGH,
            vibration: true,
            sound: "default",
        });
        console.log('✅ Notification channel created:', channel);
        return channel;
    } catch (error) {
        console.log('Error creating notification channel:', error);
    }
};

// Request permission (Android 13+ and iOS)
const requestUserPermission = async () => {
    try {
        const messaging = getMessaging();
        
        if (Platform.OS === 'android') {
            if (Platform.Version >= 33) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('✅ Notification permission granted');
                    return true;
                } else {
                    console.log('❌ Notification permission denied');
                    return false;
                }
            }
            return true;
        } else {
            const authStatus = await messaging.requestPermission();
            const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;
            if (enabled) {
                console.log('✅ iOS notification permission granted');
                return true;
            }
            console.log('❌ iOS notification permission denied');
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
        console.log("✅ FCM token:", fcmToken);
        globalFCMToken = fcmToken;
        return fcmToken;
    } catch (error) {
        console.log("❌ Failed to get FCM token:", error);
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

    useEffect(() => {
        const setupNotifications = async () => {
            try {
                const messaging = getMessaging();
                
                // Create notification channel first
                await createNotificationChannel();
                
                // Request permissions
                const hasPermission = await requestUserPermission();

                if (hasPermission) {
                    const token = await getFCMTokenModular();
                    setFCMToken(token);
                    globalFCMToken = token;
                    console.log("✅ FCM Token ready:", token);
                } else {
                    console.log("⚠️ No notification permission");
                }

                // Handle notification when app is opened from quit state
                const initialNotification = await getInitialNotification(messaging);
                if (initialNotification) {
                    console.log('📱 App opened from quit state:', initialNotification);
                    if (navigationHandler) {
                        setTimeout(() => {
                            navigationHandler(initialNotification.data);
                        }, 1500);
                    }
                }

                // Handle notification when app is opened from background
                const unsubscribeBackground = onNotificationOpenedApp(messaging, (remoteMessage) => {
                    console.log('📱 App opened from background:', remoteMessage);
                    if (navigationHandler && remoteMessage.data) {
                        navigationHandler(remoteMessage.data);
                    }
                });

                // Handle notification taps when app is in foreground
                const unsubscribeForegroundTap = notifee.onForegroundEvent(({ type, detail }) => {
                    if (type === EventType.PRESS) {
                        console.log('📱 Notification tapped in foreground:', detail.notification?.data);
                        if (detail.notification?.data && navigationHandler) {
                            navigationHandler(detail.notification.data);
                        }
                    }
                });

                // Cleanup
                return () => {
                    unsubscribeBackground();
                    unsubscribeForegroundTap();
                };
                
            } catch (error) {
                console.log('❌ Error setting up notifications:', error);
            }
        };

        setupNotifications();
    }, []);

    return fcmToken;
};