import { Text, View, FlatList, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { SafeAreaView } from 'react-native-safe-area-context'

const Notification = () => {
  const [activeTab, setActiveTab] = useState('all')

  // Helper function to get icon based on title/type
  const getIconForNotification = (title, type) => {
    const titleLower = title.toLowerCase()
    
    if (titleLower.includes('login')) return 'login'
    if (titleLower.includes('logout')) return 'logout'
    if (titleLower.includes('session')) return 'timer'
    if (titleLower.includes('account activated')) return 'check-circle'
    if (titleLower.includes('account inactive')) return 'pause-circle'
    if (titleLower.includes('welcome back')) return 'waving-hand'
    
    // Service related
    if (titleLower.includes('ac cleaning')) return 'cleaning-services'
    if (titleLower.includes('repair')) return 'engineering'
    if (titleLower.includes('technician assigned')) return 'person'
    if (titleLower.includes('service request')) return 'assignment-turned-in'
    if (titleLower.includes('service completed')) return 'check-circle'
    if (titleLower.includes('service cancelled')) return 'cancel'
    if (titleLower.includes('service declined')) return 'thumb-down'
    if (titleLower.includes('payment pending')) return 'pending'
    if (titleLower.includes('payment successful')) return 'payment'
    if (titleLower.includes('approval pending')) return 'schedule'
    if (titleLower.includes('maintenance due')) return 'warning'
    if (titleLower.includes('reminder')) return 'refresh'
    if (titleLower.includes('session timeout')) return 'timer-off'
    
    // Default icons based on type
    switch(type) {
      case 'login': return 'login'
      case 'logout': return 'logout'
      case 'active': return 'check-circle'
      case 'inactive': return 'pause-circle'
      case 'ac_cleaning': return 'cleaning-services'
      case 'repair': return 'engineering'
      case 'service_assign': return 'assignment-turned-in'
      case 'pending': return 'pending'
      case 'complete': return 'check-circle'
      case 'cancel': return 'cancel'
      default: return 'notifications'
    }
  }

  // Helper function to get icon color based on status
  const getIconColor = (status) => {
    switch(status) {
      case 'success':
      case 'completed':
      case 'accepted':
        return '#10B981' // green
      case 'warning':
      case 'pending':
      case 'reminder':
        return '#F59E0B' // amber
      case 'cancelled':
        return '#EF4444' // red
      case 'inactive':
        return '#6B7280' // gray
      case 'assigned':
        return '#3B82F6' // blue
      default:
        return '#6B7280' // gray
    }
  }

  const notifications = [
    {
      id: '1',
      type: 'login',
      title: 'New Login Detected',
      message: 'Your account was logged in from Chrome on Windows',
      time: '2 min ago',
      status: 'success',
      isRead: false
    },
    {
      id: '2',
      type: 'logout',
      title: 'Session Ended',
      message: 'You have been logged out from another device',
      time: '15 min ago',
      status: 'warning',
      isRead: true
    },
    {
      id: '3',
      type: 'active',
      title: 'Account Activated',
      message: 'Your account has been successfully activated',
      time: '1 hour ago',
      status: 'success',
      isRead: false
    },
    {
      id: '4',
      type: 'inactive',
      title: 'Account Inactive',
      message: 'Your account has been inactive for 30 days',
      time: '2 hours ago',
      status: 'inactive',
      isRead: true
    },
    {
      id: '5',
      type: 'ac_cleaning',
      title: 'AC Cleaning Scheduled',
      message: 'Your AC cleaning service is scheduled for tomorrow',
      time: '3 hours ago',
      status: 'pending',
      isRead: false
    },
    {
      id: '6',
      type: 'repair',
      title: 'Repair Service Assigned',
      message: 'Technician John has been assigned to your repair request',
      time: '5 hours ago',
      status: 'assigned',
      isRead: true
    },
    {
      id: '7',
      type: 'service_assign',
      title: 'Service Request Accepted',
      message: 'Your service request #1234 has been accepted',
      time: '6 hours ago',
      status: 'accepted',
      isRead: false
    },
    {
      id: '8',
      type: 'pending',
      title: 'Payment Pending',
      message: 'Your payment of $50 for AC service is pending',
      time: '1 day ago',
      status: 'pending',
      isRead: true
    },
    {
      id: '9',
      type: 'complete',
      title: 'Service Completed',
      message: 'AC repair service has been completed successfully',
      time: '2 days ago',
      status: 'completed',
      isRead: false
    },
    {
      id: '10',
      type: 'cancel',
      title: 'Service Cancelled',
      message: 'Your scheduled AC cleaning has been cancelled',
      time: '2 days ago',
      status: 'cancelled',
      isRead: true
    },
    {
      id: '11',
      type: 'login',
      title: 'New Login from iPhone',
      message: 'Your account was accessed from iPhone 13',
      time: '3 days ago',
      status: 'success',
      isRead: false
    },
    {
      id: '12',
      type: 'ac_cleaning',
      title: 'AC Cleaning Reminder',
      message: 'Time for your monthly AC filter cleaning',
      time: '3 days ago',
      status: 'reminder',
      isRead: true
    },
    {
      id: '13',
      type: 'repair',
      title: 'Repair Completed',
      message: 'AC compressor repair completed with warranty',
      time: '4 days ago',
      status: 'completed',
      isRead: false
    },
    {
      id: '14',
      type: 'pending',
      title: 'Service Approval Pending',
      message: 'Your repair estimate needs approval',
      time: '5 days ago',
      status: 'pending',
      isRead: true
    },
    {
      id: '15',
      type: 'complete',
      title: 'Payment Successful',
      message: 'Your payment of $75 has been processed',
      time: '5 days ago',
      status: 'completed',
      isRead: false
    },
    {
      id: '16',
      type: 'inactive',
      title: 'Session Timeout',
      message: 'You were logged out due to inactivity',
      time: '6 days ago',
      status: 'inactive',
      isRead: true
    },
    {
      id: '17',
      type: 'service_assign',
      title: 'New Technician Assigned',
      message: 'Mike will handle your AC installation',
      time: '1 week ago',
      status: 'assigned',
      isRead: false
    },
    {
      id: '18',
      type: 'active',
      title: 'Welcome Back!',
      message: 'Your subscription has been reactivated',
      time: '1 week ago',
      status: 'success',
      isRead: true
    },
    {
      id: '19',
      type: 'cancel',
      title: 'Service Declined',
      message: 'You declined the repair estimate',
      time: '1 week ago',
      status: 'cancelled',
      isRead: false
    },
    {
      id: '20',
      type: 'ac_cleaning',
      title: 'AC Maintenance Due',
      message: 'Annual AC maintenance service is due',
      time: '2 weeks ago',
      status: 'warning',
      isRead: true
    }
  ]

  // Filter notifications based on active tab
  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.isRead)
      case 'service':
        return notifications.filter(n =>
          ['ac_cleaning', 'repair', 'service_assign', 'complete', 'pending', 'cancel'].includes(n.type)
        )
      default:
        return notifications
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
      case 'completed':
      case 'accepted':
        return 'bg-green-100 text-green-700'
      case 'warning':
      case 'pending':
      case 'reminder':
        return 'bg-yellow-100 text-yellow-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      case 'inactive':
        return 'bg-gray-100 text-gray-700'
      case 'assigned':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const renderNotificationItem = ({ item }) => {
    const unreadClass = !item.isRead
      ? 'bg-teal-50 border border-teal-500'
      : 'bg-white border border-gray-200'
    
    const iconName = getIconForNotification(item.title, item.type)
    const iconColor = getIconColor(item.status)

    return (
      <TouchableOpacity
        className={`flex-row p-4 mx-4 mb-3 rounded-xl ${unreadClass}`}
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
          <View className="flex-row justify-between items-center mb-1">
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
    )
  }

  const TabButton = ({ title, tabName, count }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tabName)}
      className={`flex-1 py-2 px-4 rounded-full mx-1 ${activeTab === tabName
          ? 'bg-teal-500'
          : 'bg-gray-100'
        }`}
    >
      <View className="flex-row items-center justify-center">
        <Text className={`text-sm font-medium ${activeTab === tabName ? 'text-white' : 'text-gray-600'
          }`}>
          {title}
        </Text>
        {count > 0 && tabName !== 'all' && (
          <View className={`ml-2 px-1.5 py-0.5 rounded-full ${activeTab === tabName ? 'bg-white' : 'bg-gray-300'
            }`}>
            <Text className={`text-xs ${activeTab === tabName ? 'text-teal-500' : 'text-gray-700'
              }`}>
              {count}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )

  const ListHeader = () => {
    const unreadCount = notifications.filter(n => !n.isRead).length
    const serviceCount = notifications.filter(n =>
      ['ac_cleaning', 'repair', 'service_assign', 'complete', 'pending', 'cancel'].includes(n.type)
    ).length

    return (
      <View className="bg-white">
        <View className="flex-row justify-between items-center px-4 py-4">
          <View className="flex-row items-center">
            <Text className="text-2xl font-bold text-gray-800">Notifications</Text>
            {unreadCount > 0 && activeTab === 'all' && (
              <View className="ml-2 bg-teal-500 px-2 py-1 rounded-full">
                <Text className="text-xs text-white font-bold">{unreadCount} new</Text>
              </View>
            )}
          </View>
          <TouchableOpacity>
            <Text className="text-sm text-teal-600 font-medium">Mark all as read</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row px-4 pb-4">
          <TabButton title="All" tabName="all" />
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
    )
  }

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
        {activeTab === 'unread' ? 'No unread notifications' :
          activeTab === 'service' ? 'No service notifications' :
            'No notifications yet'}
      </Text>
      {activeTab !== 'all' && (
        <TouchableOpacity
          onPress={() => setActiveTab('all')}
          className="mt-4 px-4 py-2 bg-teal-500 rounded-full"
        >
          <Text className="text-white text-sm font-medium">View all notifications</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={getFilteredNotifications()}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyComponent}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-4"
      />
    </SafeAreaView>
  )
}

export default Notification