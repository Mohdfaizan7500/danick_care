import { Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { FetchNotification, ReadNotification } from '../../lib/api'; // Update path as needed

const Notification = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { userData } = useAuth(); // Assuming you have userData with technician_id

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const payload = {
        technician_id: userData?.id || "1" // Use dynamic technician_id
      };
      const response = await FetchNotification(payload);
      console.log("Fetch Notification response:",response)
      
      if (response?.data?.success && response?.data?.data) {
        // Transform API data to match component format
        const transformedData = response.data.data.map(item => ({
          id: item.id.toString(),
          type: mapStatusToType(item.status),
          title: getTitleFromMessage(item.message),
          message: item.message,
          time: formatDateTime(item.date_time),
          status: mapNotificationStatus(item.status),
          isRead: item.read_status === "Read",
          complaint_id: item.complaint_id,
          rawData: item
        }));
        setNotifications(transformedData);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  // Helper function to map status to type
  const mapStatusToType = (status) => {
    switch(status?.toLowerCase()) {
      case 'assign':
        return 'service_assign';
      case 'complete':
        return 'complete';
      case 'cancel':
        return 'cancel';
      default:
        return 'service_assign';
    }
  };

  // Helper function to get title from message
  const getTitleFromMessage = (message) => {
    if (message?.includes('AC')) return 'AC Service Assignment';
    if (message?.includes('RO')) return 'RO Service Assignment';
    if (message?.includes('repair')) return 'Repair Assignment';
    if (message?.includes('assigned')) return 'New Service Assignment';
    return 'Service Notification';
  };

  // Helper function to format date/time
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Just now';
    
    // Handle format like "21/04/2026 || 11:51:14 AM"
    const parts = dateTimeString.split(' || ');
    if (parts.length === 2) {
      const [date, time] = parts;
      return `${date} at ${time}`;
    }
    
    // Calculate relative time for recent notifications
    try {
      const [day, month, year] = dateTimeString.split('/');
      const notificationDate = new Date(`${year}-${month}-${day}`);
      const now = new Date();
      const diffTime = Math.abs(now - notificationDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return dateTimeString;
    } catch {
      return dateTimeString;
    }
  };

  // Map notification status to component status
  const mapNotificationStatus = (status) => {
    switch(status?.toLowerCase()) {
      case 'assign':
        return 'assigned';
      case 'complete':
        return 'completed';
      case 'cancel':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const payload = { id: notificationId };
      const response = await ReadNotification(payload);
      
      if (response?.data?.success) {
        // Update local state
        setNotifications(prev =>
          prev.map(item =>
            item.id === notificationId
              ? { ...item, isRead: true }
              : item
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Handle notification press
  const handleNotificationPress = (item) => {

    // Mark as read if not already read
    if (!item.isRead) {
      markAsRead(item.id);
    }
    
    // Navigate to complaint details if complaint_id exists
    if (item.complaint_id) {
      // Navigate to complaint details screen
      // navigation.navigate('ComplaintDetails', { complaintId: item.complaint_id });
      console.log('Navigate to complaint:', item.complaint_id);
    }
  };

  // Helper function to get icon based on message/type
  const getIconForNotification = (title, type, message) => {
    const messageLower = message?.toLowerCase() || '';
    
    if (messageLower.includes('ac')) return 'ac-unit';
    if (messageLower.includes('ro')) return 'water';
    if (messageLower.includes('repair')) return 'build';
    if (messageLower.includes('assigned')) return 'assignment-ind';
    if (type === 'complete') return 'check-circle';
    if (type === 'cancel') return 'cancel';
    if (type === 'service_assign') return 'person-add';
    
    return 'notifications';
  };

  // Helper function to get icon color based on status
  const getIconColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10B981'; // green
      case 'assigned':
        return '#3B82F6'; // blue
      case 'cancelled':
        return '#EF4444'; // red
      case 'pending':
        return '#F59E0B'; // amber
      default:
        return '#6B7280'; // gray
    }
  };

  // Filter notifications based on active tab
  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'service':
        return notifications; // All notifications are service-related from API
      default:
        return notifications;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'assigned':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const markAllAsRead = async () => {
    // Mark all unread notifications one by one
    const unreadNotifications = notifications.filter(n => !n.isRead);
    for (const notification of unreadNotifications) {
      await markAsRead(notification.id);
    }
  };

  const renderNotificationItem = ({ item }) => {
    const unreadClass = !item.isRead
      ? 'bg-teal-50 border border-teal-500'
      : 'bg-white border border-gray-200';

    const iconName = getIconForNotification(item.title, item.type, item.message);
    const iconColor = getIconColor(item.status);

    return (
      <TouchableOpacity
        className={`flex-row p-4 mx-4 mb-3 rounded-xl ${unreadClass}`}
        onPress={() => handleNotificationPress(item)}
      >
        {!item.isRead && (
          <View className="absolute top-4 right-4">
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
            <Text className={`text-base font-semibold flex-1 ${!item.isRead ? 'text-gray-900' : 'text-gray-800'}`}>
              {item.title}
            </Text>
            <View className={`px-2 py-1 rounded-full ml-2 ${getStatusColor(item.status).split(' ')[0]}`}>
              <Text className={`text-xs font-medium ${getStatusColor(item.status).split(' ')[1]}`}>
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text className={`text-sm mb-2 ${!item.isRead ? 'text-gray-700 font-medium' : 'text-gray-600'}`} numberOfLines={2}>
            {item.message}
          </Text>

          <View className="flex-row items-center">
            <Icon name="access-time" size={14} color={!item.isRead ? '#6B7280' : '#9CA3AF'} />
            <Text className={`text-xs ml-1 ${!item.isRead ? 'text-gray-600' : 'text-gray-400'}`}>{item.time}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const TabButton = ({ title, tabName, count }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tabName)}
      className={`flex-1 py-2 px-4 rounded-full mx-1 ${activeTab === tabName
        ? 'bg-teal-500'
        : 'bg-gray-100'
        }`}
    >
      <View className="flex-row items-center justify-center">
        <Text className={`text-sm font-medium ${activeTab === tabName ? 'text-white' : 'text-gray-600'}`}>
          {title}
        </Text>
        {count > 0 && tabName !== 'all' && (
          <View className={`ml-2 px-1.5 py-0.5 rounded-full ${activeTab === tabName ? 'bg-white' : 'bg-gray-300'}`}>
            <Text className={`text-xs ${activeTab === tabName ? 'text-teal-500' : 'text-gray-700'}`}>
              {count}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const ListHeader = () => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const serviceCount = notifications.length;

    return (
      <View className="bg-white">
        {/* Mark all as read button */}
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={markAllAsRead}
            className="flex-row justify-end items-center px-4 pt-2"
          >
            <Icon name="done-all" size={18} color="#14B8A6" />
            <Text className="text-teal-500 text-sm font-medium ml-1">
              Mark all as read
            </Text>
          </TouchableOpacity>
        )}

        {/* Tabs */}
        <View className="flex-row px-4 pb-4">
          <TabButton title="All" tabName="all" count={serviceCount} />
          <TabButton title="Unread" tabName="unread" count={unreadCount} />
          <TabButton title="Service" tabName="service" count={serviceCount} />
        </View>

        {/* Results count */}
        <View className="px-4 pb-2">
          <Text className="text-xs text-gray-500">
            Showing {getFilteredNotifications().length} notifications
          </Text>
        </View>
      </View>
    );
  };

  const EmptyComponent = () => (
    <View className="flex-1 items-center justify-center py-20">
      <Icon
        name={
          activeTab === 'unread' ? 'mark-email-read' :
            activeTab === 'service' ? 'miscellaneous-services' :
              'notifications-none'
        }
        size={64}
        color="#E5E7EB"
      />
      <Text className="text-lg text-gray-400 mt-4">
        {loading ? 'Loading notifications...' :
          activeTab === 'unread' ? 'No unread notifications' :
            activeTab === 'service' ? 'No service notifications' :
              'No notifications yet'}
      </Text>
      {activeTab !== 'all' && !loading && (
        <TouchableOpacity
          onPress={() => setActiveTab('all')}
          className="mt-4 px-4 py-2 bg-teal-500 rounded-full"
        >
          <Text className="text-white text-sm font-medium">View all notifications</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Header
          title="Notifications"
          titlePosition='left'
          showBackButton={true}
          titleStyle="font-bold text-2xl ml-5"
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#14B8A6" />
          <Text className="text-gray-500 mt-4">Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title="Notifications"
        titlePosition='left'
        showBackButton={true}
        titleStyle="font-bold text-2xl ml-5"
      />

      <FlatList
        data={getFilteredNotifications()}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyComponent}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#14B8A6']}
            tintColor="#14B8A6"
          />
        }
      />
    </SafeAreaView>
  );
};

export default Notification;