import "./global.css"
import { View } from "react-native";
import { AuthProvider } from './src/context/AuthContext';
import AppNavigation from './src/navigation/AppNavigation';
import { Toaster } from 'sonner-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNotification, setNotificationNavigationHandler } from './src/notification/useNotification';
import { useEffect, useRef } from "react";

export default function App() {
  const navigationRef = useRef(null);
  console.log("Navigation ref created:", navigationRef);

  // Initialize notifications
  useNotification();

  // Setup navigation handler for notifications
  // In App.js, update the navigation handler:
  useEffect(() => {
    setNotificationNavigationHandler((notificationData) => {
      console.log('Handling notification navigation:', notificationData);

      if (notificationData && navigationRef.current) {
        console.log("Navigation ref is ready:", navigationRef.current);

        // Extract screen from notification data - prioritize body and title
        let targetScreen = notificationData.screen ||
          notificationData.body ||
          notificationData.title ||
          notificationData.type;

        // Check for complaint-related data
        const hasComplaintData = notificationData.complaintId ||
          notificationData.complaint_id ||
          notificationData.id ||
          (targetScreen && targetScreen.toLowerCase().includes('complaint'));

        console.log("Target screen:", targetScreen);
        console.log("Has complaint data:", hasComplaintData);

        // Navigate based on notification data
        if (hasComplaintData || (targetScreen && targetScreen.toLowerCase() === 'complaints')) {
          console.log("Attempting to navigate to Complaints screen");

          // Get complaint ID from various possible fields
          const complaintId = notificationData.complaintId ||
            notificationData.complaint_id ||
            notificationData.id;

          navigationRef.current?.navigate('Complaints', {
            complaintId: complaintId,
            complaintData: notificationData,
            screen: 'complaints'
          });
        }
        else if (targetScreen && (targetScreen.toLowerCase().includes('chat') || targetScreen.toLowerCase() === 'chat')) {
          navigationRef.current?.navigate('Chat', {
            chatId: notificationData.chatId || notificationData.id
          });
        }
        else if (targetScreen && (targetScreen.toLowerCase().includes('order') || targetScreen.toLowerCase() === 'orders')) {
          console.log("Attempting to navigate to Orders tab");
          navigationRef.current?.navigate('BottomTabs', {
            screen: 'Orders',
            params: {
              orderId: notificationData.orderId
            }
          });
        }
        else if (targetScreen && (targetScreen.toLowerCase().includes('profile') || targetScreen.toLowerCase() === 'profile')) {
          navigationRef.current?.navigate('BottomTabs', {
            screen: 'Profile'
          });
        }
        else if (targetScreen && (targetScreen.toLowerCase().includes('home') || targetScreen.toLowerCase() === 'home')) {
          navigationRef.current?.navigate('BottomTabs', {
            screen: 'Home'
          });
        }
        else if (targetScreen && (targetScreen.toLowerCase().includes('parts') || targetScreen.toLowerCase() === 'parts')) {
          navigationRef.current?.navigate('BottomTabs', {
            screen: 'Parts'
          });
        }
        else if (targetScreen && (targetScreen.toLowerCase().includes('scan') || targetScreen.toLowerCase() === 'scan')) {
          navigationRef.current?.navigate('BottomTabs', {
            screen: 'Scan'
          });
        }
        else {
          console.log('Unknown navigation target, defaulting to Complaints:', targetScreen);
          // Default to Complaints screen if we have any data
          if (notificationData && Object.keys(notificationData).length > 0) {
            navigationRef.current?.navigate('Complaints', {
              notificationData: notificationData
            });
          } else {
            // If no data, go to Home
            navigationRef.current?.navigate('BottomTabs', {
              screen: 'Home'
            });
          }
        }
      } else {
        console.log("Navigation ref not ready or no notification data");
        if (!notificationData) {
          console.log("Notification data is empty");
        }
        if (!navigationRef.current) {
          console.log("Navigation ref is null");
        }
      }
    });
  }, []);

  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <View className="absolute inset-0 z-50 w-90% pointer-events-none">
            <Toaster />
          </View>
          <AppNavigation ref={navigationRef} />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}