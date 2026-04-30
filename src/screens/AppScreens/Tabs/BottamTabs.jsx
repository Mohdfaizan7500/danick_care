import { StyleSheet, Text, Pressable, View, Platform } from 'react-native';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './Home';
import Orders from './Orders';
import Profile from './Profile';
import Parts from './Parts';
import Scan from '../Scan/Scan';
import { HomeIcon, OrderIcon, PartIcon, ProfileIcon, ScanIcon } from '../../../assets/svgIcons/SVGIcons';
import { Colors } from '../../../constants/Color';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrder } from '../../../context/OrderContext';
import { useRoute } from '@react-navigation/native';
import NoInternet from '../../NoInternet';

const Tab = createBottomTabNavigator();

// Helper function to get Android version
const getAndroidVersion = () => {
  if (Platform.OS === 'android') {
    // Get the Android version number (e.g., 13, 14, etc.)
    const androidVersion = Platform.constants?.Release || '';
    const versionNumber = parseInt(androidVersion, 10);
    return isNaN(versionNumber) ? 0 : versionNumber;
  }
  return 0;
};

// Helper function to get Android API level
const getAndroidApiLevel = () => {
  if (Platform.OS === 'android') {
    // Check API level (Android 13 = API level 33)
    const apiLevel = Platform.constants?.ApiLevel || 0;
    return apiLevel;
  }
  return 0;
};

// Custom tab bar button that checks online status before navigating
const CustomTabBarButton = ({ children, onPress, isOnline, style, ...props }) => {
  const handlePress = () => {
    if (!isOnline) {
      toast.custom(<StatusMessage type='error' title={'You are offline, Connect to service center.'} />, { duration: 1000 });
      return;
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        style,
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      {...props}
    >
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </View>
    </Pressable>
  );
};

// Custom badge component
const Badge = ({ count }) => {
  if (!count || count === 0) return null;

  return (
    <View style={styles.badgeContainer}>
      <Text style={styles.badgeText}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};

const BottomTabs = () => {
  const route = useRoute();
  const initialScreen = route.params?.screen || 'Home';
  const screenParams = route.params?.params || {};

  console.log("BottomTabs - initialScreen:", initialScreen);
  console.log("BottomTabs - screenParams:", screenParams);
  console.log("Android Version:", getAndroidVersion());
  console.log("Android API Level:", getAndroidApiLevel());
  console.log("Platform Version:", Platform.Version);
  
  const { IsOnline } = useAuth();
  const insets = useSafeAreaInsets();
  const { orderCount } = useOrder(); // Get count from context, don't manage local state

  // Calculate dynamic tab bar height based on Android version
  const getTabBarHeight = () => {
    const androidVersion = getAndroidVersion();
    const apiLevel = getAndroidApiLevel();
    
    if (Platform.OS === 'android') {
      // For Android 13 (API 33) and above - decrease height
      if (androidVersion >= 13 || apiLevel >= 33) {
        return 50 + insets.bottom;
      } 
      // For Android below 13 - increase height
      else {
        return 70 + insets.bottom;
      }
    } 
    // For iOS or other platforms
    else {
      return 80 + insets.bottom;
    }
  };

  // Calculate dynamic padding bottom based on Android version
  const getTabBarPaddingBottom = () => {
    const androidVersion = getAndroidVersion();
    const apiLevel = getAndroidApiLevel();
    
    if (Platform.OS === 'android') {
      if (androidVersion >= 13 || apiLevel >= 33) {
        return 12; // Reduced padding for Android 13+
      } else {
        return 20; // Original padding for older versions
      }
    }
    return 20;
  };

  // Calculate dynamic icon size based on Android version
  const getIconSize = (defaultSize) => {
    const androidVersion = getAndroidVersion();
    const apiLevel = getAndroidApiLevel();
    
    if (Platform.OS === 'android') {
      if (androidVersion >= 13 || apiLevel >= 33) {
        return defaultSize * 0.9; // Slightly smaller icons for Android 13+
      }
    }
    return defaultSize;
  };

  // Calculate dynamic font size for labels
  const getLabelFontSize = () => {
    const androidVersion = getAndroidVersion();
    const apiLevel = getAndroidApiLevel();
    
    if (Platform.OS === 'android') {
      if (androidVersion >= 13 || apiLevel >= 33) {
        return 11; // Smaller font for Android 13+
      }
    }
    return 12;
  };

  return (
    <Tab.Navigator
      initialRouteName={initialScreen}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.brand.primary,
        tabBarInactiveTintColor: Colors.gray[800],
        tabBarStyle: {
          backgroundColor: Colors.background.primary,
          borderTopWidth: 1,
          borderTopColor: Colors.ui.border,
          height: getTabBarHeight(),
          paddingBottom: getTabBarPaddingBottom(),
        },
        tabBarLabelStyle: {
          fontSize: getLabelFontSize(),
          fontWeight: '500',
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 0,
        },
        headerStyle: {
          backgroundColor: Colors.brand.primary,
        },
        headerTintColor: Colors.text.inverse,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
          color: Colors.text.inverse,
        },
        tabBarButton: (props) => (
          <CustomTabBarButton {...props} isOnline={IsOnline} />
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <HomeIcon
              color={focused ? Colors.brand.primary : Colors.gray[600]}
              size={getIconSize(size)}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{
              color: focused ? Colors.brand.primary : Colors.gray[600],
              fontSize: getLabelFontSize(),
              fontWeight: focused ? '600' : '500'
            }}>
              Home
            </Text>
          ),
          headerTitle: 'Home',
        }}
      />

      <Tab.Screen
        name="Orders"
        component={Orders}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View>
              <OrderIcon
                stroke={focused ? Colors.brand.primary : Colors.gray[600]}
                size={getIconSize(size)}
              />
              <Badge count={orderCount} />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{
                color: focused ? Colors.brand.primary : Colors.gray[600],
                fontSize: getLabelFontSize(),
                fontWeight: focused ? '600' : '500'
              }}>
                Orders
              </Text>
            </View>
          ),
          headerTitle: 'Orders',
        }}
      />

      <Tab.Screen
        name="Scan"
        component={Scan}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <ScanIcon
              stroke={focused ? Colors.brand.primary : Colors.gray[600]}
              size={getIconSize(size)}
              width={getIconSize(size)}
              height={getIconSize(size)}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{
              color: focused ? Colors.brand.primary : Colors.gray[600],
              fontSize: getLabelFontSize(),
              fontWeight: focused ? '600' : '500'
            }}>
              Scan
            </Text>
          ),
          headerTitle: 'Scan',
        }}
      />

      <Tab.Screen
        name="Parts"
        component={Parts}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <PartIcon
              fill={focused ? Colors.brand.primary : Colors.gray[600]}
              size={getIconSize(size)}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{
              color: focused ? Colors.brand.primary : Colors.gray[600],
              fontSize: getLabelFontSize(),
              fontWeight: focused ? '600' : '500'
            }}>
              Parts
            </Text>
          ),
          headerTitle: 'Parts',
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <ProfileIcon
              stroke={focused ? Colors.brand.primary : Colors.gray[600]}
              size={getIconSize(size)}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{
              color: focused ? Colors.brand.primary : Colors.gray[600],
              fontSize: getLabelFontSize(),
              fontWeight: focused ? '600' : '500'
            }}>
              Profile
            </Text>
          ),
          headerTitle: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;

const styles = StyleSheet.create({
  badgeContainer: {
    position: 'absolute',
    top: -10,
    right: -12,
    backgroundColor: '#FF4444',
    borderRadius: 100,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
});