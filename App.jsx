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
    // <ToastProvider
    //   // placement="top"
    //   // duration={3000}
    //   // animationType="slide-in"
    //   // animationDuration={250}
    //   // successColor="green"
    //   // dangerColor="red"
    //   // warningColor="orange"
    //   // normalColor="gray"
    //   // renderType={{
    //   //   custom_type: (toast) => (
    //   //     <View style={{ padding: 15, backgroundColor: 'grey' }}>
    //   //       <Text>{toast.message}</Text>
    //   //       <Text>{data.title}</Text>

    //   //     </View>
    //   //   )
    //   // }}
    // // You can pass custom styles here if you want a default look
    // >
      <AuthProvider>

        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <Toaster position="top"/>


            <AppNavigation />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </AuthProvider>
    // </ToastProvider>

  );
}