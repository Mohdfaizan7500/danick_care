import { StyleSheet, Text, Pressable, View } from 'react-native';
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
  const { IsOnline } = useAuth();
  const insets = useSafeAreaInsets();
  const { orderCount } = useOrder(); // Get count from context, don't manage local state

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
          height: 80 + insets.bottom,
          paddingBottom: 20,
        },
        tabBarLabelStyle: {
          fontSize: 12,
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
              size={size}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{
              color: focused ? Colors.brand.primary : Colors.gray[600],
              fontSize: 12,
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
                size={size}
              />
              <Badge count={orderCount} />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{
                color: focused ? Colors.brand.primary : Colors.gray[600],
                fontSize: 12,
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
              size={size}
              width={size}
              height={size}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{
              color: focused ? Colors.brand.primary : Colors.gray[600],
              fontSize: 12,
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
              size={size}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{
              color: focused ? Colors.brand.primary : Colors.gray[600],
              fontSize: 12,
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
              size={size}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{
              color: focused ? Colors.brand.primary : Colors.gray[600],
              fontSize: 12,
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