import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from '../../screens/AppScreens/Tabs/BottamTabs'; // Fix typo in import
import SparePartScreen from '../../screens/AppScreens/SparePartScreen';
import PartDetails from '../../screens/AppScreens/PartDetails';
import Complaints from '../../screens/AppScreens/Complaints/Complaints';
import Bucket from '../../screens/AppScreens/Bucket/Bucket';
import AMC from '../../screens/AppScreens/AMC';
import PreBooking from '../../screens/AppScreens/PreBooking';
import PayOut from '../../screens/AppScreens/Payout/PayOut';
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
import QRCodes from '../../screens/AppScreens/QRCodes/QRCodes';
import QRCodeDetails from '../../screens/AppScreens/QRCodes/QRCodeDetails';
import AMCList from '../../screens/AppScreens/Complaints/AMCList';
import ComplaintAMCDetails from '../../screens/AppScreens/Complaints/AMCDetails';
import AMCBilling from '../../screens/AppScreens/Complaints/AMCBilling';
import Parts from '../../screens/AppScreens/Tabs/Parts';
import Services from '../../screens/AppScreens/Services';
import MyAmc from '../../screens/AppScreens/MyAmc';
import CompleteAMCDetails from '../../screens/AppScreens/CompleteAMCDetails';
import { useEffect, useRef } from 'react';
import { setNotificationNavigationHandler } from '../../notification/useNotification';
// import BottomTabs from 
const Stack = createNativeStackNavigator();

// App Stack (for authenticated users)
const AppStack = () => {
   const navigationRef = useRef(null);
    console.log("Navigation ref created:", navigationRef);

  useEffect(() => {
    setNotificationNavigationHandler((notificationData) => {
      console.log('Handling notification navigation:', notificationData);

      if (notificationData ) {
        // console.log("Navigation ref is ready:", navigationRef.current);

        // Extract screen from notification data - prioritize body and title
        let targetScreen = notificationData.screen ||
          notificationData.body ||
          notificationData.title ||
          notificationData.type;

        // Check for complaint-related data
        const hasComplaintData = notificationData.complaintId ||
          notificationData.complaint_id ||
          notificationData.id ||
          (targetScreen && targetScreen.toLowerCase().includes('complaint'));

        console.log("Target screen:", targetScreen);
        console.log("Has complaint data:", hasComplaintData);

        // Navigate based on notification data
        if (hasComplaintData || (targetScreen && targetScreen.toLowerCase() === 'complaints')) {
          console.log("Attempting to navigate to Complaints screen");

          // Get complaint ID from various possible fields
          const complaintId = notificationData.complaintId ||
            notificationData.complaint_id ||
            notificationData.id;

          navigationRef.current?.navigate('Complaints', {
            complaintId: complaintId,
            complaintData: notificationData,
            screen: 'complaints'
          });
        }
        else if (targetScreen && (targetScreen.toLowerCase().includes('chat') || targetScreen.toLowerCase() === 'chat')) {
          navigationRef.current?.navigate('Chat', {
            chatId: notificationData.chatId || notificationData.id
          });
        }
        else if (targetScreen && (targetScreen.toLowerCase().includes('order') || targetScreen.toLowerCase() === 'orders')) {
          console.log("Attempting to navigate to Orders tab");
          navigationRef.current?.navigate('BottomTabs', {
            screen: 'Orders',
            params: {
              orderId: notificationData.orderId
            }
          });
        }
        else if (targetScreen && (targetScreen.toLowerCase().includes('profile') || targetScreen.toLowerCase() === 'profile')) {
          navigationRef.current?.navigate('BottomTabs', {
            screen: 'Profile'
          });
        }
        else if (targetScreen && (targetScreen.toLowerCase().includes('home') || targetScreen.toLowerCase() === 'home')) {
          navigationRef.current?.navigate('BottomTabs', {
            screen: 'Home'
          });
        }
        else if (targetScreen && (targetScreen.toLowerCase().includes('parts') || targetScreen.toLowerCase() === 'parts')) {
          navigationRef.current?.navigate('BottomTabs', {
            screen: 'Parts'
          });
        }
        else if (targetScreen && (targetScreen.toLowerCase().includes('scan') || targetScreen.toLowerCase() === 'scan')) {
          navigationRef.current?.navigate('BottomTabs', {
            screen: 'Scan'
          });
        }
        else {
          console.log('Unknown navigation target, defaulting to Complaints:', targetScreen);
          // Default to Complaints screen if we have any data
          if (notificationData && Object.keys(notificationData).length > 0) {
            navigationRef.current?.navigate('Complaints', {
              notificationData: notificationData
            });
          } else {
            // If no data, go to Home
            navigationRef.current?.navigate('BottomTabs', {
              screen: 'Home'
            });
          }
        }
      } else {
        console.log("Navigation ref not ready or no notification data");
        if (!notificationData) {
          console.log("Notification data is empty");
        }
        if (!navigationRef.current) {
          console.log("Navigation ref is null");
        }
      }
    });
  }, []);

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
      <Stack.Screen name="QRCodes" component={QRCodes} />
      <Stack.Screen name="QRCodeDetails" component={QRCodeDetails} />
      <Stack.Screen name="AMCList" component={AMCList} />
      <Stack.Screen name="ComplaintAMCDetails" component={ComplaintAMCDetails} />
      <Stack.Screen name="AMCBilling" component={AMCBilling} />
      <Stack.Screen name="Parts" component={Parts} />
      <Stack.Screen name="Services" component={Services} />
      <Stack.Screen name="MyAmc" component={MyAmc} />
      <Stack.Screen name="CompleteAMCDetails" component={CompleteAMCDetails} />









    </Stack.Navigator>
  )
}

export default AppStack;