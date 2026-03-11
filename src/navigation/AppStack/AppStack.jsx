import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from '../../screens/AppScreens/Tabs/BottamTabs'; // Fix typo in import
// import BottomTabs from 
const Stack = createNativeStackNavigator();

// App Stack (for authenticated users)
const AppStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="BottomTabs"
      screenOptions={{
        headerShown: false, // Hide header since BottomTabs has its own
      }}
    >
      <Stack.Screen 
        name="BottomTabs" 
        component={BottomTabs} 
      />
    </Stack.Navigator>
  )
}

export default AppStack;