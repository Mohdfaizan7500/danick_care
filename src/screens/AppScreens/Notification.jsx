import { Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { FetchNotification, ReadNotification } from '../../lib/api';
import { CheckCircleIcon, CrossCircleIcon } from '../../assets/svgIcons/SVGIcons'; // Update path as needed

const Notification = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { userData } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const payload = {
        technician_id: userData?.id || "1"
      };
      const response = await FetchNotification(payload);
      console.log("Fetch Notification response:", response)

      if (response?.data?.success && response?.data?.data) {
        const transformedData = response.data.data.map(item => ({
          id: item.id.toString(),
          type: mapStatusToType(item.status),
          title: getTitleFromMessage(item.message),
          message: item.message,
          time: formatDateTime(item.date_time),
          status: mapNotificationStatus(item.status),
          isRead: item.read_status === "Read",
          complaint_id: item.complaint_id,
          csn: item.csn, // Add CSN field
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

  const mapStatusToType = (status) => {
    switch (status?.toLowerCase()) {
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

  const getTitleFromMessage = (message) => {
    if (message?.includes('AC')) return 'AC Service Assignment';
    if (message?.includes('RO')) return 'RO Service Assignment';
    if (message?.includes('repair')) return 'Repair Assignment';
    if (message?.includes('assigned')) return 'New Service Assignment';
    return 'Service Notification';
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Just now';

    const parts = dateTimeString.split(' || ');
    if (parts.length === 2) {
      const [date, time] = parts;
      return `${date} at ${time}`;
    }

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

  const mapNotificationStatus = (status) => {
    switch (status?.toLowerCase()) {
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

  const markAsRead = async (notificationId) => {
    try {
      const payload = { id: notificationId };
      const response = await ReadNotification(payload);

      if (response?.data?.success) {
        await fetchNotifications();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  const handleNotificationPress = async (item) => {
    if (!item.isRead) {
      await markAsRead(item.id);
    }

    if (item.complaint_id) {
      console.log('Navigate to complaint:', item.complaint_id);
    }
  };

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

  const getIconColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'assigned':
        return '#3B82F6';
      case 'cancelled':
        return '#EF4444';
      case 'pending':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'read':
        return notifications.filter(n => n.isRead);
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

  

  const renderNotificationItem = ({ item }) => {
    const containerClass = !item.isRead
      ? 'bg-teal-50 border border-teal-500'
      : 'bg-white border border-gray-200';

    const iconName = getIconForNotification(item.title, item.type, item.message);
    const iconColor = getIconColor(item.status);

    return (
      <TouchableOpacity
        className={`flex-row p-4 mx-4 mb-3 rounded-xl ${containerClass}`}
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

          {/* Complaint ID and CSN Section - Each on separate line */}
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

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Icon name="access-time" size={14} color={!item.isRead ? '#6B7280' : '#9CA3AF'} />
              <Text className={`text-xs ml-1 ${!item.isRead ? 'text-gray-600' : 'text-gray-400'}`}>{item.time}</Text>
            </View>

            {/* Status Icons for Completed/Cancelled */}
            {item.status === 'completed' && (
              <CheckCircleIcon width={16} height={16} />
            )}
            {item.status === 'cancelled' && (
              <CrossCircleIcon width={16} height={16} />
            )}
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
        {count > 0 && (
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
    const readCount = notifications.filter(n => n.isRead).length;
    const totalCount = notifications.length;

    return (
      <View className="bg-white">
       
        <View className="flex-row px-4 pb-4">
          <TabButton title="All" tabName="all" count={totalCount} />
          <TabButton title="Unread" tabName="unread" count={unreadCount} />
          <TabButton title="Read" tabName="read" count={readCount} />
        </View>

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
            activeTab === 'read' ? 'mark-email-unread' :
              'notifications-none'
        }
        size={64}
        color="#E5E7EB"
      />
      <Text className="text-lg text-gray-400 mt-4">
        {loading ? 'Loading notifications...' :
          activeTab === 'unread' ? 'No unread notifications' :
            activeTab === 'read' ? 'No read notifications' :
              'No notifications yet'}
      </Text>
      {activeTab !== 'all' && !loading && notifications.length > 0 && (
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