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

        // Navigate based on notification data
        const targetScreen = notificationData.screen || notificationData.title;

        switch (targetScreen) {
          case 'chat':
            navigationRef.current?.navigate('Chat', {
              chatId: notificationData.chatId
            });
            break;

          case 'order':
            console.log("Attempting to navigate to Orders tab");
            // Navigate to BottomTabs and then to Orders tab
            navigationRef.current?.navigate('BottomTabs', {
              screen: 'Orders',  // This will open the Orders tab
              params: {
                orderId: notificationData.orderId
              }
            });
            break;

          case 'profile':
            navigationRef.current?.navigate('BottomTabs', {
              screen: 'Profile'
            });
            break;

          case 'home':
            navigationRef.current?.navigate('BottomTabs', {
              screen: 'Home'
            });
            break;

          case 'parts':
            navigationRef.current?.navigate('BottomTabs', {
              screen: 'Parts'
            });
            break;

          case 'scan':
            navigationRef.current?.navigate('BottomTabs', {
              screen: 'Scan'
            });
            break;

          default:
            console.log('Unknown navigation target:', targetScreen);
        }
      } else {
        console.log("Navigation ref not ready yet");
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