// src/navigation/AppStack/AppStack.js
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from '../../screens/AppScreens/Tabs/BottamTabs';
import SparePartScreen from '../../screens/AppScreens/SparePartScreen';
import PartDetails from '../../screens/AppScreens/PartDetails';
import Complaints from '../../screens/AppScreens/Complaints/Complaints';
import Bucket from '../../screens/AppScreens/Bucket/Bucket';
import AMC from '../../screens/AppScreens/AMC';
import PreBooking from '../../screens/AppScreens/PreBooking';
import PayOut from '../../screens/AppScreens/Payout/PayOut';
import Password from '../../screens/AppScreens/Password';
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
import QRCodeNavigation from '../../navigation/QRCodeNavigation/QRCodeNavigation';
import QRCodeDetails from '../../screens/AppScreens/QRCodes/QRCodeDetails';
import AMCList from '../../screens/AppScreens/Complaints/AMCList';
import ComplaintAMCDetails from '../../screens/AppScreens/Complaints/AMCDetails';
import AMCBilling from '../../screens/AppScreens/Complaints/AMCBilling';
import Parts from '../../screens/AppScreens/Tabs/Parts';
import Services from '../../screens/AppScreens/Services';
import MyAmc from '../../screens/AppScreens/MyAmc';
import ProfileDetails from '../../screens/AppScreens/ProfileDetails';
import CompleteAMCDetails from '../../screens/AppScreens/CompleteAMCDetails';
import { OrderProvider } from '../../context/OrderContext';
import ComplaintsTopNavigation from '../ComplaintsTopNavigation/ComplaintsTopNavigation';
import { DashboardProvider } from '../../context/DashboardContext';
import NotificationTopNavigation from '../../navigation/NotificationTopNavigation/NotificationTopNavigation';
import { NotificationProvider } from '../../context/NotificationContext';
import BucketNavigation from '../BucketNavigation/BucketNavigation';
import { BucketProvider } from '../../context/BucketContext';

const Stack = createNativeStackNavigator();

const AppStack = () => {
  return (
    <DashboardProvider>
      <BucketProvider>
        <NotificationProvider>
          <OrderProvider>
            <Stack.Navigator
              initialRouteName="BottomTabs"
              screenOptions={{
                headerShown: false,
              }}>
              <Stack.Screen name="BottomTabs" component={BottomTabs} />
              <Stack.Screen name="SparePartScreen" component={SparePartScreen} />
              <Stack.Screen name="PartDetails" component={PartDetails} />
              <Stack.Screen name="Complaints" component={Complaints} />
              <Stack.Screen
                name="ComplaintsTopNavigation"
                component={ComplaintsTopNavigation}
              />
              <Stack.Screen name="BucketNavigation" component={BucketNavigation} />
              <Stack.Screen name="BuckePartDetails" component={BuckePartDetails} />
              <Stack.Screen name="AMC" component={AMC} />
              <Stack.Screen name="PreBooking" component={PreBooking} />
              <Stack.Screen name="PayOut" component={PayOut} />
              <Stack.Screen name="Password" component={Password} />
              <Stack.Screen name="ReplaceParts" component={ReplaceParts} />
              <Stack.Screen name="TermsConditions" component={TermsConditions} />
              <Stack.Screen name="Support" component={Support} />
              <Stack.Screen name="MyComplaints" component={MyComplaints} />
              <Stack.Screen name="AddPart" component={AddPart} />
              <Stack.Screen name="ComplaintDetail" component={ComplaintDetail} />
              <Stack.Screen name="Billing" component={Billing} />
              <Stack.Screen name="AddPartBilling" component={AddPartBilling} />
              <Stack.Screen name="Remarkscreen" component={Remarkscreen} />
              <Stack.Screen name="AMCDetails" component={AMCDetails} />
              <Stack.Screen name="ProductDetails" component={ProductDetails} />
              <Stack.Screen name="QRCodeNavigation" component={QRCodeNavigation} />
              <Stack.Screen name="QRCodeDetails" component={QRCodeDetails} />
              <Stack.Screen name="AMCList" component={AMCList} />
              <Stack.Screen
                name="ComplaintAMCDetails"
                component={ComplaintAMCDetails}
              />
              <Stack.Screen name="AMCBilling" component={AMCBilling} />
              <Stack.Screen name="Parts" component={Parts} />
              <Stack.Screen name="Services" component={Services} />
              <Stack.Screen name="MyAmc" component={MyAmc} />
              <Stack.Screen
                name="CompleteAMCDetails"
                component={CompleteAMCDetails}
              />
              <Stack.Screen name="ProfileDetails" component={ProfileDetails} />
              <Stack.Screen
                name="NotificationTopNavigation"
                component={NotificationTopNavigation}
              />
            </Stack.Navigator>
          </OrderProvider>
        </NotificationProvider>
      </BucketProvider>
    </DashboardProvider>
  );
};

export default AppStack;