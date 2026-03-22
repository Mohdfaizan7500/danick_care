import "./global.css"
import { Text, View } from "react-native";
import { AuthProvider } from './src/context/AuthContext'; // Changed from default to named import
import AppNavigation from './src/navigation/AppNavigation';
import { Toaster } from 'sonner-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ToastProvider } from 'react-native-toast-notifications'
export default function App() {
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