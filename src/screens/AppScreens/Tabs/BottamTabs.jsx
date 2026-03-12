import { StyleSheet, Text } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Home from './Home'
import Profile from './Profile'
import Parts from './Parts'
import Scan from './Scan'
import { HomeIcon, PartsIcon, ProfileIcon, ScanIcon } from '../../../assets/svgIcons/SVGIcons';
import { Colors } from '../../../constants/Color'
import { ChartArea } from 'lucide-react-native'

const Tab = createBottomTabNavigator()

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // This hides the header for ALL screens
        tabBarActiveTintColor: Colors.brand.primary, // Bright Cyan for active
        tabBarInactiveTintColor: Colors.gray[500], // Darker cyan for inactive
        tabBarStyle: {
          backgroundColor: Colors.background.primary,
          borderTopWidth: 1,
          borderTopColor: Colors.ui.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: Colors.brand.primary, // Darker cyan header
        },
        headerTintColor: Colors.text.inverse,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
          color: Colors.text.inverse,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <HomeIcon
              color={focused ? Colors.brand.primary : Colors.gray[400]}
              size={size}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{
              color: focused ? Colors.brand.primary :  Colors.gray[400],
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
              stroke={focused ? Colors.brand.primary:  Colors.gray[400]}
              size={size}
              width={size}
              height={size}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{
              color: focused ? Colors.brand.primary:  Colors.gray[400],
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
            <PartsIcon
              stroke={focused ? Colors.brand.primary:  Colors.gray[400]}
               size={size}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{
              color: focused ? Colors.brand.primary :  Colors.gray[400],
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
              stroke={focused ? Colors.brand.primary :  Colors.gray[400]}
              size={size}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{
              color: focused ? Colors.brand.primary:  Colors.gray[400],
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
  )
}

export default BottomTabs

const styles = StyleSheet.create({})