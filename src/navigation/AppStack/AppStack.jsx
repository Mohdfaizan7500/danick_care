import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from '../../screens/AppScreens/Tabs/BottamTabs'; // Fix typo in import
import SparePartScreen from '../../screens/AppScreens/SparePartScreen';
import PartDetails from '../../screens/AppScreens/PartDetails';
import Complaints from '../../screens/AppScreens/Complaints/Complaints';
import Bucket from '../../screens/AppScreens/Bucket/Bucket';
import AMC from '../../screens/AppScreens/AMC';
import PreBooking from '../../screens/AppScreens/PreBooking';
import PayOut from '../../screens/AppScreens/Payout/PayOut';
import Wallet from '../../screens/AppScreens/Wallet';
import Notification from '../../screens/AppScreens/Notification';
import ProfileEdit from '../../screens/AppScreens/ProfileEdit';
import ReplaceParts from '../../screens/AppScreens/ReplaceParts';
import TermsConditions from '../../screens/AppScreens/TermsConditions';
import Support from '../../screens/AppScreens/Support';
import MyComplaints from '../../screens/AppScreens/MyComplaints';
import AddPart from '../../screens/AppScreens/Bucket/AddPart';
import ComplaintDetail from '../../screens/AppScreens/Complaints/ComplaintDetail';
import BuckePartDetails from '../../screens/AppScreens/Bucket/BucketpartDetails';
import Billing from '../../screens/AppScreens/Complaints/Billing';
import AddPartBilling from '../../screens/AppScreens/Complaints/AddPartBilling';
import Remarkscreen from '../../screens/AppScreens/Complaints/Remarkscreen';
import AMCDetails from '../../screens/AppScreens/AMCDetails';
import ProductDetails from '../../screens/AppScreens/Scan/ProductDetails';
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
        name="BucketpartDetails"
        component={BuckePartDetails}
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
      <Stack.Screen
        name="MyComplaints"
        component={MyComplaints}
      />
      <Stack.Screen
        name="AddPart"
        component={AddPart}
      />
      <Stack.Screen name="ComplaintDetail" component={ComplaintDetail} />
      <Stack.Screen name="Billing" component={Billing} />
      <Stack.Screen name="AddPartBilling" component={AddPartBilling} />
      <Stack.Screen name="Remarkscreen" component={Remarkscreen} />
      <Stack.Screen name="AMCDetails" component={AMCDetails} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />




    </Stack.Navigator>
  )
}

export default AppStack;