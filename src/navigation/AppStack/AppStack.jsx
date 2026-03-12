import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from '../../screens/AppScreens/Tabs/BottamTabs'; // Fix typo in import
import SparePartScreen from '../../screens/AppScreens/SparePartScreen';
import PartDetails from '../../screens/AppScreens/PartDetails';
import Complaints from '../../screens/AppScreens/Complaints';
import Bucket from '../../screens/AppScreens/Bucket';
import AMC from '../../screens/AppScreens/AMC';
import PreBooking from '../../screens/AppScreens/PreBooking';
import PayOut from '../../screens/AppScreens/PayOut';
import Wallet from '../../screens/AppScreens/Wallet';
import Notification from '../../screens/AppScreens/Notification';
import ProfileEdit from '../../screens/AppScreens/ProfileEdit';
import ReplaceParts from '../../screens/AppScreens/ReplaceParts';
import TermsConditions from '../../screens/AppScreens/TermsConditions';
import Support from '../../screens/AppScreens/Support';



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
      <Stack.Screen
        name="SparePartScreen"
        component={SparePartScreen}
      />
      <Stack.Screen
        name="PartDetails"
        component={PartDetails}
      />
       <Stack.Screen
        name="Complaints"
        component={Complaints}
      />
      <Stack.Screen
        name="Bucket"
        component={Bucket}
      />
      <Stack.Screen
        name="AMC"
        component={AMC}
      />
      <Stack.Screen
        name="PreBooking"
        component={PreBooking}
      />
      <Stack.Screen
        name="PayOut"
        component={PayOut}
      />
       <Stack.Screen
        name="Notification"
        component={Notification}
      />
       <Stack.Screen
        name="Wallet"
        component={Wallet}
      />
       <Stack.Screen
        name="ProfileEdit"
        component={ProfileEdit}
      />
       <Stack.Screen
        name="ReplaceParts"
        component={ReplaceParts}
      />
       <Stack.Screen
        name="TermsConditions"
        component={TermsConditions}
      />
       <Stack.Screen
        name="Support"
        component={Support}
      />
    </Stack.Navigator>
  )
}

export default AppStack;