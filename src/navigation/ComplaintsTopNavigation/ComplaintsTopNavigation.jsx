// src/navigation/ComplaintsTopNavigation/ComplaintsTopNavigation.js
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import React, { useRef, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useRoute } from '@react-navigation/native';
import Header from '../../components/Header';
import AllComplaints from '../../screens/AppScreens/ComplaintsNav/AllComplaints';
import Assigned from '../../screens/AppScreens/ComplaintsNav/Assigned';
import OnProgress from '../../screens/AppScreens/ComplaintsNav/OnProgress';
import Complete from '../../screens/AppScreens/ComplaintsNav/Complete';
import Cancel from '../../screens/AppScreens/ComplaintsNav/Cancel';
import { getDeshBoardCount } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../context/DashboardContext';

const Tab = createMaterialTopTabNavigator();

// Custom Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation, position, counts }) => {
  const scrollViewRef = useRef(null);
  const tabRefs = useRef({});
  const { width } = useWindowDimensions();

  const getDisplayLabel = routeName => {
    const labels = {
      AllComplaints: 'All',
      Assigned: 'Assigned',
      OnProgress: 'On Progress',
      Complete: 'Complete',
      Cancel: 'Cancelled',
    };
    return labels[routeName] || routeName;
  };

  const getTabCount = routeName => {
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
        }}>
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
              navigation.navigate(route.name);
            }
          };

          const opacity = position.interpolate({
            inputRange,
            outputRange: inputRange.map(i => (i === index ? 1 : 0.6)),
          });

          return (
            <Pressable
              key={route.key}
              ref={ref => (tabRefs.current[index] = ref)}
              onPress={onPress}
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
              }}>
              <Animated.Text
                style={{
                  opacity,
                  color: isFocused ? '#059669' : '#4B5563',
                  fontSize: 12,
                  fontWeight: isFocused ? '600' : '500',
                  textAlign: 'center',
                }}>
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
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 10,
                      fontWeight: '600',
                    }}>
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
  const route = useRoute();
  console.log('========== COMPLAINTS TOP NAVIGATION ==========');
  console.log('Full route params:', route?.params);

  // Get tab parameter from deep linking
  const tabParam = route?.params?.tab;
  const statusParam = route?.params?.status;

  console.log('Tab param:', tabParam);
  console.log('Status param:', statusParam);

  // Determine initial tab
  let initialTabName = 'AllComplaints';

  if (tabParam === 'assign' || statusParam === 'Assign') {
    initialTabName = 'Assigned';
    console.log('✅ Navigating to ASSIGNED tab');
  } else if (tabParam === 'all' || statusParam === 'All') {
    initialTabName = 'AllComplaints';
    console.log('✅ Navigating to ALL tab');
  } else if (tabParam === 'onworking' || statusParam === 'Onworking') {
    initialTabName = 'OnProgress';
    console.log('✅ Navigating to ON PROGRESS tab');
  } else if (tabParam === 'complete' || statusParam === 'Complete') {
    initialTabName = 'Complete';
    console.log('✅ Navigating to COMPLETE tab');
  } else if (tabParam === 'cancel' || statusParam === 'Cancel') {
    initialTabName = 'Cancel';
    console.log('✅ Navigating to CANCELLED tab');
  } else {
    console.log('⚠️ No valid tab parameter, defaulting to ALL tab');
  }

  console.log('Initial tab name:', initialTabName);
  console.log('================================================');

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

  const fetchDashboardCounts = async () => {
    try {
      setLoading(true);
      const payload = {
        technician_id: user?.id?.toString() || '1',
        city_id: user?.city_id?.toString(),
      };

      console.log('Fetching dashboard counts with payload:', payload);

      const response = await getDeshBoardCount(payload);
      console.log('Dashboard counts response:', response);

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
        console.log('Dashboard counts updated - Assign count:', data.assign);
      }
    } catch (error) {
      console.error('Error fetching dashboard counts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardCounts();
    if (registerRefreshFunction) {
      registerRefreshFunction(fetchDashboardCounts);
    }
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title={'Complaints'} />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loaderText}>Loading complaints...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title={'Complaints'} />
      <View style={styles.tabContainer}>
        <Tab.Navigator
          initialRouteName={initialTabName}
          tabBar={props => <CustomTabBar {...props} counts={dashboardCounts} />}
          screenOptions={{
            swipeEnabled: true,
            animationEnabled: true,
            lazy: true,
            tabBarStyle: { backgroundColor: 'white' },
            tabBarIndicatorStyle: { backgroundColor: '#059669', height: 3 },
            tabBarActiveTintColor: '#059669',
            tabBarInactiveTintColor: '#4B5563',
          }}>
          <Tab.Screen
            name="AllComplaints"
            component={AllComplaints}
            options={{ title: 'All' }}
          />
          <Tab.Screen
            name="Assigned"
            component={Assigned}
            options={{ title: 'Assigned' }}
          />
          <Tab.Screen
            name="OnProgress"
            component={OnProgress}
            options={{ title: 'On Progress' }}
          />
          <Tab.Screen
            name="Complete"
            component={Complete}
            options={{ title: 'Complete' }}
          />
          <Tab.Screen
            name="Cancel"
            component={Cancel}
            options={{ title: 'Cancelled' }}
          />
        </Tab.Navigator>
      </View>
    </SafeAreaView>
  );
};

export default ComplaintsTopNavigation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  tabContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 16,
    color: '#6b7280',
    fontSize: 14,
  },
});