import { StyleSheet, Text, Alert, Pressable, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './Home';
import Orders from './Orders';
import Profile from './Profile';
import Parts from './Parts';
import Scan from '../Scan/Scan';
import { HomeIcon, OrderIcon, PartIcon, PendingIcon, ProfileIcon, ScanIcon } from '../../../assets/svgIcons/SVGIcons';
import { Colors } from '../../../constants/Color';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PendingComplaintCount } from '../../../lib/api';
import { OrderProvider } from '../../../context/OrderContext';
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
  const { IsOnline, user } = useAuth(); // Assuming user object contains technician_id and city_id
  const insets = useSafeAreaInsets();
  const [orderCount, setOrderCount] = useState(0);

  const refreshOrderCount = (newCount) => {
    if (newCount !== undefined) {
      setOrderCount(newCount);
    } else {
      // Fetch fresh count if no value provided
      fetchOrderCount();
    }
  };

  // Fetch order count on mount and periodically
  useEffect(() => {
    if (IsOnline) {
      fetchOrderCount();

      // Refresh count every 30 seconds
      const interval = setInterval(fetchOrderCount, 30000);

      return () => clearInterval(interval);
    }
  }, [IsOnline, user]); // Re-run when user changes

  const fetchOrderCount = async () => {
    try {
      if (!IsOnline) return;

      // Get technician_id and city_id from auth context
      const technicianId = user?.id || user?.id || "1";
      const cityId = user?.city_id || "1";

      const payload = {
        city_id: cityId,
        technician_id: technicianId
      };

      console.log('Fetching order count with payload on bottomtab:', payload);

      const response = await PendingComplaintCount(payload);

      // Handle response
      if (response?.data?.success) {
        const count = response.data.Pendingcomplaints || 0;
        setOrderCount(count);
        console.log('Order count updated:', count);
      } else if (response?.success) {
        const count = response.Pendingcomplaints || 0;
        setOrderCount(count);
        console.log('Order count updated:', count);
      } else {
        console.log('Unexpected response format:', response);
        setOrderCount(0);
      }

    } catch (error) {
      console.error('Error fetching order count:', error);
      // Don't show alert to user for count errors, just log
    }
  };

  return (
    <OrderProvider>
      <Tab.Navigator
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
    </OrderProvider>
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
  labelBadge: {
    backgroundColor: '#FF4444',
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    marginLeft: 4,
  },
  labelBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
});