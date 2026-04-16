import "./global.css"
import { Text, View, Alert } from "react-native";
import { AuthProvider } from './src/context/AuthContext';
import AppNavigation from './src/navigation/AppNavigation';
import { Toaster } from 'sonner-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ToastProvider } from 'react-native-toast-notifications'
import { useNotification } from './src/notification/useNotification';
import { useEffect } from "react";
import messaging from '@react-native-firebase/messaging';

export default function App() {
    // useNotification();

    useEffect(() => {
        // Updated onMessage handler for v22+
        const unsubscribe = messaging().onMessage(async (remoteMessage) => {
            console.log('FCM Message:', JSON.stringify(remoteMessage));
            Alert.alert(
                remoteMessage.notification?.title || 'New Notification', 
                remoteMessage.notification?.descrption || 'You have a new message'
            );
        });

        // Check for initial notification
        messaging().getInitialNotification().then(remoteMessage => {
            if (remoteMessage) {
                console.log('App opened from notification:', remoteMessage);
            }
        });

        // Handle background/quit state notifications
        messaging().setBackgroundMessageHandler(async remoteMessage => {
            console.log('Background notification:', remoteMessage);
        });

        return unsubscribe;
    }, []);

    return (
        <AuthProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <SafeAreaProvider>
                    <View className="absolute inset-0 z-50 w-90% pointer-events-none">
                        <Toaster />
                    </View>
                    <AppNavigation />
                </SafeAreaProvider>
            </GestureHandlerRootView>
        </AuthProvider>
    );
}