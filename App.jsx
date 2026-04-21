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
  useEffect(() => {
    setNotificationNavigationHandler((notificationData) => {
      console.log('Handling notification navigation:', notificationData);

      if (notificationData && navigationRef.current) {
        console.log("Navigation ref is ready:", navigationRef.current);

        // Extract screen from notification data
        let targetScreen = notificationData.screen || notificationData.type || notificationData.title;
        
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
        else if (targetScreen === 'chat' || targetScreen === 'Chat') {
          navigationRef.current?.navigate('Chat', {
            chatId: notificationData.chatId || notificationData.id
          });
        }
        else if (targetScreen === 'order' || targetScreen === 'Order' || targetScreen === 'Orders') {
          console.log("Attempting to navigate to Orders tab");
          navigationRef.current?.navigate('BottomTabs', {
            screen: 'Orders',
            params: {
              orderId: notificationData.orderId
            }
          });
        }
        else if (targetScreen === 'profile' || targetScreen === 'Profile') {
          navigationRef.current?.navigate('BottomTabs', {
            screen: 'Profile'
          });
        }
        else if (targetScreen === 'home' || targetScreen === 'Home') {
          navigationRef.current?.navigate('BottomTabs', {
            screen: 'Home'
          });
        }
        else if (targetScreen === 'parts' || targetScreen === 'Parts') {
          navigationRef.current?.navigate('BottomTabs', {
            screen: 'Parts'
          });
        }
        else if (targetScreen === 'scan' || targetScreen === 'Scan') {
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