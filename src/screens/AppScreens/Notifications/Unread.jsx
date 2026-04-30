import { StyleSheet, Text, View, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useAuth } from '../../../context/AuthContext'
import { FetchNotification } from '../../../lib/api'
import { CommonActions } from '@react-navigation/native'

const AllNotification = ({ route }) => {
  const { refreshCounts } = route?.params || {};
  const { user } = useAuth();
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  // Format date/time from API response
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Unknown';
    return dateTimeString; // Return as is "24-04-2026 12:33:57 PM"
  };

  // Get notification status display text and color
  const getNotificationStatus = (status, notificationStatus) => {
    // Use notification_status from API (pending, completed, etc.)
    switch (notificationStatus) {
      case 'pending':
        return { text: 'Pending', color: 'bg-yellow-100 text-yellow-700' };
      case 'completed':
        return { text: 'Completed', color: 'bg-green-100 text-green-700' };
      case 'cancelled':
        return { text: 'Cancelled', color: 'bg-red-100 text-red-700' };
      default:
        return { text: 'Pending', color: 'bg-gray-100 text-gray-700' };
    }
  };

  // Get read status display
  const getReadStatus = (readStatus) => {
    if (readStatus === 'Read') {
      return { text: 'Read', color: 'bg-blue-100 text-blue-700' };
    }
    return { text: 'Unread', color: 'bg-purple-100 text-purple-700' };
  };

  // Get title from message
  const getTitleFromMessage = (message) => {
    if (!message) return 'Notification';
    
    if (message.includes('assigned')) return 'New Complaint Assigned';
    if (message.includes('completed')) return 'Complaint Completed';
    if (message.includes('payment')) return 'Payment Update';
    if (message.includes('cancelled')) return 'Complaint Cancelled';
    if (message.includes('approved')) return 'Part Request Approved';
    if (message.includes('rejected')) return 'Part Request Rejected';
    if (message.includes('reopened')) return 'Complaint Reopened';
    if (message.includes('AMC')) return 'AMC Complaint';
    if (message.includes('CSN')) return 'New Complaint Request';
    
    return 'Notification';
  };

  // Get icon name based on message
  const getIconName = (message, readStatus) => {
    if (readStatus === 'Read') return 'notifications';
    if (message?.includes('payment')) return 'payment';
    if (message?.includes('assigned')) return 'assignment';
    if (message?.includes('approved')) return 'shopping-cart';
    if (message?.includes('rejected')) return 'error';
    if (message?.includes('reopened')) return 'refresh';
    if (message?.includes('AMC')) return 'verified-user';
    if (message?.includes('CSN')) return 'assignment';
    return 'notifications';
  };

  // Get icon color based on message
  const getIconColor = (message, readStatus) => {
    if (readStatus === 'Read') return '#9CA3AF';
    if (message?.includes('payment')) return '#8B5CF6';
    if (message?.includes('assigned')) return '#3B82F6';
    if (message?.includes('approved')) return '#F59E0B';
    if (message?.includes('rejected')) return '#EF4444';
    if (message?.includes('reopened')) return '#F59E0B';
    if (message?.includes('AMC')) return '#8B5CF6';
    if (message?.includes('CSN')) return '#3B82F6';
    return '#6B7280';
  };

  // Get container class based on read status
  const getContainerClass = (readStatus) => {
    if (readStatus === 'Read') {
      return 'bg-white border border-gray-200';
    }
    return 'bg-teal-50 border border-teal-400 shadow-sm';
  };

  // Navigate based on notification status
  const handleNavigation = (notificationStatus) => {
    console.log('Notification status:', notificationStatus);
    
    // Reset all routes and navigate to the target screen
    if (notificationStatus === 'pending') {
      // Navigate to Home screen and reset all routes
       navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            { name: 'BottomTabs',
                params:{
                    screen:"Orders"
                }
             }
          ],
        })
      );
    } else {
      // Navigate to Profile screen and reset all routes
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            { name: 'ComplaintsTopNavigation',
                  params:{
                    status:"Assign"
                }
               
             }
          ],
        })
      );
    }
  };

  // Fetch notifications from API
  const fetchNotifications = async (isRefresh = false) => {
    if (!isMounted.current) return;
    
    try {
      setError(null);
      
      if (!isRefresh) {
        setLoading(true);
      }
      
      const payload = {
        technician_id: user?.id?.toString() || "1",
        read_status: "Unread" // Empty string for all notifications
      };
      
      console.log('Fetching all notifications with payload:', payload);
      const response = await FetchNotification(payload);
      console.log('FetchNotification response:', response);

      if (response?.data?.success && response?.data?.data && isMounted.current) {
        const transformedData = response.data.data.map(item => ({
          id: item.id.toString(),
          title: getTitleFromMessage(item.message),
          message: item.message,
          complaint_id: item.complaint_id,
          csn: item.message.match(/CSN\s*:\s*(\d+)/)?.[1] || null,
          dateTime: item.date_time,
          date: item.date,
          day: item.day,
          month: item.month,
          year: item.year,
          readStatus: item.read_status,
          status: item.status,
          notificationStatus: item.notification_status,
          rawData: item
        }));
        
        setNotifications(transformedData);
        
        if (refreshCounts && !isRefresh && isMounted.current) {
          const unreadCount = transformedData.filter(n => n.readStatus !== "Read").length;
          const readCount = transformedData.filter(n => n.readStatus === "Read").length;
          refreshCounts({
            all: transformedData.length,
            unread: unreadCount,
            read: readCount,
          });
        }
      } else if (response?.data?.success === false) {
        const errorMessage = response?.data?.message || 'Failed to fetch notifications';
        setError(errorMessage);
        setNotifications([]);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      const errorMessage = err.message || 'Network error. Please check your connection.';
      setError(errorMessage);
      setNotifications([]);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications(true);
  };

  const handleNotificationPress = (item) => {
    console.log('Notification pressed:', item.id);
    console.log('Notification status:', item.notificationStatus);
    
    // Navigate based on notification status
    handleNavigation(item.notificationStatus);
  };

  // Initial fetch on mount
  useEffect(() => {
    isMounted.current = true;
    fetchNotifications();
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      fetchNotifications(true);
      return () => {};
    }, [])
  );

  // Loading state
  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#059669" />
        <Text className="text-gray-500 mt-4">Loading notifications...</Text>
      </View>
    );
  }

  // Error state
  if (error && !loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-4">
        <Icon name="error-outline" size={64} color="#EF4444" />
        <Text className="text-red-500 text-base text-center mt-4 mb-2">
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => fetchNotifications()}
          className="mt-4 bg-teal-600 px-6 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-50 py-5 " 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#059669']}
          tintColor="#059669"
          title="Pull to refresh"
          titleColor="#059669"
        />
      }
    >
      {notifications.length > 0 ? (
        notifications.map((item) => {
          const containerClass = getContainerClass(item.readStatus);
          const iconName = getIconName(item.message, item.readStatus);
          const iconColor = getIconColor(item.message, item.readStatus);
          const isUnread = item.readStatus !== "Read";
          const notificationStatusInfo = getNotificationStatus(item.status, item.notificationStatus);
          
          return (
            <TouchableOpacity
              key={item.id}
              className={`flex-row p-4 mx-4 mb-3 rounded-xl ${containerClass}`}
              onPress={() => handleNotificationPress(item)}
              activeOpacity={0.7}
            >
              {isUnread && (
                <View className="absolute top-4 right-4 z-10">
                  <View className="w-2 h-2 rounded-full bg-teal-500" />
                </View>
              )}

              <View className="mr-3">
                <View style={{ backgroundColor: iconColor + '20' }} className="w-12 h-12 rounded-full items-center justify-center">
                  <Icon name={iconName} size={24} color={iconColor} />
                </View>
              </View>

              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1 flex-wrap">
                  <Text className={`text-base font-semibold flex-1 ${isUnread ? 'text-gray-900' : 'text-gray-600'}`}>
                    {item.title}
                  </Text>
                </View>

                <Text className={`text-sm mb-2 ${isUnread ? 'text-gray-700 font-medium' : 'text-gray-500'}`} numberOfLines={2}>
                  {item.message}
                </Text>

                {/* Complaint ID and CSN Section */}
                {(item.complaint_id || item.csn) && (
                  <View className="mb-2">
                    {item.complaint_id && (
                      <View className="flex-row items-center mb-1">
                        <Icon name="assignment" size={14} color="#6B7280" />
                        <Text className="text-xs text-gray-600 ml-1">
                          Complaint ID: <Text className="font-medium">{item.complaint_id}</Text>
                        </Text>
                      </View>
                    )}
                    {item.csn && (
                      <View className="flex-row items-center">
                        <Icon name="receipt" size={14} color="#6B7280" />
                        <Text className="text-xs text-gray-600 ml-1">
                          CSN: <Text className="font-medium">{item.csn}</Text>
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Date/Time and Status Row */}
                <View className="flex-row items-center justify-between mt-1">
                  <View className="flex-row items-center">
                    <Icon name="access-time" size={14} color={isUnread ? '#6B7280' : '#9CA3AF'} />
                    <Text className={`text-xs ml-1 ${isUnread ? 'text-gray-600' : 'text-gray-400'}`}>
                      {item.dateTime}
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center gap-2">
                    {/* Notification Status Badge */}
                    <View className={`px-2 py-0.5 rounded-full ${notificationStatusInfo.color.split(' ')[0]}`}>
                      <Text className={`text-xs font-medium ${notificationStatusInfo.color.split(' ')[1]}`}>
                        {notificationStatusInfo.text}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      ) : (
        <View className="items-center justify-center py-10">
          <Icon name="notifications-none" size={64} color="#D1D5DB" />
          <Text className="text-gray-400 text-base mt-4">No notifications available</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default AllNotification;

const styles = StyleSheet.create({});