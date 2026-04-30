import { StyleSheet, Text, View, Pressable, Animated, ScrollView, useWindowDimensions } from 'react-native'
import React, { useRef, useEffect, useState, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../components/Header'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import AllNotification from '../../screens/AppScreens/Notifications/AllNotification';
import Read from '../../screens/AppScreens/Notifications/Read';
import Unread from '../../screens/AppScreens/Notifications/Unread';

const Tab = createMaterialTopTabNavigator();

// Custom Tab Bar Component with even distribution (without counts)
const CustomTabBar = ({ state, descriptors, navigation, position }) => {
  const { width } = useWindowDimensions();

  const getDisplayLabel = (routeName) => {
    return {
      'AllNotification': 'All',
      'Unread': 'Unread',
      'Read': 'Read'
    }[routeName] || routeName;
  };

  const inputRange = state.routes.map((_, i) => i);

  return (
    <View style={{ backgroundColor: 'white', flexDirection: 'row' }}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const displayLabel = getDisplayLabel(route.name);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const opacity = position.interpolate({
          inputRange,
          outputRange: inputRange.map((i) => (i === index ? 1 : 0.6)),
        });

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{
              flex: 1,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 100 ,
              marginBottom:5,
              backgroundColor: isFocused ? '#ECFDF5' : 'transparent',
              borderBottomColor: isFocused ? '#059669' : 'transparent',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Animated.Text
              style={{
                opacity,
                color: isFocused ? '#059669' : '#4B5563',
                fontSize: 14,
                fontWeight: isFocused ? '600' : '500',
                textAlign: 'center',
              }}
            >
              {displayLabel}
            </Animated.Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const NotificationTopNavigation = () => {
  // Simple refresh function that can be passed to children
  const refreshCounts = useCallback(() => {
    // This function can be used by children to trigger refreshes if needed
    console.log('Refresh triggered');
  }, []);

  return (
    <SafeAreaView className='bg-white flex-1' edges={['top']}>
      <Header title={'Notifications'} />
      <View className='flex-1 bg-gray-50'>
        <Tab.Navigator
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{
            swipeEnabled: true,
            animationEnabled: true,
            lazy: true,
          }}
        >
          <Tab.Screen 
            name='AllNotification' 
            component={AllNotification}
            initialParams={{ refreshCounts }}
          />
          <Tab.Screen 
            name='Unread' 
            component={Unread}
            initialParams={{ refreshCounts }}
          />
          <Tab.Screen 
            name='Read' 
            component={Read}
            initialParams={{ refreshCounts }}
          />
        </Tab.Navigator>
      </View>
    </SafeAreaView>
  )
}

export default NotificationTopNavigation

const styles = StyleSheet.create({});