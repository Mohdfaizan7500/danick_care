import "./global.css"
import { View } from "react-native";
import { AuthProvider } from './src/context/AuthContext';
import AppNavigation from './src/navigation/AppNavigation';
import { Toaster } from 'sonner-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { OrderProvider } from './src/context/OrderContext';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/components/CustomToast';

export default function App() {
  

  return (
    <AuthProvider>

        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
              <View className="absolute inset-0 z-50 w-90% pointer-events-none">
                <Toaster />
              </View>
              <AppNavigation/>
               <Toast config={toastConfig} />
          </SafeAreaProvider>
        </GestureHandlerRootView>
    
    </AuthProvider>
  );
}