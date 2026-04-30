// ComplaintsTopNavigation.js
import { StyleSheet, Text, View, Pressable, Animated, ScrollView, useWindowDimensions } from 'react-native'
import React, { useRef, useEffect, useState, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../components/Header'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import AllComplaints from '../../screens/AppScreens/ComplaintsNav/AllComplaints';
import Assigned from '../../screens/AppScreens/ComplaintsNav/Assigned';
import OnProgress from '../../screens/AppScreens/ComplaintsNav/OnProgress';
import Complete from '../../screens/AppScreens/ComplaintsNav/Complete';
import Cancel from '../../screens/AppScreens/ComplaintsNav/Cancel';
import { getDeshBoardCount } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useRoute } from '@react-navigation/native';
import { useDashboard } from '../../context/DashboardContext'; // Import the context

const Tab = createMaterialTopTabNavigator();

// Custom Tab Bar Component with auto-scrolling and counts
const CustomTabBar = ({ state, descriptors, navigation, position, counts }) => {
  const scrollViewRef = useRef(null);
  const tabRefs = useRef({});
  const { width } = useWindowDimensions();

  const getDisplayLabel = (routeName) => {
    return {
      'AllComplaints': 'All',
      'Assigned': 'Assigned',
      'OnProgress': 'On Progress',
      'Complete': 'Complete',
      'Cancel': 'Cancelled'
    }[routeName] || routeName;
  };

  const getTabCount = (routeName) => {
    switch (routeName) {
      case 'AllComplaints':
        return counts?.all || 0;
      case 'Assigned':
        return counts?.assign || 0;
      case 'OnProgress':
        return counts?.onworking || 0;
      case 'Complete':
        return counts?.completed || 0;
      case 'Cancel':
        return counts?.cancel || 0;
      default:
        return 0;
    }
  };

  useEffect(() => {
    const currentIndex = state.index;
    const currentTab = tabRefs.current[currentIndex];
    if (currentTab && scrollViewRef.current) {
      currentTab.measureLayout(scrollViewRef.current, (x, y) => {
        scrollViewRef.current?.scrollTo({
          x: x - width / 2 + 40,
          animated: true,
        });
      });
    }
  }, [state.index, width]);

  const handleTabPress = (route, index, onPress) => {
    onPress();
  };

  const inputRange = state.routes.map((_, i) => i);

  return (
    <View style={{ backgroundColor: 'white' }}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          gap: 12,
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
              ref={(ref) => tabRefs.current[index] = ref}
              onPress={() => handleTabPress(route, index, onPress)}
              onLongPress={onLongPress}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: isFocused ? '#ECFDF5' : 'transparent',
                borderWidth: 1,
                borderColor: isFocused ? '#A7F3D0' : '#E5E7EB',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Animated.Text
                style={{
                  opacity,
                  color: isFocused ? '#059669' : '#4B5563',
                  fontSize: 12,
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
      </ScrollView>
    </View>
  );
};

const ComplaintsTopNavigation = () => {
  const routes = useRoute();
  const status = routes.params?.status;
  const [dashboardCounts, setDashboardCounts] = useState({
    all: 0,
    assign: 0,
    onworking: 0,
    completed: 0,
    cancel: 0,
    amc: 0,
    bucket: 0,
    prebooking: 0,
    payout: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { registerRefreshFunction } = useDashboard();

  const initialRoute = (status) => {
    switch (status) {
      case "All":
        return "AllComplaints";
      case "Assign":
        return "Assigned";
      case "Onworking":
        return "OnProgress";
      case "Complete":
        return "Complete";
      case "Cancel":
        return "Cancel";
      default:
        return "AllComplaints";
    }
  }

  const fetchDashboardCounts = async () => {
    try {
      setLoading(true);
      const payload = {
        technician_id: user?.id?.toString() || '1',
      };

      const response = await getDeshBoardCount(payload);


      if (response?.data?.success) {
        const data = response.data;
        setDashboardCounts({
          all: data.all || 0,
          assign: data.assign || 0,
          onworking: data.onworking || 0,
          completed: data.completed || 0,
          cancel: data.cancel || 0,
          amc: data.amc || 0,
          bucket: data.bucket || 0,
          prebooking: data.prebooking || 0,
          payout: data.payout || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard counts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardCounts();
    // Register the refresh function with the context
    registerRefreshFunction(fetchDashboardCounts);
  }, []);

  return (
    <SafeAreaView className='bg-white flex-1' edges={['top']}>
      <Header title={'Complaints'} />
      <View className='flex-1 bg-gray-50'>
        <Tab.Navigator
          initialRouteName={initialRoute(status)}
          tabBar={(props) => <CustomTabBar {...props} counts={dashboardCounts} />}
          screenOptions={{
            swipeEnabled: true,
            animationEnabled: true,
            lazy: true,
          }}
        >
          <Tab.Screen
            name='AllComplaints'
            component={AllComplaints}
            options={{ tabBarLabel: 'All' }}
          />
          <Tab.Screen
            name='Assigned'
            component={Assigned}
            options={{ tabBarLabel: 'Assigned' }}
          />
          <Tab.Screen
            name='OnProgress'
            component={OnProgress}
            options={{ tabBarLabel: 'On Progress' }}
          />
          <Tab.Screen
            name='Complete'
            component={Complete}
            options={{ tabBarLabel: 'Complete' }}
          />
          <Tab.Screen
            name='Cancel'
            component={Cancel}
            options={{ tabBarLabel: 'Cancelled' }}
          />
        </Tab.Navigator>
      </View>
    </SafeAreaView>
  )
}

export default ComplaintsTopNavigation

const styles = StyleSheet.create({})