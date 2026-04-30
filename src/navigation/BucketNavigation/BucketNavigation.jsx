import { StyleSheet, Text, View, Pressable, Animated, ScrollView, useWindowDimensions, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useRef, useEffect, useState, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../components/Header'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import AllBucket from '../../screens/AppScreens/Bucket/AllBucket';
import { useBucket } from '../../context/BucketContext';
import { useRoute } from '@react-navigation/native'

const Tab = createMaterialTopTabNavigator();

// Custom Tab Bar Component with horizontal scroll
const CustomTabBar = ({ state, descriptors, navigation, position, counts, loading }) => {
  const { width } = useWindowDimensions();
  const scrollViewRef = useRef(null);
  const tabWidths = useRef({});

  const getDisplayLabel = (routeName) => {
    return {
      'AllBucket': 'All',
      'market': 'Market',
      'technician': 'Technician',
      'admin': 'Admin',
      'transfer': 'Transfer',
      'resive': 'Receive'
    }[routeName] || routeName;
  };

  const getTabCount = (routeName) => {
    switch (routeName) {
      case 'AllBucket':
        return counts?.all || 0;
      case 'market':
        return counts?.market || 0;
      case 'technician':
        return counts?.technician || 0;
      case 'admin':
        return counts?.admin || 0;
      case 'transfer':
        return counts?.transfered || 0;
      case 'resive':
        return counts?.received || 0;
      default:
        return 0;
    }
  };

  const inputRange = state.routes.map((_, i) => i);

  // Scroll to the active tab when it changes
  useEffect(() => {
    if (scrollViewRef.current && tabWidths.current[state.index]) {
      let offset = 0;
      for (let i = 0; i < state.index; i++) {
        offset += tabWidths.current[i] || 100;
      }
      const screenWidth = width;
      const activeTabWidth = tabWidths.current[state.index] || 100;
      const scrollTo = offset - (screenWidth / 2) + (activeTabWidth / 2);
      
      scrollViewRef.current.scrollTo({
        x: Math.max(0, scrollTo),
        animated: true,
      });
    }
  }, [state.index, width]);

  const onTabLayout = (index, event) => {
    const { width: tabWidth } = event.nativeEvent.layout;
    tabWidths.current[index] = tabWidth;
  };

  return (
    <View style={{ backgroundColor: 'white' }}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
      >
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
              onLayout={(event) => onTabLayout(index, event)}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 100,
                marginRight: 12,
                borderWidth: 1,
                backgroundColor: isFocused ? '#ECFDF5' : 'transparent',
                borderColor: isFocused ? '#059669' : '#c7c8ca',
                flexDirection: 'row',
                alignItems: 'center',
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
              {loading ? (
                <ActivityIndicator size="small" color={isFocused ? '#059669' : '#999'} />
              ) : count > 0 ? (
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
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const BucketNavigation = () => {
  const { bucketCounts, loading, error, refreshCounts, fetchBucketCounts } = useBucket();
  const route = useRoute();
  const initialTab = route.params?.tab;

  // Initial fetch on mount
  useEffect(() => {
    fetchBucketCounts();
  }, []);

  // Refresh counts function to pass to child components
  const handleRefreshCounts = useCallback(async () => {
    await refreshCounts();
  }, [refreshCounts]);

  if (loading && !bucketCounts.all && !bucketCounts.all !== 0) {
    return (
      <SafeAreaView className='bg-white flex-1' edges={['top']}>
        <Header title={'Bucket'} />
        <View className='flex-1 justify-center items-center bg-gray-50'>
          <ActivityIndicator size="large" color="#059669" />
          <Text className="text-gray-500 mt-4">Loading bucket data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className='bg-white flex-1' edges={['top']}>
        <Header title={'Bucket'} />
        <View className='flex-1 justify-center items-center bg-gray-50 px-4'>
          <Text className="text-red-500 text-base text-center mb-4">{error}</Text>
          <TouchableOpacity
            onPress={fetchBucketCounts}
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
      <Header title={'Bucket'} />
      <View className='flex-1 bg-gray-50'>
        <Tab.Navigator
          initialRouteName={initialTab || 'AllBucket'}
          tabBar={(props) => <CustomTabBar {...props} counts={bucketCounts} loading={loading} />}
          screenOptions={{
            swipeEnabled: true,
            animationEnabled: true,
            lazy: true,
          }}
        >
          <Tab.Screen 
            name='AllBucket' 
            component={AllBucket}
            initialParams={{ refreshCounts: handleRefreshCounts, type: 'all' }}
          />
          <Tab.Screen 
            name='market' 
            component={AllBucket}
            initialParams={{ refreshCounts: handleRefreshCounts, type: 'market' }}
          />
          <Tab.Screen 
            name='technician' 
            component={AllBucket}
            initialParams={{ refreshCounts: handleRefreshCounts, type: 'technician' }}
          />
          <Tab.Screen 
            name='admin' 
            component={AllBucket}
            initialParams={{ refreshCounts: handleRefreshCounts, type: 'admin' }}
          />
          <Tab.Screen 
            name='transfer' 
            component={AllBucket}
            initialParams={{ refreshCounts: handleRefreshCounts, type: 'transfered' }}
          />
          <Tab.Screen 
            name='resive' 
            component={AllBucket}
            initialParams={{ refreshCounts: handleRefreshCounts, type: 'received' }}
          />
        </Tab.Navigator>
      </View>
    </SafeAreaView>
  )
}

export default BucketNavigation

const styles = StyleSheet.create({})