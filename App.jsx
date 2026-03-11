import "./global.css"
import { Text, View } from "react-native";
import { AuthProvider } from './src/context/AuthContext'; // Changed from default to named import
import AppNavigation from './src/navigation/AppNavigation';

export default function App() {
  return (
    <AuthProvider>
      <AppNavigation />
    </AuthProvider>
  );
}