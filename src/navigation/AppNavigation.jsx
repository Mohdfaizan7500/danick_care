// src/navigation/AppNavigation.js
import React, { forwardRef, useEffect, useRef } from 'react';
import { Image, Linking, StyleSheet, View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AppStack from './AppStack/AppStack';
import AuthStack from './AuthStack/AuthStack';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

// Define NAVIGATION_IDS based on notification titles
const NAVIGATION_IDS = ['home', 'spare', 'orders', 'complaints', 'amc', 'bucket', 'notifications'];

function buildDeepLinkFromNotificationData(title) {
    if (!title) return null;

    // Convert title to lowercase for case-insensitive matching
    const navigationId = title.toLowerCase();

    if (!NAVIGATION_IDS.includes(navigationId)) {
        console.warn('Unverified navigationId:', navigationId);
        return null;
    }

    // Build deep link based on navigation ID (title)
    switch (navigationId) {
        case 'home':
            return 'partner://home';
        case 'spare':
            return 'partner://spare';
        case 'orders':
            return 'partner://orders';
        case 'complaints':
            return 'partner://complaints';
        case 'amc':
            return 'partner://amc';
        case 'bucket':
            return 'partner://bucket';
        case 'notifications':
            return 'partner://notifications';
        default:
            console.warn('Missing valid navigationId');
            return null;
    }
}

// Create notification channels (Android only)
async function createNotificationChannels() {
    if (Platform.OS === 'android') {
        await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
            vibration: true,
            importance: AndroidImportance.HIGH,
            sound: 'notification', // Add this line
        });

        await notifee.createChannel({
            id: 'orders',
            name: 'Orders Channel',
            vibration: true,
            importance: AndroidImportance.HIGH,
            sound: 'notification', // Add this line
        });

        await notifee.createChannel({
            id: 'complaints',
            name: 'Complaints Channel',
            vibration: true,
            importance: AndroidImportance.HIGH,
            sound: 'notification', // Add this line
        });

        await notifee.createChannel({
            id: 'amc',
            name: 'AMC Channel',
            vibration: true,
            importance: AndroidImportance.HIGH,
            sound: 'notification', // Add this line
        });

        console.log('✅ Notification channels created');
    }
}

const AppNavigation = forwardRef((props, ref) => {
    const { accessToken, isLoading } = useAuth();
    const navigationRef = useRef();
    const isListenerSetup = useRef(false);

    // Expose navigationRef to parent
    React.useImperativeHandle(ref, () => navigationRef.current);

    // Setup notification listeners - only once
    useEffect(() => {
        if (isListenerSetup.current) {
            console.log('⚠️ Notification listeners already setup, skipping...');
            return;
        }

        isListenerSetup.current = true;
        console.log('🔧 Setting up notification listeners (once)...');

        let unsubscribeForeground = null;
        let unsubscribeNotifeeEvent = null;

        const setupNotifications = async () => {
            try {
                await createNotificationChannels();

                // Handle foreground messages
                unsubscribeForeground = messaging().onMessage(async remoteMessage => {
                    console.log('📱 Foreground message received:', remoteMessage);

                    const notification = remoteMessage.notification || {};
                    const notificationTitle = notification.title || '';
                    const notificationBody = notification.body || '';
                    const notificationData = remoteMessage.data || {};

                    // Determine channel based on title
                    let channelId = 'default';
                    const title = notificationTitle.toLowerCase();
                    if (title === 'orders') channelId = 'orders';
                    else if (title === 'complaints') channelId = 'complaints';
                    else if (title === 'amc') channelId = 'amc';

                    // Display notification using Notifee
                    // Inside your onMessage handler, replace the displayNotification section
                    await notifee.displayNotification({
                        title: notificationTitle || 'Partner App',
                        body: notificationBody || 'You have a new notification',
                        data: { ...notificationData, title: notificationTitle },
                        android: {
                            channelId: channelId, // Use the dynamically determined channel ID, not hardcoded 'default'
                            importance: AndroidImportance.HIGH,
                            pressAction: { id: 'default' },
                            smallIcon: 'ic_launcher',
                            sound: 'notification', // Keep this
                            autoCancel: true,
                        },
                        ios: {
                            sound: 'notification',
                            foregroundPresentationOptions: {
                                badge: true,
                                sound: true, // Ensure sound is enabled for iOS foreground
                                banner: true,
                                list: true,
                            },
                        },
                    });
                });

                // Handle notification click - Use Linking API instead of navigation ref
                unsubscribeNotifeeEvent = notifee.onForegroundEvent(({ type, detail }) => {
                    if (type === EventType.PRESS && detail.notification) {
                        const notificationTitle = detail.notification.title;
                        console.log('📱 Notification clicked in foreground, title:', notificationTitle);

                        // Build deep link from notification title
                        const url = buildDeepLinkFromNotificationData(notificationTitle);
                        console.log('🔗 Built URL from title:', url);

                        // Use Linking API to handle navigation
                        if (url) {
                            console.log('🚀 Opening URL via Linking:', url);
                            Linking.openURL(url).catch(err => {
                                console.error('❌ Error opening URL:', err);
                            });
                        }
                    }
                });

            } catch (error) {
                console.error('❌ Error setting up notifications:', error);
            }
        };

        setupNotifications();

        return () => {
            console.log('🧹 Cleaning up notification listeners...');
            if (unsubscribeForeground) unsubscribeForeground();
            if (unsubscribeNotifeeEvent) unsubscribeNotifeeEvent();
            isListenerSetup.current = false;
        };
    }, []);

    const linking = {
        prefixes: ['partner://', 'https://partner.com', 'http://partner.com'],
        config: {
            initialRouteName: 'Login',
            screens: {
                Login: 'login',
                BottomTabs: {
                    path: '',
                    screens: {
                        Home: 'home',
                        Orders: 'orders',
                        Scan: 'scan',
                        Parts: 'partstab',
                        Profile: 'profile',
                    },
                },
                SparePartScreen: 'spare',
                PartDetails: 'part/:partId',
                Complaints: 'complaints',
                ComplaintDetail: 'complaint/:complaintId',
                MyComplaints: 'mycomplaints',
                Bucket: 'bucket',
                BucketpartDetails: 'bucketpart/:partId',
                AddPart: 'addpart',
                AMC: 'amc',
                AMCDetails: 'amcdetails/:amcId',
                AMCList: 'amclist',
                MyAmc: 'myamc',
                CompleteAMCDetails: 'completeamc/:amcId',
                PreBooking: 'prebooking',
                PayOut: 'payout',
                Notification: 'notifications',
                Password: 'password',
                ReplaceParts: 'replaceparts',
                TermsConditions: 'terms',
                Support: 'support',
                Billing: 'billing/:billId',
                AddPartBilling: 'addpartbilling',
                Remarkscreen: 'remark/:remarkId',
                ProductDetails: 'product/:productId',
                QRCodes: 'qrcodes',
                QRCodeDetails: 'qrcode/:qrId',
                Services: 'services',
                ProfileDetails: 'profiledetails',
            },
        },

        async getInitialURL() {
            try {
                console.log('🔗 Getting initial URL...');

                // Check for deep link from app open
                const url = await Linking.getInitialURL();
                if (typeof url === 'string' && url) {
                    console.log('✅ Initial URL found:', url);
                    return url;
                }

                // Check for notification that opened the app from quit state
                const message = await messaging().getInitialNotification();
                const notificationTitle = message?.notification?.title;
                console.log('📱 Initial notification title:', notificationTitle);

                if (notificationTitle) {
                    const deeplinkURL = buildDeepLinkFromNotificationData(notificationTitle);
                    if (deeplinkURL) {
                        console.log('🔗 Built deeplink from notification title:', deeplinkURL);
                        return deeplinkURL;
                    }
                }

                console.log('❌ No initial URL or notification found');
                return null;
            } catch (error) {
                console.error('❌ Error getting initial URL:', error);
                return null;
            }
        },

        subscribe(listener) {
            console.log('🔗 Setting up deep link subscribers...');

            // Listen to incoming links from deep linking
            const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
                console.log('🔗 Deep link received:', url);
                listener(url);
            });

            // Listen to notification when app is in background
            const unsubscribeNotification = messaging().onNotificationOpenedApp(remoteMessage => {
                const notificationTitle = remoteMessage.notification?.title;
                console.log('📱 Notification opened from background, title:', notificationTitle);

                const url = buildDeepLinkFromNotificationData(notificationTitle);
                if (url) {
                    console.log('🔗 Navigating via notification title:', url);
                    // Use Linking API for background notifications too
                    Linking.openURL(url).catch(err => {
                        console.error('❌ Error opening URL from background:', err);
                    });
                    listener(url);
                }
            });

            return () => {
                console.log('🔗 Cleaning up deep link subscribers');
                linkingSubscription.remove();
                unsubscribeNotification();
            };
        },
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Image
                    source={require('../assets/images/AppIcon.png')}
                    style={{ width: 100, height: 100 }}
                    resizeMode='contain'
                />
            </View>
        );
    }

    return (
        <NavigationContainer ref={navigationRef} linking={linking}>
            {accessToken ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
});

AppNavigation.displayName = 'AppNavigation';

export default AppNavigation;

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    iconContainer: {
        borderWidth: 0,
        width: 150,
        height: 150,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});