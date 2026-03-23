import { StyleSheet, Text, Alert, Pressable, View } from 'react-native';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './Home';
import Profile from './Profile';
import Parts from './Parts';
import Scan from '../Scan/Scan';
import { HomeIcon, PartIcon, ProfileIcon, ScanIcon } from '../../../assets/svgIcons/SVGIcons';
import { Colors } from '../../../constants/Color';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

// Custom tab bar button that checks online status before navigating
const CustomTabBarButton = ({ children, onPress, isOnline, style, ...props }) => {
  const handlePress = () => {
    if (!isOnline) {
      toast.custom(<StatusMessage type='error' title={'You are oofline, Connect to service center.'}/>,{duration:1000})
      // Alert.alert('No Internet', 'You need an internet connection to access this section.');
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

const BottomTabs = () => {
  const { IsOnline } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.brand.primary,
        tabBarInactiveTintColor: Colors.gray[800],
        tabBarStyle: {
          backgroundColor: Colors.background.primary,
          borderTopWidth: 1,
          borderTopColor: Colors.ui.border,
          paddingBottom: insets.bottom+5,
          paddingTop: 5,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarItemStyle: {
          // This ensures each tab item uses flexbox to center content
          justifyContent: 'center',
          alignItems: 'center',
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
        // Custom button for each tab
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

const styles = StyleSheet.create({});