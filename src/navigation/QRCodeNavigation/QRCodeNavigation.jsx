import { StyleSheet, Text, View, Pressable, Animated, ScrollView, useWindowDimensions, ActivityIndicator } from 'react-native'
import React, { useRef, useEffect, useState, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../components/Header'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import AllQRCodes from '../../screens/AppScreens/QRCodes/AllQRCodes';

import { getDeshBoardCount } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useRoute } from '@react-navigation/native'

const Tab = createMaterialTopTabNavigator();

// Custom Tab Bar Component with even distribution and counts
const CustomTabBar = ({ state, descriptors, navigation, position, counts }) => {
  const { width } = useWindowDimensions();

  const getDisplayLabel = (routeName) => {
    return {
      'AllQRCodes': 'All',
      'UsedQRCodes': 'Used',
      'FreshQRCodes': 'Fresh'
    }[routeName] || routeName;
  };

  const getTabCount = (routeName) => {
    switch (routeName) {
      case 'AllQRCodes':
        return counts?.allQr || 0;
      case 'UsedQRCodes':
        return counts?.usedQr || 0;
      case 'FreshQRCodes':
        return counts?.unusedQr || 0;
      default:
        return 0;
    }
  };

  const inputRange = state.routes.map((_, i) => i);

  return (
    <View style={{ backgroundColor: 'white', flexDirection: 'row', paddingVertical: 4 }}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const displayLabel = getDisplayLabel(route.name);
        const count = getTabCount(route.name);

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
              borderRadius: 100,
              marginBottom: 5,
              borderWidth: 1,
              backgroundColor: isFocused ? '#ECFDF5' : 'transparent',
              borderColor: isFocused ? '#059669' : '#c7c8ca',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              marginHorizontal:10
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
            {count > 0 && (
              <View
                style={{
                  backgroundColor: isFocused ? '#07c78c' : '#d0d0d0',
                  borderRadius: 12,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  minWidth: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 10,
                    fontWeight: '600',
                  }}
                >
                  {count}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

const QRCodeNavigation = () => {
  const { user } = useAuth();
  const [qrCounts, setQrCounts] = useState({
    allQr: 0,
    usedQr: 0,
    unusedQr: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const route = useRoute();
  const status = route.params.status

  // Fetch dashboard counts from API
  const fetchDashboardCounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        technician_id: user?.id?.toString() || "1",
        city_id: user?.city_id?.toString() || "1"
      };
      
      console.log('Fetching dashboard counts with payload:', payload);
      const response = await getDeshBoardCount(payload);
      console.log('Dashboard counts response:', response);

      if (response?.data?.success) {
        setQrCounts({
          allQr: response.data.allQr || 0,
          usedQr: response.data.usedQr || 0,
          unusedQr: response.data.unusedQr || 0,
        });
      } else {
        setError(response?.data?.message || 'Failed to fetch QR counts');
      }
    } catch (err) {
      console.error('Error fetching dashboard counts:', err);
      setError(err.message || 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardCounts();
  }, []);

  // Function to refresh counts (can be passed to child components)
  const refreshCounts = useCallback(() => {
    fetchDashboardCounts();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className='bg-white flex-1' edges={['top']}>
        <Header title={'QR Codes'} />
        <View className='flex-1 justify-center items-center bg-gray-50'>
          <ActivityIndicator size="large" color="#059669" />
          <Text className="text-gray-500 mt-4">Loading QR codes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className='bg-white flex-1' edges={['top']}>
        <Header title={'QR Codes'} />
        <View className='flex-1 justify-center items-center bg-gray-50 px-4'>
          <Text className="text-red-500 text-base text-center mb-4">{error}</Text>
          <TouchableOpacity
            onPress={fetchDashboardCounts}
            className="bg-teal-600 px-6 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className='bg-white flex-1' edges={['top']}>
      <Header title={'QR Codes'} />
      <View className='flex-1 bg-gray-50'>
        <Tab.Navigator
        initialRouteName={status || 'AllQRCodes'}
          tabBar={(props) => <CustomTabBar {...props} counts={qrCounts} />}
          screenOptions={{
            swipeEnabled: true,
            animationEnabled: true,
            lazy: true,
          }}
        >
          <Tab.Screen 
            name='AllQRCodes' 
            component={AllQRCodes}
            initialParams={{ refreshCounts }}
          />
          <Tab.Screen 
            name='UsedQRCodes' 
            component={AllQRCodes}
            initialParams={{ refreshCounts }}
          />
          <Tab.Screen 
            name='FreshQRCodes' 
            component={AllQRCodes}
            initialParams={{ refreshCounts }}
          />
        </Tab.Navigator>
      </View>
    </SafeAreaView>
  )
}

export default QRCodeNavigation

const styles = StyleSheet.create({});