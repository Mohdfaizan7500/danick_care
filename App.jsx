import "./global.css"
import { Text, View } from "react-native";
import { AuthProvider } from './src/context/AuthContext';
import AppNavigation from './src/navigation/AppNavigation';
import { Toaster } from 'sonner-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ToastProvider } from 'react-native-toast-notifications'
import { useNotification, setNotificationNavigationHandler } from './src/notification/useNotification';
import { useEffect, useRef } from "react";

export default function App() {
  const navigationRef = useRef(null);
  
  // Initialize notifications
  useNotification();

  // Setup navigation handler for notifications
  useEffect(() => {
    setNotificationNavigationHandler((notificationData) => {
      console.log('Handling notification navigation:', notificationData);
      
      if (notificationData && navigationRef.current) {
        // Navigate based on notification data
        switch (notificationData.screen) {
          case 'chat':
            navigationRef.current?.navigate('Chat', { 
              chatId: notificationData.chatId 
            });
            break;
          case 'order':
            navigationRef.current?.navigate('OrderDetails', { 
              orderId: notificationData.orderId 
            });
            break;
          case 'profile':
            navigationRef.current?.navigate('Profile');
            break;
          default:
            console.log('Unknown navigation target:', notificationData.screen);
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
          {/* Pass ref as a prop since functional component might not accept ref directly */}
          <AppNavigation ref={navigationRef} />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}