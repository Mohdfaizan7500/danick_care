// src/navigation/NotificationHandler.js
import React, { useEffect, useRef } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { buildDeepLinkFromNotificationData } from './utils/deepLinkBuilder';
import { useAuth } from '../context/AuthContext';
import { navigate } from './RootNavigation';

// Sound file name (without extension for Android? Android uses full filename including extension)
const STATUS_SOUND = 'status_sound.mp3'; // change to your actual sound file name

// Simple Event Emitter implementation for React Native
class SimpleEventEmitter {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  removeAllListeners(event) {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}

// Create and export the event emitter instance
export const notificationRefreshEmitter = new SimpleEventEmitter();

async function createNotificationChannels() {
  if (Platform.OS === 'android') {
    const channels = [
      { id: 'default', name: 'Default Channel' },
      { id: 'orders', name: 'Orders Channel' },
      { id: 'complaints', name: 'Complaints Channel' },
      { id: 'amc', name: 'AMC Channel' },
      { 
        id: 'status', 
        name: 'Online/Offline Status Channel',
        sound: STATUS_SOUND, // custom sound for status channel
      },
    ];
    for (const channel of channels) {
      await notifee.createChannel({
        id: channel.id,
        name: channel.name,
        vibration: true,
        importance: AndroidImportance.HIGH,
        sound: channel.sound || 'notification', // use custom sound if defined
      });
    }
    console.log('✅ Notification channels created');
  }
}

function getChannelId(title, data) {
  const lowerTitle = title.toLowerCase();
  const status = data?.status ? data.status.toLowerCase() : '';

  if (lowerTitle === 'online' || lowerTitle === 'offline' || status === 'online' || status === 'offline') {
    return 'status';
  }

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

  const channelId = getChannelId(notificationTitle, notificationData);
  
  // Determine which sound to use based on channel
  let sound = 'notification'; // default system sound
  if (channelId === 'status') {
    sound = STATUS_SOUND; // use custom sound for status channel
  }

  await notifee.displayNotification({
    title: notificationTitle || 'Partner App',
    body: notificationBody || 'You have a new notification',
    data: { ...notificationData, title: notificationTitle, screen: notificationScreen },
    android: {
      channelId,
      importance: AndroidImportance.HIGH,
      pressAction: { id: 'default' },
      smallIcon: 'ic_launcher',
      sound: sound, // custom sound will be used if channel allows
      autoCancel: true,
    },
    ios: {
      sound: sound === 'notification' ? 'default' : sound, // iOS: use custom sound filename
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
  const { setIsOnline } = useAuth();

  useEffect(() => {
    if (isListenerSetup.current) return;
    isListenerSetup.current = true;
    console.log('🔧 Setting up notification listeners...');

    let unsubscribeForeground = null;
    let unsubscribeNotifeeEvent = null;

    const setupNotifications = async () => {
      try {
        await createNotificationChannels();

        // Foreground messages
        unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
          console.log('📱 Foreground message:', remoteMessage);
          const title = remoteMessage.notification?.title || '';
          const status = remoteMessage.data?.status;

          if (title === 'offline' || status === 'Offline' || status === 'offline') {
            console.log('📴 Setting IsOnline = false');
            setIsOnline(false);
            navigate('BottomTabs', { screen: 'Home' });
          } else if (title === 'online' || status === 'Online' || status === 'online') {
            console.log('📶 Setting IsOnline = true');
            setIsOnline(true);
            // Optional: navigate to a specific screen for online notification
            // navigate('OnlineScreen');
          }

          // Emit refresh event for any notification
          notificationRefreshEmitter.emit('refresh');

          await displayNotification(remoteMessage);
        });

        // Notification click (when app is in foreground)
        unsubscribeNotifeeEvent = notifee.onForegroundEvent(({ type, detail }) => {
          if (type === EventType.PRESS && detail.notification) {
            const screen = detail.notification.data?.screen || detail.notification.title;
            const url = buildDeepLinkFromNotificationData(screen);
            if (url) {
              Linking.openURL(url).catch(console.error);
            }
          }
        });
      } catch (error) {
        console.error('❌ Error setting up notifications:', error);
      }
    };

    setupNotifications();

    return () => {
      if (unsubscribeForeground) unsubscribeForeground();
      if (unsubscribeNotifeeEvent) unsubscribeNotifeeEvent();
      isListenerSetup.current = false;
      // Clean up all listeners when component unmounts
      notificationRefreshEmitter.removeAllListeners();
    };
  }, [setIsOnline]);

  return null;
};

export default NotificationHandler;