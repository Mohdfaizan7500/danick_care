// src/navigation/NotificationHandler.js
import React, { useEffect, useRef } from 'react';
import { Linking, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { buildDeepLinkFromNotificationData } from './utils/deepLinkBuilder';

// Define NAVIGATION_IDS based on notification titles
const NAVIGATION_IDS = ['home', 'spare', 'orders', 'complaints', 'amc', 'bucket', 'notifications', 'assign'];

async function createNotificationChannels() {
  if (Platform.OS === 'android') {
    const channels = [
      { id: 'default', name: 'Default Channel' },
      { id: 'orders', name: 'Orders Channel' },
      { id: 'complaints', name: 'Complaints Channel' },
      { id: 'amc', name: 'AMC Channel' },
    ];

    for (const channel of channels) {
      await notifee.createChannel({
        id: channel.id,
        name: channel.name,
        vibration: true,
        importance: AndroidImportance.HIGH,
        sound: 'notification',
      });
    }
    console.log('✅ Notification channels created');
  }
}

function getChannelId(title) {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle === 'orders') return 'orders';
  if (lowerTitle === 'complaints' || lowerTitle === 'assign') return 'complaints';
  if (lowerTitle === 'amc') return 'amc';
  return 'default';
}

async function displayNotification(remoteMessage) {
  const notification = remoteMessage.notification || {};
  const notificationTitle = notification.title || '';
  const notificationBody = notification.body || '';
  const notificationData = remoteMessage.data || {};
  const notificationScreen = notificationData?.screen || notificationTitle;

  console.log('screen to navigate:', notificationScreen);

  const channelId = getChannelId(notificationTitle);

  await notifee.displayNotification({
    title: notificationTitle || 'Partner App',
    body: notificationBody || 'You have a new notification',
    data: { ...notificationData, title: notificationTitle, screen: notificationScreen },
    android: {
      channelId: channelId,
      importance: AndroidImportance.HIGH,
      pressAction: { id: 'default' },
      smallIcon: 'ic_launcher',
      sound: 'notification',
      autoCancel: true,
    },
    ios: {
      sound: 'notification',
      foregroundPresentationOptions: {
        badge: true,
        sound: true,
        banner: true,
        list: true,
      },
    },
  });
}

const NotificationHandler = () => {
  const isListenerSetup = useRef(false);

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
          await displayNotification(remoteMessage);
        });

        // Handle notification click
        unsubscribeNotifeeEvent = notifee.onForegroundEvent(({ type, detail }) => {
          if (type === EventType.PRESS && detail.notification) {
            const notificationTitle = detail.notification.data?.screen || detail.notification.title;
            console.log('📱 Notification clicked in foreground, title:', notificationTitle);

            const url = buildDeepLinkFromNotificationData(notificationTitle);
            console.log('🔗 Built URL from title:', url);

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

  return null; // This component doesn't render anything
};

export default NotificationHandler;