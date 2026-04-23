
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../../screens/AuthScreens/Login';
import Complaints from '../../screens/AppScreens/Complaints/Complaints';
import { useEffect } from 'react';
import { setNotificationNavigationHandler } from '../../notification/useNotification';

const Stack = createNativeStackNavigator()

const AuthStack = () => {


  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen
        name="Complaints"
        component={Complaints}
      />
    </Stack.Navigator>
  )
}

export default AuthStack;

